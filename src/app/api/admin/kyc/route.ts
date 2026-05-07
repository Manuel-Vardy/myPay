// GET /api/admin/kyc — KYC queue summary
// PATCH /api/admin/kyc — bulk operations (not used; single-item PATCH is at /api/admin/kyc/[id])
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/guards";

export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const per_page = Math.min(100, Math.max(1, Number(searchParams.get("per_page") || 20)));
    const status = searchParams.get("status"); // PENDING, APPROVED, REJECTED, FLAGGED
    const tier = searchParams.get("tier"); // STANDARD, PREMIUM, MERCHANT

    let query = db("kyc_records")
      .join("users", "kyc_records.user_id", "users.id")
      .leftJoin("merchants", "users.id", "merchants.user_id")
      .select(
        "kyc_records.*",
        "users.email",
        "merchants.business_name"
      );

    if (status) query = query.where("kyc_records.status", status);
    if (tier) query = query.where("kyc_records.tier", tier);

    const countQuery = query.clone().clearSelect().clearOrder().count("kyc_records.id as cnt").first();
    const total = Number((await countQuery)?.cnt || 0);

    const records = await query
      .orderBy("kyc_records.submitted_at", "desc")
      .limit(per_page)
      .offset((page - 1) * per_page);

    // Queue stats
    const stats = await db("kyc_records")
      .select("status")
      .count("id as count")
      .groupBy("status");

    const avgProcessTime = await db("kyc_records")
      .whereNotNull("process_time_ms")
      .avg("process_time_ms as avg_ms")
      .first();

    return Response.json({
      data: records,
      stats: {
        by_status: stats,
        avg_process_time_ms: Number(avgProcessTime?.avg_ms || 0),
      },
      pagination: {
        page,
        per_page,
        total,
        total_pages: Math.ceil(total / per_page),
      },
    });
  } catch (error) {
    console.error("Admin KYC error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
