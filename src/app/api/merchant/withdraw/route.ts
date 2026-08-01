// GET  /api/merchant/withdraw — list the merchant's withdrawal requests
// POST /api/merchant/withdraw — create a withdrawal request for admin
// approval. The payout itself runs when an admin approves the request
// (see /api/admin/withdrawal-requests/[id]); until then the amount is held
// against the merchant's withdrawable balance. Mobile wallets only for now.
import { type NextRequest } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";
import { requireActiveMerchant, requireVerifiedMerchant } from "@/lib/guards";
import { fromMinorUnits, toMinorUnits } from "@/lib/utils";
import { getMerchantFloatBalances } from "@/lib/settlements/balance";

const SUPPORTED_PROVIDERS = ["mtn", "telecel", "vodafone", "at", "airteltigo"];

export async function GET() {
  const guard = await requireVerifiedMerchant();
  if (guard.error) return guard.error;
  const { merchant } = guard;

  try {
    const requests = await db("withdrawal_requests")
      .where({ merchant_id: merchant.id })
      .orderBy("created_at", "desc")
      .limit(50);

    // Join settlement account info for display
    const accountIds = [
      ...new Set(requests.map((r: any) => r.settlement_account_id)),
    ];
    const accounts = accountIds.length
      ? await db("settlement_accounts").whereIn("id", accountIds)
      : [];
    const accountMap = new Map(accounts.map((a: any) => [a.id, a]));

    const formatted = requests.map((r: any) => {
      const account = accountMap.get(r.settlement_account_id);
      return {
        id: r.id,
        request_id_display: r.request_id_display,
        amount: fromMinorUnits(r.amount),
        currency: r.currency,
        status: r.status,
        account: account
          ? {
              provider_name: account.provider_name,
              account_name: account.account_name,
              account_number: `****${String(account.account_number).slice(-4)}`,
              account_type: account.account_type,
            }
          : null,
        review_note: r.review_note,
        failure_reason: r.failure_reason,
        created_at: r.created_at,
        reviewed_at: r.reviewed_at,
      };
    });

    return Response.json({ data: formatted });
  } catch (error) {
    console.error("Withdrawal requests GET error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  const guard = await requireActiveMerchant();
  if (guard.error) return guard.error;
  const { merchant } = guard;

  try {

    const body = await request.json();
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return Response.json({ error: "Enter a valid withdrawal amount" }, { status: 400 });
    }
    const requestedAmount = BigInt(toMinorUnits(amount));

    const account = await db("settlement_accounts")
      .where({ id: body.account_id, merchant_id: merchant.id })
      .first();
    if (!account) {
      return Response.json({ error: "Settlement account not found" }, { status: 404 });
    }
    if (!["MOBILE_WALLET", "MOBILE_MONEY"].includes(account.account_type)) {
      return Response.json(
        { error: "Bank withdrawals are not supported yet — use a mobile money account" },
        { status: 400 }
      );
    }
    const provider = String(account.provider_name).toLowerCase();
    if (!SUPPORTED_PROVIDERS.some((p) => provider.includes(p))) {
      return Response.json(
        { error: `Withdrawals via ${account.provider_name} are not supported yet` },
        { status: 400 }
      );
    }

    const balances = await getMerchantFloatBalances(merchant.id, "GHS");
    if (balances.withdrawable <= 0n) {
      return Response.json(
        {
          error:
            balances.ageHours > 0
              ? `No withdrawable balance — payments become available ${balances.ageHours} hours after they are received`
              : "No withdrawable balance",
        },
        { status: 400 }
      );
    }
    if (requestedAmount > balances.withdrawable) {
      return Response.json(
        {
          error: `Amount exceeds your withdrawable balance of GHS ${fromMinorUnits(
            balances.withdrawable
          ).toFixed(2)}`,
        },
        { status: 400 }
      );
    }

    const requestIdDisplay = `WDR-${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const [withdrawalRequest] = await db("withdrawal_requests")
      .insert({
        request_id_display: requestIdDisplay,
        merchant_id: merchant.id,
        settlement_account_id: account.id,
        amount: requestedAmount.toString(),
        currency: "GHS",
        status: "PENDING",
      })
      .returning("*");

    await db("system_logs").insert({
      level: "INFO",
      source: "MERCHANT_WITHDRAWAL",
      event_description:
        `Withdrawal request ${requestIdDisplay} created by merchant ${merchant.merchant_display_id ?? merchant.id} ` +
        `for GHS ${fromMinorUnits(requestedAmount).toFixed(2)} to ${account.provider_name} — awaiting admin approval`,
    });

    return Response.json({
      status: "PENDING_APPROVAL",
      request_id: withdrawalRequest.id,
      request_id_display: requestIdDisplay,
      message: "Withdrawal request submitted — it will be paid out once an admin approves it",
    });
  } catch (error) {
    console.error("Merchant withdraw error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
