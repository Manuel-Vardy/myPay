// GET /api/merchant/customers/export — CSV export of a merchant's customer directory
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireVerifiedMerchant } from "@/lib/guards";
import { buildCsv, csvFilename, csvResponse, money, toBigInt } from "@/lib/csv";
import type { CustomerTier } from "@/lib/types";

const TIERS: CustomerTier[] = ["STANDARD", "PREMIUM"];
const REPORTING_CURRENCY = "GHS";

/**
 * Per-customer settled totals, joined in as a lateral so the aggregate is
 * available to ORDER BY as well as to the CSV export.
 */
const SPEND_LATERAL = `
  LEFT JOIN LATERAL (
    SELECT
      coalesce(sum(g.cnt), 0)                                   AS transaction_count,
      max(g.last_at)                                            AS last_transaction_at,
      coalesce(max(g.total) FILTER (WHERE g.currency = ?), 0)   AS spent_reporting,
      coalesce(jsonb_object_agg(g.currency, g.total), '{}'::jsonb) AS spend_by_currency
    FROM (
      SELECT
        t.currency,
        sum(t.amount)     AS total,
        count(*)          AS cnt,
        max(t.created_at) AS last_at
      FROM transactions t
      WHERE t.customer_id = customers.user_id
        AND t.merchant_id = customers.merchant_id
        AND t.status = 'SETTLED'
      GROUP BY t.currency
    ) g
  ) spend ON TRUE
`;

export async function GET(request: NextRequest) {
  try {
    const guard = await requireVerifiedMerchant();
    if (guard.error) return guard.error;
    const merchant_id = guard.merchant.id;

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "recent"; // recent | volume | name
    const tier = searchParams.get("tier"); // STANDARD | PREMIUM

    let query = db("customers")
      .where("customers.merchant_id", merchant_id)
      .join("users", "customers.user_id", "users.id")
      .joinRaw(SPEND_LATERAL, [REPORTING_CURRENCY])
      .select(
        "customers.id",
        "customers.user_id",
        "customers.tier",
        "customers.status",
        "customers.notes",
        "customers.created_at",
        "users.email",
        "users.first_name",
        "users.last_name",
        "users.mobile_number as phone",
        "users.country",
        "users.city",
        db.raw("spend.transaction_count"),
        db.raw("spend.last_transaction_at"),
        db.raw("spend.spent_reporting"),
        db.raw("spend.spend_by_currency")
      );

    if (tier && TIERS.includes(tier.toUpperCase() as CustomerTier)) {
      query = query.where("customers.tier", tier.toUpperCase());
    }

    if (search) {
      query = query.where(function () {
        this.where("users.email", "ilike", `%${search}%`)
          .orWhere("users.first_name", "ilike", `%${search}%`)
          .orWhere("users.last_name", "ilike", `%${search}%`)
          .orWhere("users.mobile_number", "ilike", `%${search}%`);
      });
    }

    // Sort mapping matching the directory list view
    let orderColumn = "customers.created_at";
    let orderDirection: "asc" | "desc" = "desc";
    if (sort === "volume") {
      orderColumn = "spend.spent_reporting";
      orderDirection = "desc";
    } else if (sort === "name") {
      orderColumn = "users.first_name";
      orderDirection = "asc";
    }

    const customers = await query.orderByRaw(`${orderColumn} ${orderDirection} NULLS LAST`);

    const header = [
      "Customer ID",
      "Name",
      "Email",
      "Phone",
      "Tier",
      "Status",
      "Total Volume (GHS)",
      "Transactions Count",
      "Last Transaction Date",
      "Created Date",
    ];

    const rows = customers.map((c: Record<string, unknown>) => {
      const firstName = typeof c.first_name === "string" ? c.first_name : "";
      const lastName = typeof c.last_name === "string" ? c.last_name : "";
      const name = [firstName, lastName].filter(Boolean).join(" ") || "";
      const spent = toBigInt(c.spent_reporting);
      const lastTx = c.last_transaction_at
        ? new Date(c.last_transaction_at as string | Date).toLocaleDateString("en-GH", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";
      const createdAt = c.created_at
        ? new Date(c.created_at as string | Date).toLocaleDateString("en-GH", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";

      return [
        c.id,
        name,
        c.email || "",
        c.phone || "",
        c.tier || "STANDARD",
        c.status || "",
        money(spent),
        Number(c.transaction_count || 0),
        lastTx,
        createdAt,
      ];
    });

    return csvResponse(buildCsv(header, rows), csvFilename("customers"));
  } catch (error) {
    console.error("Merchant customers export error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
