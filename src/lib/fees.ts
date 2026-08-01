// ============================================================
// Fee engine: resolves fee_schedules, calculates amounts in
// bigint minor units, and records charges in fee_ledger plus
// the double-entry ledger (DEBIT merchant float / CREDIT PSP_FEE).
// ============================================================

import type { Knex } from "knex";
import crypto from "crypto";
import db from "@/lib/db";
import type {
  FeeType,
  FeeSchedule,
  MerchantTier,
  PaymentMethod,
  PaymentRail,
  TieredBand,
} from "@/lib/types";

export interface FeeContext {
  merchantId: string;
  merchantTier?: MerchantTier | null;
  rail?: PaymentRail | null;
  method?: PaymentMethod | null;
  currency: string;
}

const APPLICABILITY_PRECEDENCE = `
  CASE applicability
    WHEN 'MERCHANT_SPECIFIC' THEN 0
    WHEN 'MERCHANT_TIER' THEN 1
    ELSE 2
  END
`;

/**
 * Pick the active schedule for a fee type with precedence
 * MERCHANT_SPECIFIC > MERCHANT_TIER > ALL_MERCHANTS.
 *
 * Schedules with a flat component (or min/max caps) are currency-bound;
 * pure PERCENTAGE/TIERED schedules apply regardless of currency.
 */
export async function resolveFeeSchedule(
  conn: Knex,
  feeType: FeeType,
  ctx: FeeContext
): Promise<FeeSchedule | null> {
  const query = conn("fee_schedules")
    .where({ fee_type: feeType, is_active: true })
    .where("valid_from", "<=", conn.fn.now())
    .where((qb) => {
      qb.whereNull("valid_until").orWhere("valid_until", ">", conn.fn.now());
    })
    .where((qb) => {
      qb.where((s) =>
        s
          .where("applicability", "MERCHANT_SPECIFIC")
          .andWhere("merchant_id", ctx.merchantId)
      ).orWhere("applicability", "ALL_MERCHANTS");
      if (ctx.merchantTier) {
        qb.orWhere((s) =>
          s
            .where("applicability", "MERCHANT_TIER")
            .andWhere("merchant_tier", ctx.merchantTier!)
        );
      }
    })
    .where((qb) => {
      // currency-bound only when a flat component or cap is involved
      qb.where("currency", ctx.currency).orWhere((s) =>
        s
          .whereIn("calculation_method", ["PERCENTAGE", "TIERED"])
          .andWhere("flat_amount", 0)
          .whereNull("minimum_amount")
          .whereNull("maximum_amount")
      );
    });

  const rail = ctx.rail;
  if (rail) {
    query.where((qb) => {
      qb.whereNull("applicable_rails").orWhereRaw(
        "? = ANY (applicable_rails)",
        [rail]
      );
    });
  } else {
    query.whereNull("applicable_rails");
  }

  const method = ctx.method;
  if (method) {
    query.where((qb) => {
      qb.whereNull("applicable_methods").orWhereRaw(
        "? = ANY (applicable_methods)",
        [method]
      );
    });
  } else {
    query.whereNull("applicable_methods");
  }

  const schedule = await query
    .orderByRaw(APPLICABILITY_PRECEDENCE)
    .orderBy("valid_from", "desc")
    .first();

  return schedule ?? null;
}

/** Percentage math on bigints: basis * rate% with half-up rounding. */
function applyPercentage(basis: bigint, rate: number): bigint {
  // rate has 4 decimal places (numeric(6,4)); scale to an integer.
  const rateScaled = BigInt(Math.round(rate * 10_000));
  // divide by 10_000 (rate scale) and 100 (percent)
  return (basis * rateScaled + 500_000n) / 1_000_000n;
}

/**
 * Compute the fee for a schedule against a basis amount (minor units).
 */
export function calculateFee(schedule: FeeSchedule, basisAmount: bigint): bigint {
  const flat = BigInt(String(schedule.flat_amount ?? 0));
  const rate = Number(schedule.percentage_rate ?? 0);

  let fee: bigint;
  switch (schedule.calculation_method) {
    case "FLAT":
      fee = flat;
      break;
    case "PERCENTAGE":
      fee = applyPercentage(basisAmount, rate);
      break;
    case "FLAT_PLUS_PERCENTAGE":
      fee = flat + applyPercentage(basisAmount, rate);
      break;
    case "TIERED": {
      const bands: TieredBand[] = Array.isArray(schedule.tiered_bands)
        ? schedule.tiered_bands
        : [];
      const band = bands.find(
        (b) =>
          basisAmount >= BigInt(String(b.from ?? 0)) &&
          (b.to == null || basisAmount <= BigInt(String(b.to)))
      );
      fee = band ? applyPercentage(basisAmount, Number(band.rate)) : 0n;
      break;
    }
    default:
      fee = 0n;
  }

  if (schedule.minimum_amount != null) {
    const min = BigInt(String(schedule.minimum_amount));
    if (fee < min) fee = min;
  }
  if (schedule.maximum_amount != null) {
    const max = BigInt(String(schedule.maximum_amount));
    if (fee > max) fee = max;
  }
  return fee < 0n ? 0n : fee;
}

/**
 * Read-only quote for display (e.g. checkout page). Returns 0n when no
 * schedule applies.
 */
export async function quoteFee(
  feeType: FeeType,
  ctx: FeeContext,
  basisAmount: bigint
): Promise<bigint> {
  const schedule = await resolveFeeSchedule(db, feeType, ctx);
  if (!schedule) return 0n;
  return calculateFee(schedule, basisAmount);
}

export async function ensureLedgerAccount(
  trx: Knex.Transaction,
  ownerId: string | null,
  accountType: string,
  currency: string,
  label: string
) {
  let account = await trx("ledger_accounts")
    .where({ owner_id: ownerId, account_type: accountType, currency })
    .first();
  if (!account) {
    [account] = await trx("ledger_accounts")
      .insert({ owner_id: ownerId, account_type: accountType, currency, label })
      .returning("*");
  }
  return account;
}

interface ChargeParams {
  feeType: FeeType;
  merchantId: string;
  currency: string;
  basisAmount: bigint;
  /** Exactly one of transactionId / settlementId. */
  transactionId?: string;
  settlementId?: string;
  rail?: PaymentRail | null;
  method?: PaymentMethod | null;
  /** Reference shown in ledger entry descriptions. */
  displayRef: string;
}

/**
 * Resolve, calculate, and record a fee inside the caller's transaction:
 *  - fee_ledger row (immutable, with rate snapshot)
 *  - DEBIT merchant MERCHANT_FLOAT / CREDIT system PSP_FEE ledger pair
 *
 * Returns the fee charged in minor units (0n when no schedule applies).
 */
async function chargeFee(trx: Knex.Transaction, params: ChargeParams): Promise<bigint> {
  const merchant = await trx("merchants")
    .where({ id: params.merchantId })
    .first("id", "tier");
  if (!merchant) return 0n;

  const schedule = await resolveFeeSchedule(trx, params.feeType, {
    merchantId: params.merchantId,
    merchantTier: merchant.tier,
    rail: params.rail,
    method: params.method,
    currency: params.currency,
  });
  if (!schedule) return 0n;

  const fee = calculateFee(schedule, params.basisAmount);

  await trx("fee_ledger").insert({
    fee_schedule_id: schedule.id,
    fee_type: params.feeType,
    transaction_id: params.transactionId ?? null,
    settlement_id: params.settlementId ?? null,
    merchant_id: params.merchantId,
    amount: fee.toString(),
    currency: params.currency,
    flat_amount_applied: String(schedule.flat_amount ?? 0),
    percentage_rate_applied: schedule.percentage_rate ?? 0,
    basis_amount: params.basisAmount.toString(),
  });

  // ledger_entries.amount must be > 0 — a zero fee is recorded in
  // fee_ledger only.
  if (fee > 0n) {
    const merchantAccount = await ensureLedgerAccount(
      trx,
      params.merchantId,
      "MERCHANT_FLOAT",
      params.currency,
      `Merchant float (${params.currency})`
    );
    const feeAccount = await ensureLedgerAccount(
      trx,
      null,
      "PSP_FEE",
      params.currency,
      `PSP fees (${params.currency})`
    );

    const entryIdPrefix = `LE-${Date.now().toString(36).toUpperCase()}-${crypto
      .randomUUID()
      .slice(0, 4)
      .toUpperCase()}`;

    await trx("ledger_entries").insert([
      {
        entry_id_display: `${entryIdPrefix}-FDR`,
        transaction_id: params.transactionId ?? null,
        account_id: merchantAccount.id,
        entry_type: "DEBIT",
        amount: fee.toString(),
        currency: params.currency,
        description: `${params.feeType} fee: ${params.displayRef}`,
      },
      {
        entry_id_display: `${entryIdPrefix}-FCR`,
        transaction_id: params.transactionId ?? null,
        account_id: feeAccount.id,
        entry_type: "CREDIT",
        amount: fee.toString(),
        currency: params.currency,
        description: `${params.feeType} fee: ${params.displayRef}`,
      },
    ]);
  }

  return fee;
}

/**
 * Charge a transaction-side fee and roll it into
 * transactions.processing_fee. Call inside the finalization transaction.
 */
export async function chargeTransactionFee(
  trx: Knex.Transaction,
  tx: {
    id: string;
    tx_id_display: string;
    merchant_id: string;
    amount: number | string;
    currency: string;
    rail?: PaymentRail | null;
    method?: PaymentMethod | null;
    /** Pre-fee order amount, if `amount` was inflated to include a
     *  customer-paid fee. Falls back to `amount` when unset. */
    fee_basis_amount?: number | string | null;
  },
  feeType: FeeType = "PAYMENT_PROCESSING"
): Promise<bigint> {
  const fee = await chargeFee(trx, {
    feeType,
    merchantId: tx.merchant_id,
    currency: tx.currency,
    basisAmount: BigInt(String(tx.fee_basis_amount ?? tx.amount)),
    transactionId: tx.id,
    rail: tx.rail,
    method: tx.method,
    displayRef: tx.tx_id_display,
  });

  if (fee > 0n) {
    await trx("transactions")
      .where({ id: tx.id })
      .increment("processing_fee", fee.toString() as unknown as number);
  }
  return fee;
}

/**
 * Charge a settlement-side fee (e.g. SETTLEMENT_TRANSFER) against a
 * settlement batch. Caller is responsible for folding the returned fee
 * into settlements.fees / net_amount.
 */
export async function chargeSettlementFee(
  trx: Knex.Transaction,
  settlement: {
    id: string;
    settlement_id_display: string;
    merchant_id: string;
    gross_amount: number | string;
    currency: string;
  },
  feeType: FeeType = "SETTLEMENT_TRANSFER"
): Promise<bigint> {
  return chargeFee(trx, {
    feeType,
    merchantId: settlement.merchant_id,
    currency: settlement.currency,
    basisAmount: BigInt(String(settlement.gross_amount)),
    settlementId: settlement.id,
    displayRef: settlement.settlement_id_display,
  });
}
