import "server-only";
import crypto from "crypto";
import db from "@/lib/db";
import { toMinorUnits, fromMinorUnits } from "@/lib/utils";
import { isMerchantPaused, PaymentsPausedError } from "@/lib/payments/controls";

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
}

export interface CreatedSession {
  session_id: string;
  payment_url: string;
  amount: number;
  currency: string;
  expires_at: string;
}

export async function createPaymentSession(
  merchant: {
    id: string;
    user_id: string;
    merchant_display_id: string;
    payments_paused_at?: Date | string | null;
  },
  input: CreateSessionInput
): Promise<CreatedSession> {
  if (isMerchantPaused(merchant)) {
    throw new PaymentsPausedError();
  }

  const { amount, currency = "USD", description, redirect_url } = input;

  if (amount === undefined || amount === null || amount === "") {
    throw new PaymentSessionInputError("amount is required");
  }
  if (isNaN(Number(amount)) || Number(amount) <= 0) {
    throw new PaymentSessionInputError("amount must be a positive number");
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
    })
    .returning("*");

  await db("system_logs").insert({
    level: "INFO",
    source: "GATEWAY_API",
    event_description: `Payment session created: ${session.id} for ${fromMinorUnits(session.amount)} ${currency} by merchant ${merchant.merchant_display_id}`,
    actor_id: merchant.user_id,
  });

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
  };
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
