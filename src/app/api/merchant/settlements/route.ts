// GET /api/merchant/settlements — settlement history for a merchant
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const per_page = Math.min(50, Math.max(1, Number(searchParams.get("per_page") || 20)));
    const status = searchParams.get("status"); // PENDING, COMPLETED, FAILED
    const session = await getSession();
    if (!session || session.role !== "MERCHANT") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const merchantUser = await db("merchants").where({ user_id: session.userId }).first();
    if (!merchantUser) {
      return Response.json({ error: "Merchant profile not found" }, { status: 404 });
    }
    const merchant_id = merchantUser.id;

    let query = db("settlements").where({ merchant_id });
    if (status) query = query.where("status", status);

    const countQuery = query.clone().count("id as cnt").first();
    const total = Number((await countQuery)?.cnt || 0);

    const settlementsRows = await query
      .select("settlements.*")
      .orderBy("created_at", "desc")
      .limit(per_page)
      .offset((page - 1) * per_page);

    const accountIds = settlementsRows.map(s => s.account_id).filter(Boolean);
    const relatedAccounts = accountIds.length ? await db("settlement_accounts").whereIn("id", accountIds) : [];
    
    const accountMap = new Map();
    relatedAccounts.forEach(acc => accountMap.set(acc.id, acc));

    const settlements = settlementsRows.map((s) => {
      const acc = s.account_id ? accountMap.get(s.account_id) : null;
      return {
        ...s,
        account: acc ? {
          ...acc,
          account_number: `****${String(acc.account_number).slice(-4)}`
        } : null,
      };
    });

    // Summary totals
    const summary = await db("settlements")
      .where({ merchant_id })
      .select("status")
      .sum("gross_amount as gross")
      .sum("fees as fees")
      .sum("net_amount as net")
      .count("id as count")
      .groupBy("status");

    return Response.json({
      data: settlements,
      summary,
      pagination: {
        page,
        per_page,
        total,
        total_pages: Math.ceil(total / per_page),
      },
    });
  } catch (error) {
    console.error("Merchant settlements error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
