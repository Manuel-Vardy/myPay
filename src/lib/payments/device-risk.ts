// ============================================================
// Device intelligence for hosted checkout (Fingerprint Pro).
//
// Trust boundary: the checkout page sends the identification *event id*, not
// the visitor id. A visitor id posted straight from a browser is worthless —
// an attacker running card tests fabricates a fresh one per attempt, which is
// exactly the case this exists to catch. We exchange the event id for the
// authoritative result via Fingerprint's Server API, which also carries the
// Smart Signals (bot, VPN, tampering) that the browser never sees.
//
// Fails open, deliberately: a Fingerprint outage must not stop real payments.
// An unresolved device yields no visitor id and no flag, and records why in
// `reasons` so the gap shows up in the admin ledger instead of looking like a
// clean transaction.
//
// Scoring only flags — it never rejects. Blocking a payer on a device signal
// is a business policy call with a false-positive cost measured in lost
// revenue, so the decision stays with the admin reviewing the flag queue.
// ============================================================

import type { Knex } from "knex";
import type { FlagLevel } from "@/lib/types";

// ---------- Config ----------

/** Base URLs per Fingerprint region. `us` is the unprefixed default. */
const SERVER_API_HOSTS: Record<string, string> = {
  us: "https://api.fpjs.io",
  eu: "https://eu.api.fpjs.io",
  ap: "https://ap.api.fpjs.io",
};

/** Budget for the Server API call. Checkout waits on this, so keep it tight. */
const SERVER_API_TIMEOUT_MS = 3000;

/**
 * Velocity window and thresholds. Tuned for card/MoMo testing, where the tell
 * is a burst of attempts from one device inside minutes, not a merchant with
 * genuinely repeat customers on a shared machine.
 */
const VELOCITY_WINDOW_MINUTES = 60;
const ATTEMPTS_MEDIUM = 5;
const ATTEMPTS_HIGH = 10;
/** Distinct payer phone/email from one device — the card-testing signature. */
const PAYER_ROTATION_MEDIUM = 3;
const PAYER_ROTATION_HIGH = 5;
/** One device paying several unrelated merchants in an hour. */
const MERCHANT_SPREAD_MEDIUM = 3;

// ---------- Types ----------

export interface DeviceSignals {
  /** Fingerprint botd verdict: "notDetected" | "good" | "bad". */
  bot: string | null;
  vpn: boolean | null;
  incognito: boolean | null;
  /** Browser tampering / spoofed environment. */
  tampering: boolean | null;
  /** 0–100; higher is more suspicious. Requires Smart Signals. */
  suspectScore: number | null;
  /** IP as Fingerprint saw it — not the same as our edge's view. */
  ip: string | null;
}

export interface DeviceIntelligence {
  /** Authoritative visitor id, or null when identification failed open. */
  visitorId: string | null;
  eventId: string | null;
  /** True only when the Server API confirmed the event. */
  verified: boolean;
  signals: DeviceSignals;
  flagLevel: FlagLevel;
  /** Machine-readable rule hits, e.g. ["payer_rotation", "confirmed_bot"]. */
  reasons: string[];
}

/** What the checkout page sends. Both fields are untrusted. */
export interface DeviceClaim {
  event_id?: unknown;
  visitor_id?: unknown;
}

const EMPTY_SIGNALS: DeviceSignals = {
  bot: null,
  vpn: null,
  incognito: null,
  tampering: null,
  suspectScore: null,
  ip: null,
};

function unidentified(reason: string): DeviceIntelligence {
  return {
    visitorId: null,
    eventId: null,
    verified: false,
    signals: EMPTY_SIGNALS,
    flagLevel: "NONE",
    reasons: [reason],
  };
}

// ---------- Server API ----------

/**
 * Shape of GET /events/{eventId}. Every product is optional — which ones come
 * back depends on the subscription's enabled Smart Signals — so this is read
 * defensively rather than validated.
 */
interface EventsResponse {
  products?: {
    identification?: { data?: { visitorId?: string; requestId?: string } };
    botd?: { data?: { bot?: { result?: string } } };
    vpn?: { data?: { result?: boolean } };
    incognito?: { data?: { result?: boolean } };
    tampering?: { data?: { result?: boolean } };
    suspectScore?: { data?: { result?: number } };
    ipInfo?: { data?: { v4?: { address?: string }; v6?: { address?: string } } };
  };
}

async function fetchEvent(eventId: string): Promise<EventsResponse | null> {
  const apiKey = process.env.FINGERPRINT_SERVER_API_KEY;
  if (!apiKey) return null;

  const region = process.env.NEXT_PUBLIC_FINGERPRINT_REGION || "us";
  const host = SERVER_API_HOSTS[region] ?? SERVER_API_HOSTS.us;

  const res = await fetch(`${host}/events/${encodeURIComponent(eventId)}`, {
    headers: { "Auth-API-Key": apiKey, Accept: "application/json" },
    signal: AbortSignal.timeout(SERVER_API_TIMEOUT_MS),
    cache: "no-store",
  });

  if (!res.ok) {
    // 404 is routine, not an outage: the event expired (Fingerprint keeps them
    // briefly) or was never real, which is itself what a forged claim looks like.
    throw new Error(`Fingerprint events API returned ${res.status}`);
  }

  return (await res.json()) as EventsResponse;
}

function readSignals(event: EventsResponse): DeviceSignals {
  const p = event.products ?? {};
  return {
    bot: p.botd?.data?.bot?.result ?? null,
    vpn: p.vpn?.data?.result ?? null,
    incognito: p.incognito?.data?.result ?? null,
    tampering: p.tampering?.data?.result ?? null,
    suspectScore: p.suspectScore?.data?.result ?? null,
    ip: p.ipInfo?.data?.v4?.address ?? p.ipInfo?.data?.v6?.address ?? null,
  };
}

// ---------- Velocity ----------

interface Velocity {
  attempts: number;
  distinctPayers: number;
  distinctMerchants: number;
}

/**
 * Counts this device's recent footprint. Called before the current
 * transaction is inserted, so the in-flight attempt is excluded by
 * construction and the thresholds read as "prior attempts".
 */
async function loadVelocity(db: Knex, visitorId: string): Promise<Velocity> {
  const since = new Date(Date.now() - VELOCITY_WINDOW_MINUTES * 60_000);

  const row = await db("transactions")
    .where({ device_visitor_id: visitorId })
    .andWhere("created_at", ">=", since)
    .select(
      db.raw("count(*)::int as attempts"),
      db.raw(
        "count(distinct coalesce(payer_phone, payer_email))::int as distinct_payers"
      ),
      db.raw("count(distinct merchant_id)::int as distinct_merchants")
    )
    .first<{
      attempts: number;
      distinct_payers: number;
      distinct_merchants: number;
    }>();

  return {
    attempts: row?.attempts ?? 0,
    distinctPayers: row?.distinct_payers ?? 0,
    distinctMerchants: row?.distinct_merchants ?? 0,
  };
}

// ---------- Scoring ----------

const FLAG_ORDER: FlagLevel[] = ["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"];

function highest(a: FlagLevel, b: FlagLevel): FlagLevel {
  return FLAG_ORDER.indexOf(a) >= FLAG_ORDER.indexOf(b) ? a : b;
}

function score(
  signals: DeviceSignals,
  velocity: Velocity
): { flagLevel: FlagLevel; reasons: string[] } {
  let flagLevel: FlagLevel = "NONE";
  const reasons: string[] = [];

  const raise = (level: FlagLevel, reason: string) => {
    flagLevel = highest(flagLevel, level);
    reasons.push(reason);
  };

  // Automation. "bad" is Fingerprint's confident verdict; "good" means a
  // declared crawler, which has no business on a checkout page either.
  if (signals.bot === "bad") raise("HIGH", "confirmed_bot");
  else if (signals.bot === "good") raise("MEDIUM", "declared_bot");

  if (signals.tampering) raise("MEDIUM", "browser_tampering");

  // VPN and incognito are weak on their own — plenty of legitimate payers use
  // both — so they only ever contribute corroborating LOW.
  if (signals.vpn) raise("LOW", "vpn");
  if (signals.incognito) raise("LOW", "incognito");

  if (signals.suspectScore !== null && signals.suspectScore >= 50) {
    raise("MEDIUM", "high_suspect_score");
  }

  if (velocity.distinctPayers >= PAYER_ROTATION_HIGH) {
    raise("HIGH", "payer_rotation");
  } else if (velocity.distinctPayers >= PAYER_ROTATION_MEDIUM) {
    raise("MEDIUM", "payer_rotation");
  }

  if (velocity.attempts >= ATTEMPTS_HIGH) raise("HIGH", "attempt_velocity");
  else if (velocity.attempts >= ATTEMPTS_MEDIUM) raise("MEDIUM", "attempt_velocity");

  if (velocity.distinctMerchants >= MERCHANT_SPREAD_MEDIUM) {
    raise("MEDIUM", "merchant_spread");
  }

  return { flagLevel, reasons };
}

// ---------- Entry point ----------

/**
 * Resolves and scores the payer's device for one checkout attempt.
 *
 * Never throws: every failure path degrades to an unflagged, unidentified
 * result so the payment can proceed.
 */
export async function assessDevice(
  db: Knex,
  claim: DeviceClaim | null | undefined
): Promise<DeviceIntelligence> {
  const eventId = typeof claim?.event_id === "string" ? claim.event_id : null;
  if (!eventId) return unidentified("no_device_claim");

  if (!process.env.FINGERPRINT_SERVER_API_KEY) {
    // Public key alone can identify in the browser but cannot verify here, and
    // an unverified visitor id is not worth storing — it would let an attacker
    // dodge every velocity rule by inventing a new one each attempt.
    return unidentified("server_api_not_configured");
  }

  let event: EventsResponse | null;
  try {
    event = await fetchEvent(eventId);
  } catch (error) {
    console.warn("Fingerprint event lookup failed:", error);
    return unidentified("identification_unavailable");
  }

  const visitorId = event?.products?.identification?.data?.visitorId ?? null;
  if (!event || !visitorId) return unidentified("identification_incomplete");

  const signals = readSignals(event);

  let velocity: Velocity = {
    attempts: 0,
    distinctPayers: 0,
    distinctMerchants: 0,
  };
  try {
    velocity = await loadVelocity(db, visitorId);
  } catch (error) {
    // Signal-only scoring is still worth having if the velocity query fails.
    console.warn("Device velocity lookup failed:", error);
  }

  const { flagLevel, reasons } = score(signals, velocity);

  return {
    visitorId,
    eventId,
    verified: true,
    signals,
    flagLevel,
    reasons,
  };
}

/** Compact form for `transactions.metadata.device`. */
export function toMetadata(device: DeviceIntelligence) {
  return {
    visitor_id: device.visitorId,
    event_id: device.eventId,
    verified: device.verified,
    flag_level: device.flagLevel,
    reasons: device.reasons,
    signals: device.signals,
  };
}
