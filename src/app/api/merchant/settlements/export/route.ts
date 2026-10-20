// GET /api/merchant/settlements/export — CSV export of a merchant's settlement history
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireVerifiedMerchant } from "@/lib/guards";
import { buildCsv, csvFilename, csvResponse, money, toBigInt } from "@/lib/csv";
import type { Settlement } from "@/lib/types";
import { isSettlementStatus, SETTLEMENT_STATUSES } from "@/lib/constants";

// Columns added after the base Settlement type was written, plus the raw
// bigint-as-string amounts the driver actually hands back.
type SettlementRow = Omit<Settlement, "gross_amount" | "fees" | "net_amount"> & {
  gross_amount: string;
  fees: string;
  net_amount: string;
  account_id: string | null;
  bank_reference: string | null;
  failure_reason: string | null;
};

type SettlementAccountRow = {
  id: string;
  provider_name: string;
  account_number: string;
};

export async function GET(request: NextRequest) {
  try {
    const guard = await requireVerifiedMerchant();
    if (guard.error) return guard.error;
    const merchant_id = guard.merchant.id;

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const date_from = searchParams.get("date_from");
    const date_to = searchParams.get("date_to");

    // Matches the list route: reject an unknown status rather than letting it
    // reach the enum comparison, and rather than silently exporting everything.
    if (status && !isSettlementStatus(status)) {
      return Response.json(
        { error: `Invalid status. Expected one of: ${SETTLEMENT_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    let query = db("settlements").where({ merchant_id });

    if (status) query = query.where("status", status);
    if (date_from) query = query.where("created_at", ">=", date_from);
    if (date_to) query = query.where("created_at", "<=", date_to);

    const settlements: SettlementRow[] = await query
      .select("settlements.*")
      .orderBy("created_at", "desc");

    // Resolve payout destinations in one round trip rather than per row.
    const accountIds = settlements.map((s) => s.account_id).filter(Boolean);
    const accounts: SettlementAccountRow[] = accountIds.length
      ? await db("settlement_accounts").whereIn("id", accountIds)
      : [];
    const accountMap = new Map(accounts.map((a) => [a.id, a]));

    const header = [
      "Settlement ID",
      "Created",
      "Period Start",
      "Period End",
      "Transactions",
      "Destination",
      "Status",
      "Currency",
      "Gross",
      "Fees",
      "Net",
      "Bank Reference",
      "Failure Reason",
    ];

    const rows = settlements.map((s) => {
      const acc = s.account_id ? accountMap.get(s.account_id) : null;
      // Mask to the last 4, matching how the settlements list API exposes it —
      // an export shouldn't widen what the UI already deliberately hides.
      const destination = acc
        ? `${acc.provider_name} ****${String(acc.account_number).slice(-4)}`
        : "Manual";

      return [
        s.settlement_id_display,
        new Date(s.created_at).toISOString(),
        new Date(s.date_range_start).toISOString(),
        new Date(s.date_range_end).toISOString(),
        s.transaction_count,
        destination,
        s.status,
        s.currency,
        money(toBigInt(s.gross_amount)),
        money(toBigInt(s.fees)),
        money(toBigInt(s.net_amount)),
        s.bank_reference || "",
        s.failure_reason || "",
      ];
    });

    return csvResponse(buildCsv(header, rows), csvFilename("settlements"));
  } catch (error) {
    console.error("Merchant settlements export error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
