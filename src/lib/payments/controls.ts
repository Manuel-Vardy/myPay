import "server-only";
import db from "@/lib/db";
import type { Knex } from "knex";

/**
 * Merchant-level payment acceptance controls.
 *
 * A payment SESSION is the instrument that actually accepts money: once one
 * exists, /api/payments/process will keep taking payments against it for its
 * full 24h TTL, regardless of the API key or payment link that created it.
 * So every control that stops a merchant taking money has to do two things:
 * block new sessions AND expire the outstanding ones. Doing only the first
 * is what let payments keep arriving after a merchant revoked their only key
 * and deleted their payment link.
 */

/** Thrown by session-creation paths when the merchant isn't accepting payments. */
export class PaymentsPausedError extends Error {
  constructor(message = "This merchant is not currently accepting payments") {
    super(message);
    this.name = "PaymentsPausedError";
  }
}

export function isMerchantPaused(merchant: {
  payments_paused_at?: Date | string | null;
}): boolean {
  return Boolean(merchant.payments_paused_at);
}

/**
 * Expire every ACTIVE session belonging to a payment link. Call before
 * deactivating or deleting the link — the FK is ON DELETE SET NULL, so once
 * the link row is gone its sessions can no longer be found by link.
 * Returns the number of sessions expired.
 */
export async function expireSessionsForLink(
  linkId: string,
  executor: Knex | Knex.Transaction = db
): Promise<number> {
  return executor("payment_sessions")
    .where({ payment_link_id: linkId, status: "ACTIVE" })
    .update({ status: "EXPIRED", updated_at: executor.fn.now() });
}

/** Expire every ACTIVE session for a merchant, across all channels. */
export async function expireActiveSessionsForMerchant(
  merchantId: string,
  executor: Knex | Knex.Transaction = db
): Promise<number> {
  return executor("payment_sessions")
    .where({ merchant_id: merchantId, status: "ACTIVE" })
    .update({ status: "EXPIRED", updated_at: executor.fn.now() });
}

interface SetPauseParams {
  merchantId: string;
  /** User performing the action — the merchant's own user, or an admin. */
  actorId: string;
  /** "MERCHANT_PORTAL" or "ADMIN_ACTION" — used for the audit log source. */
  source: "MERCHANT_PORTAL" | "ADMIN_ACTION";
  reason?: string | null;
}

/**
 * Pause a merchant's payments: block new sessions and expire outstanding
 * ones in a single transaction, so nothing can be paid after this returns.
 */
export async function pauseMerchantPayments(
  params: SetPauseParams
): Promise<{ sessionsExpired: number }> {
  const { merchantId, actorId, source, reason } = params;

  return db.transaction(async (trx) => {
    const merchant = await trx("merchants")
      .where({ id: merchantId })
      .forUpdate()
      .first();
    if (!merchant) throw new Error(`Merchant ${merchantId} not found`);

    await trx("merchants").where({ id: merchantId }).update({
      payments_paused_at: trx.fn.now(),
      payments_paused_by: actorId,
      payments_paused_reason: reason?.trim()?.slice(0, 500) || null,
      updated_at: trx.fn.now(),
    });

    // The whole point: outstanding sessions stop accepting money too.
    const sessionsExpired = await expireActiveSessionsForMerchant(merchantId, trx);

    await trx("system_logs").insert({
      level: "WARN",
      source,
      event_description:
        `Payments PAUSED for merchant ${merchant.merchant_display_id} ` +
        `(${sessionsExpired} active session(s) expired)` +
        (reason ? ` — reason: ${reason}` : ""),
      actor_id: actorId,
    });

    return { sessionsExpired };
  });
}

/** Resume a merchant's payments. Expired sessions are NOT revived. */
export async function resumeMerchantPayments(
  params: Omit<SetPauseParams, "reason">
): Promise<void> {
  const { merchantId, actorId, source } = params;

  await db.transaction(async (trx) => {
    const merchant = await trx("merchants")
      .where({ id: merchantId })
      .forUpdate()
      .first();
    if (!merchant) throw new Error(`Merchant ${merchantId} not found`);

    await trx("merchants").where({ id: merchantId }).update({
      payments_paused_at: null,
      payments_paused_by: null,
      payments_paused_reason: null,
      updated_at: trx.fn.now(),
    });

    await trx("system_logs").insert({
      level: "INFO",
      source,
      event_description: `Payments RESUMED for merchant ${merchant.merchant_display_id}`,
      actor_id: actorId,
    });
  });
}
