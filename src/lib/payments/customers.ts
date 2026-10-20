import "server-only";
import crypto from "crypto";
import type { Knex } from "knex";
import type { Transaction } from "@/lib/types";
import { hashPassword } from "@/lib/auth";
import { notifyAdmins } from "@/lib/admin-alerts";
import { normalizeMsisdn } from "@/lib/utils";

/**
 * Turning a settled payment into a customer record.
 *
 * A `customers` row is merchant-specific relationship data only — tier, notes,
 * status. Everything personal (name, email, phone) lives on the `users` row it
 * points at, so linking a payer means finding or creating a user first.
 *
 * Called from the two settlement helpers, never at payment initiation: every
 * field a hosted-checkout payer submits is attacker-controlled and free to
 * rotate per attempt, so creating accounts from unsettled attempts would let
 * anyone mint junk users for free. Settling costs real money.
 */

interface ResolvedIdentity {
  msisdn: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
}

/**
 * Split a free-text name into the two columns `users` actually has. Anything
 * past the first token is the surname — "Kwame Nkrumah Jr" keeps "Nkrumah Jr"
 * together rather than dropping it.
 */
function splitName(full: string | null | undefined): {
  firstName: string | null;
  lastName: string | null;
} {
  const parts = (full || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: null, lastName: null };
  return {
    firstName: parts[0],
    lastName: parts.length > 1 ? parts.slice(1).join(" ") : null,
  };
}

/**
 * Pull whatever identifies the payer out of a transaction.
 *
 * `payer_phone` is normalised at write time, but transactions predating that
 * (and the raw MSISDN kept in metadata for provider debugging) are not, so
 * everything goes through `normalizeMsisdn` again here — matching only works
 * if both sides agree on the spelling.
 */
function resolveIdentity(transaction: Transaction): ResolvedIdentity {
  const metadata =
    typeof transaction.metadata === "string"
      ? (JSON.parse(transaction.metadata || "{}") as Record<string, unknown>)
      : transaction.metadata || {};

  const rawPhone =
    transaction.payer_phone || (metadata.mobile_money_number as string | undefined);

  const email = transaction.payer_email?.trim().toLowerCase() || null;
  const { firstName, lastName } = splitName(transaction.payer_name);

  return { msisdn: normalizeMsisdn(rawPhone), email, firstName, lastName };
}

/**
 * Find the `users` row this payer already has, if any.
 *
 * MSISDN first: it is unique among customers by index, and on mobile money it
 * is the value the payer proved control of by approving the prompt. Email is
 * the fallback, and matches across every role — a merchant paying through
 * someone else's link is the same person, not a second account.
 */
async function findExistingUser(
  trx: Knex.Transaction,
  identity: ResolvedIdentity
): Promise<{ id: string; email: string | null; mobile_number: string | null; first_name: string | null; last_name: string | null } | undefined> {
  if (identity.msisdn) {
    const byPhone = await trx("users")
      .where({ mobile_number: identity.msisdn, role: "CUSTOMER" })
      .first();
    if (byPhone) return byPhone;
  }

  if (identity.email) {
    const byEmail = await trx("users").whereRaw("lower(email) = ?", [identity.email]).first();
    if (byEmail) return byEmail;
  }

  return undefined;
}

/**
 * Link a settled transaction to a customer record for its merchant, creating
 * the underlying user and the merchant relationship if this is their first
 * payment. Stamps `transactions.customer_id` so the directory's spend
 * aggregates can find the payment.
 *
 * Idempotent: re-running against the same transaction resolves to the same
 * user and conflicts away on the customer link, so a webhook delivered twice
 * cannot produce a second customer.
 *
 * Returns the `users.id` it linked, or null when the transaction carries no
 * usable identity — a crypto payment with no merchant-supplied email, most
 * often. That is an ordinary outcome, not a failure.
 */
export async function linkTransactionCustomer(
  trx: Knex.Transaction,
  transaction: Transaction
): Promise<string | null> {
  const identity = resolveIdentity(transaction);

  if (!identity.msisdn && !identity.email) return null;

  let user = await findExistingUser(trx, identity);

  if (!user) {
    // Payers never chose a password. A random one keeps the NOT NULL
    // constraint satisfied and the account unusable until they claim it
    // through the normal reset flow.
    const placeholderHash = await hashPassword(crypto.randomUUID());

    const inserted = await trx("users")
      .insert({
        email: identity.email,
        password_hash: placeholderHash,
        role: "CUSTOMER",
        first_name: identity.firstName,
        last_name: identity.lastName,
        mobile_number: identity.msisdn,
      })
      .onConflict()
      .ignore()
      .returning("*");

    user = inserted[0];

    // Conflict means a concurrent settlement for the same payer won the race;
    // its row is the one to use.
    if (!user) user = await findExistingUser(trx, identity);
    if (!user) return null;
  } else {
    // Fill gaps only. A payer who set their own name or email outranks
    // whatever was typed into a checkout form.
    const updates: Record<string, string> = {};
    if (identity.email && !user.email) updates.email = identity.email;
    if (identity.msisdn && !user.mobile_number) updates.mobile_number = identity.msisdn;
    if (identity.firstName && !user.first_name) {
      updates.first_name = identity.firstName;
      if (identity.lastName && !user.last_name) updates.last_name = identity.lastName;
    }

    if (Object.keys(updates).length > 0) {
      await trx("users").where({ id: user.id }).update(updates);
    }
  }

  await trx("customers")
    .insert({
      merchant_id: transaction.merchant_id,
      user_id: user.id,
      tier: "STANDARD",
    })
    .onConflict(["merchant_id", "user_id"])
    .ignore();

  await trx("transactions")
    .where({ id: transaction.id })
    .update({ customer_id: user.id });

  return user.id;
}

/**
 * `linkTransactionCustomer` wrapped so it can never take a settlement down
 * with it.
 *
 * Settlement runs as one transaction — the ledger entries, the fee, the
 * merchant webhook — so a throw anywhere inside it would roll back money that
 * has already moved at the provider. Directory bookkeeping is not worth that.
 * The nested knex transaction compiles to a SAVEPOINT, so a failure here
 * rolls back only the customer writes and the settlement still commits.
 */
export async function tryLinkTransactionCustomer(
  trx: Knex.Transaction,
  transaction: Transaction,
  source: string
): Promise<void> {
  try {
    await trx.transaction(async (savepoint) => {
      await linkTransactionCustomer(savepoint, transaction);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Customer link failed for ${transaction.tx_id_display}:`, error);

    // Outer transaction is still healthy — only the savepoint rolled back.
    await trx("system_logs").insert({
      level: "WARN",
      source,
      event_description: `Customer link failed for settled tx ${transaction.tx_id_display}: ${message}`,
      metadata: JSON.stringify({
        transaction_id: transaction.id,
        merchant_id: transaction.merchant_id,
      }),
    });

    // Swallowing this error is what keeps a settlement safe, but it also means
    // the payment quietly ends up with no customer_id and nobody finds out.
    // Tell an admin, so the drift gets repaired via the customers backfill
    // rather than surfacing months later as a merchant asking where their
    // customer went.
    //
    // Deliberately not awaited: notifyAdmins writes and emails on its own
    // connection, and the settlement transaction is still open here, holding a
    // row lock. A single dedupe key for every transaction is intentional too —
    // the useful signal is "linking is broken", not one alert per payment.
    notifyAdmins({
      category: "SYSTEM_ALERT",
      severity: "WARN",
      title: "Customer linking failed after settlement",
      message:
        `Payment ${transaction.tx_id_display} settled but could not be linked to a customer ` +
        `(${message}). The payment itself is unaffected. Re-run the customer backfill to repair ` +
        `this and any others once the cause is fixed.`,
      dedupeKey: "customer-link-failed",
      metadata: {
        transaction_id: transaction.id,
        merchant_id: transaction.merchant_id,
        source,
      },
    }).catch(() => null);
  }
}
