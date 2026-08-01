// GET /api/merchant/webhook-endpoint — the merchant's webhook config (secret included)
// PUT /api/merchant/webhook-endpoint — create/update url, events, is_active
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireVerifiedMerchant, requireActiveMerchant } from "@/lib/guards";
import { generateWebhookSecret } from "@/lib/api-keys";
import { MERCHANT_EVENT_TYPES } from "@/lib/webhooks/enqueue";

function endpointResponse(endpoint: {
  url: string;
  secret: string;
  events: string[];
  is_active: boolean;
  secret_rotated_at: string | null;
  updated_at: string;
}) {
  return {
    url: endpoint.url,
    // Revealed to the authenticated merchant (Stripe-style retrievable secret)
    secret: endpoint.secret,
    events: endpoint.events || [],
    is_active: endpoint.is_active,
    secret_rotated_at: endpoint.secret_rotated_at,
    updated_at: endpoint.updated_at,
  };
}

/** Reject non-https URLs and obvious internal targets in production. */
function validateWebhookUrl(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return "Invalid URL";
  }

  if (process.env.NODE_ENV !== "production") {
    if (!["http:", "https:"].includes(url.protocol)) {
      return "URL must be http(s)";
    }
    return null;
  }

  if (url.protocol !== "https:") return "URL must use https";
  const host = url.hostname.toLowerCase();
  const isPrivate =
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    host === "169.254.169.254" ||
    host === "[::1]";
  if (isPrivate) return "URL must be publicly reachable";
  return null;
}

export async function GET() {
  try {
    const guard = await requireVerifiedMerchant();
    if (guard.error) return guard.error;
    const { merchant } = guard;

    const endpoint = await db("webhook_endpoints")
      .where({ merchant_id: merchant.id })
      .first();

    return Response.json({
      endpoint: endpoint ? endpointResponse(endpoint) : null,
      available_events: MERCHANT_EVENT_TYPES,
    });
  } catch (error) {
    console.error("Webhook endpoint GET error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const guard = await requireActiveMerchant();
    if (guard.error) return guard.error;
    const { merchant } = guard;

    const body = await request.json().catch(() => ({}));
    const existing = await db("webhook_endpoints")
      .where({ merchant_id: merchant.id })
      .first();

    const url: string | undefined =
      body.url !== undefined ? String(body.url).trim() : undefined;
    if (url !== undefined) {
      if (!url) {
        return Response.json({ error: "url is required" }, { status: 400 });
      }
      const urlError = validateWebhookUrl(url);
      if (urlError) return Response.json({ error: urlError }, { status: 400 });
    }

    let events: string[] | undefined;
    if (body.events !== undefined) {
      if (!Array.isArray(body.events)) {
        return Response.json({ error: "events must be an array" }, { status: 400 });
      }
      events = body.events.filter((e: unknown) =>
        (MERCHANT_EVENT_TYPES as readonly string[]).includes(String(e))
      );
    }

    if (!existing) {
      if (!url) {
        return Response.json({ error: "url is required" }, { status: 400 });
      }
      const [endpoint] = await db("webhook_endpoints")
        .insert({
          merchant_id: merchant.id,
          url,
          secret: generateWebhookSecret(),
          events: events || [],
          is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
        })
        .returning("*");
      return Response.json({ endpoint: endpointResponse(endpoint) }, { status: 201 });
    }

    const updates: Record<string, unknown> = { updated_at: db.fn.now() };
    if (url !== undefined) updates.url = url;
    if (events !== undefined) updates.events = events;
    if (body.is_active !== undefined) updates.is_active = Boolean(body.is_active);

    const [endpoint] = await db("webhook_endpoints")
      .where({ merchant_id: merchant.id })
      .update(updates)
      .returning("*");

    return Response.json({ endpoint: endpointResponse(endpoint) });
  } catch (error) {
    console.error("Webhook endpoint PUT error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
