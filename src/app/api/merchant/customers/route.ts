// GET /api/merchant/customers — customer directory for a merchant
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const per_page = Math.min(50, Math.max(1, Number(searchParams.get("per_page") || 20)));
    const search = searchParams.get("search");
    const session = await getSession();
    if (!session || session.role !== "MERCHANT") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const merchantUser = await db("merchants").where({ user_id: session.userId }).first();
    if (!merchantUser) {
      return Response.json({ error: "Merchant profile not found" }, { status: 404 });
    }
    const merchant_id = merchantUser.id;

    // Customers are users who have transacted with this merchant
    let query = db("transactions")
      .where("transactions.merchant_id", merchant_id)
      .whereNotNull("transactions.customer_id")
      .join("users", "transactions.customer_id", "users.id")
      .leftJoin("kyc_records", "users.id", "kyc_records.user_id")
      .select(
        "users.id",
        "users.email",
        "users.status",
        "users.created_at",
        "kyc_records.status as kyc_status"
      )
      .sum("transactions.amount as total_spent")
      .count("transactions.id as transaction_count")
      .max("transactions.created_at as last_transaction")
      .groupBy(
        "users.id",
        "users.email",
        "users.status",
        "users.created_at",
        "kyc_records.status"
      );

    if (search) {
      query = query.where("users.email", "ilike", `%${search}%`);
    }

    // For pagination, we need to count distinct customers
    const countResult = await db("transactions")
      .where({ merchant_id })
      .whereNotNull("customer_id")
      .countDistinct("customer_id as cnt")
      .first();
    const total = Number(countResult?.cnt || 0);

    const customers = await query
      .orderBy("last_transaction", "desc")
      .limit(per_page)
      .offset((page - 1) * per_page);

    return Response.json({
      data: customers.map((c: Record<string, unknown>) => ({
        ...c,
        total_spent: Number(c.total_spent),
        transaction_count: Number(c.transaction_count),
      })),
      pagination: {
        page,
        per_page,
        total,
        total_pages: Math.ceil(total / per_page),
      },
    });
  } catch (error) {
    console.error("Merchant customers error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
