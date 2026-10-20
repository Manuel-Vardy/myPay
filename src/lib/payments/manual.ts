// ============================================================
// Manual payout "provider".
//
// Not a provider at all: it represents money an operator moved by hand —
// a bank transfer, a momo send from another account — after the automated
// rails failed or while they were known to be down.
//
// Modelling it as a PayoutProvider means a manual payout runs through
// exactly the same `processSettlement` path as a real one: the in-flight
// guard, the withdrawable computation, the fee, the float →
// SETTLEMENT_PENDING reserve, the completion and the merchant's
// `payout.success` webhook. Without that, an operator paying out of band
// leaves the funds sitting in the merchant's float, withdrawable a second
// time — the money is gone but the ledger still says it is theirs.
// ============================================================

import type {
  CheckTransferStatusParams,
  InitiateTransferParams,
  PayoutProvider,
  TransferResult,
} from "./types";

/** Name recorded in `settlements.payout_provider`. */
export const MANUAL_PROVIDER_NAME = "Manual";

function notCollectable(): never {
  // Collections never route here: the admin provider allowlist only accepts
  // moolre / anm / paystack, so this is a programming error, not input.
  throw new Error("The manual payout provider cannot collect payments");
}

export class ManualPayoutProvider implements PayoutProvider {
  readonly name = MANUAL_PROVIDER_NAME;

  async initiatePayment(): Promise<never> {
    notCollectable();
  }

  async checkStatus(): Promise<never> {
    notCollectable();
  }

  /**
   * The money has already moved by the time this is called — the operator is
   * recording a fact, not requesting a transfer. Always SUCCESS, carrying the
   * operator's receipt as the provider reference.
   */
  async initiateTransfer(params: InitiateTransferParams): Promise<TransferResult> {
    return {
      status: "SUCCESS",
      providerRef: params.reference,
      message: `Recorded as paid manually (reference ${params.reference})`,
      rawResponse: { manual: true, reference: params.reference },
    };
  }

  /**
   * A manual settlement is COMPLETED the moment it is created, so the
   * reconciler never sees one. Answer SUCCESS anyway rather than leaving a
   * row it cannot resolve if one ever does reach it.
   */
  async checkTransferStatus(params: CheckTransferStatusParams): Promise<TransferResult> {
    return {
      status: "SUCCESS",
      providerRef: params.providerRef,
      message: "Manual payout — recorded as paid by an operator",
      rawResponse: { manual: true },
    };
  }
}
