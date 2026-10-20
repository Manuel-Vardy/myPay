import "server-only";
import crypto from "crypto";
import db from "@/lib/db";
import { toMinorUnits, fromMinorUnits, normalizeMsisdn } from "@/lib/utils";
import { isMerchantPaused, PaymentsPausedError } from "@/lib/payments/controls";
import { isCustomerIdentityRequired } from "@/lib/payments";

/**
 * Payment session creation + merchant-facing status, shared by the public
 * API routes (/api/v1/*) and the deprecated /api/payments/initiate alias.
 */

export class PaymentSessionInputError extends Error {}

export interface CreateSessionInput {
  amount: number | string;
  currency?: string;
  description?: string | null;
  redirect_url?: string | null;
  /**
   * Who is paying. A merchant integrating over the API already has this on
   * file, which makes it the best identity we can get — and the only one that
   * works for crypto, where the payer is otherwise anonymous. Recorded on the
   * session, carried onto the transaction, and turned into a customer record
   * when the payment settles.
   */
  customer_email?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
}

/**
 * Who created the session, kept separate from `input` because it comes from
 * the authenticated request, never from the merchant-supplied body — a caller
 * must not be able to attribute its session to someone else's key.
 *
 * `apiKeyId` is required whenever origin is "API": every API-created session
 * from here on names its key, so a compromised key's blast radius is a single
 * query. Link sessions are created by their own handlers, not this function,
 * and carry no key at all.
 */
export interface SessionContext {
  origin: "API" | "DASHBOARD";
  apiKeyId?: string | null;
}

export interface CreatedSession {
  session_id: string;
  payment_url: string;
  amount: number;
  currency: string;
  expires_at: string;
  /** Non-fatal contract problems, e.g. a missing customer_email. */
  warnings?: string[];
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const IDENTITY_WARNING =
  "No customer_email or customer_phone was supplied. One of them identifies " +
  "the payer in your customer directory, and customer_email will become " +
  "required — send it on every session.";

export async function createPaymentSession(
  merchant: {
    id: string;
    user_id: string;
    merchant_display_id: string;
    payments_paused_at?: Date | string | null;
  },
  input: CreateSessionInput,
  context: SessionContext
): Promise<CreatedSession> {
  if (isMerchantPaused(merchant)) {
    throw new PaymentsPausedError();
  }

  // Belt and braces around the DB CHECK: a key on a non-API session, or an
  // API session with no key, means a caller wired attribution wrong, and a
  // mis-attributed payment is worse than a refused one.
  if (context.origin === "API" && !context.apiKeyId) {
    throw new Error("createPaymentSession: an API-origin session requires apiKeyId");
  }
  if (context.origin !== "API" && context.apiKeyId) {
    throw new Error(
      `createPaymentSession: apiKeyId is only valid on an API-origin session (got ${context.origin})`
    );
  }

  const {
    amount,
    currency = "USD",
    description,
    redirect_url,
    customer_name,
  } = input;

  if (amount === undefined || amount === null || amount === "") {
    throw new PaymentSessionInputError("amount is required");
  }
  if (isNaN(Number(amount)) || Number(amount) <= 0) {
    throw new PaymentSessionInputError("amount must be a positive number");
  }

  const warnings: string[] = [];

  const customerEmail = input.customer_email?.trim().toLowerCase() || null;
  if (customerEmail && !EMAIL_PATTERN.test(customerEmail)) {
    throw new PaymentSessionInputError("customer_email is not a valid email address");
  }

  // A malformed phone must never cost the merchant a payment — drop it and
  // say so. The email (or what the payer types at checkout) still identifies
  // them.
  const customerPhone = normalizeMsisdn(input.customer_phone);
  if (input.customer_phone && !customerPhone) {
    warnings.push("customer_phone was not a recognisable phone number and was ignored.");
  }

  // A session identifies its payer by email or by phone. Phone alone is
  // enough — it is the primary match key on mobile money, and it is what the
  // direct charge API always has — so only a session with neither is a gap.
  if (!customerEmail && !customerPhone) {
    if (await isCustomerIdentityRequired()) {
      throw new PaymentSessionInputError("customer_email is required");
    }
    warnings.push(IDENTITY_WARNING);
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  const [session] = await db("payment_sessions")
    .insert({
      id: crypto.randomUUID(),
      merchant_id: merchant.id,
      amount: toMinorUnits(amount),
      currency,
      description: description || null,
      redirect_url: redirect_url || null,
      status: "ACTIVE",
      expires_at: expiresAt,
      customer_email: customerEmail,
      customer_name: customer_name?.trim() || null,
      customer_phone: customerPhone,
      origin: context.origin,
      api_key_id: context.apiKeyId ?? null,
    })
    .returning("*");

  await db("system_logs").insert({
    level: "INFO",
    source: "GATEWAY_API",
    event_description:
      `Payment session created: ${session.id} for ${fromMinorUnits(session.amount)} ${currency} ` +
      `by merchant ${merchant.merchant_display_id}` +
      // The log is the audit trail a compliance officer reads; naming the key
      // there means attribution survives even if the session row is purged.
      (context.apiKeyId ? ` via API key ${context.apiKeyId}` : ""),
    actor_id: merchant.user_id,
  });

  // Surface the gap where an admin will see it — a merchant ignoring the
  // response warnings is otherwise invisible until their directory is empty.
  if (!customerEmail && !customerPhone) {
    await db("system_logs").insert({
      level: "WARN",
      source: "GATEWAY_API",
      event_description: `Payment session ${session.id} created without customer_email by merchant ${merchant.merchant_display_id}`,
      actor_id: merchant.user_id,
    });
  }

  // Payment URLs must point at the checkout deployment (pay.trite.tech in
  // prod), not whichever service handled this request
  const baseUrl =
    process.env.NEXT_PUBLIC_CHECKOUT_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000";

  return {
    session_id: session.id,
    payment_url: `${baseUrl}/pay/${session.id}`,
    amount: fromMinorUnits(session.amount),
    currency: session.currency,
    expires_at: session.expires_at,
    ...(warnings.length > 0 ? { warnings } : {}),
  };
}

export interface ApiKeySessionUsage {
  /** Every session the key has ever created — a leaked key's blast radius. */
  session_count: number;
  /**
   * The part that still matters right now. Revoking a key stops new requests
   * but does not touch the sessions it already minted (see migration 0034),
   * so these keep taking money until they expire. "Live" is what checkout
   * itself enforces — ACTIVE *and* not past expires_at — which is stricter
   * than the status-only sweep in expireActiveSessionsForMerchant.
   */
  live_session_count: number;
}

/**
 * Session counts per API key, for the keys given. Keys with nothing to their
 * name are absent from the map, so callers should default to zero.
 *
 * Sessions created before migration 0047 carry no api_key_id, so a key older
 * than that deployment can count zero here while its last_used_at shows real
 * traffic. That gap is closed for everything created since.
 */
export async function sessionUsageByApiKey(
  apiKeyIds: string[]
): Promise<Map<string, ApiKeySessionUsage>> {
  if (apiKeyIds.length === 0) return new Map();

  const rows: Array<{ api_key_id: string } & ApiKeySessionUsage> = await db(
    "payment_sessions"
  )
    .whereIn("api_key_id", apiKeyIds)
    .groupBy("api_key_id")
    .select("api_key_id")
    .select(
      db.raw("COUNT(*)::int AS session_count"),
      db.raw(
        `COUNT(*) FILTER (
           WHERE "status" = 'ACTIVE' AND "expires_at" > now()
         )::int AS live_session_count`
      )
    );

  return new Map(
    rows.map((row) => [
      row.api_key_id,
      {
        session_count: row.session_count,
        live_session_count: row.live_session_count,
      },
    ])
  );
}

/**
 * Merchant-facing session status: the session row plus its latest
 * transaction, read-only (no provider polling — the payer flow does that).
 * Returns null when the session doesn't exist or belongs to another merchant,
 * so callers can 404 without leaking session existence.
 */
export async function getPaymentSessionStatus(
  sessionId: string,
  merchantId: string
): Promise<Record<string, unknown> | null> {
  const session = await db("payment_sessions")
    .where({ id: sessionId, merchant_id: merchantId })
    .first();
  if (!session) return null;

  const transaction = await db("transactions")
    .where({ payment_session_id: sessionId })
    .orderBy("created_at", "desc")
    .first();

  return {
    session_id: session.id,
    status: session.status,
    amount: fromMinorUnits(session.amount),
    currency: session.currency,
    description: session.description,
    expires_at: session.expires_at,
    created_at: session.created_at,
    transaction: transaction
      ? {
          transaction_id: transaction.id,
          tx_id_display: transaction.tx_id_display,
          status: transaction.status,
          method: transaction.method,
          amount: fromMinorUnits(transaction.amount),
          currency: transaction.currency,
          failure_reason: transaction.failure_reason || null,
          created_at: transaction.created_at,
          updated_at: transaction.updated_at,
        }
      : null,
  };
}
