// GET /api/admin/kyc — KYC queue summary
// PATCH /api/admin/kyc — bulk operations (not used; single-item PATCH is at /api/admin/kyc/[id])
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requirePermission } from "@/lib/guards";

export async function GET(request: NextRequest) {
  try {
    const guard = await requirePermission("approve-kyc");
    if (guard.error) return guard.error;

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const per_page = Math.min(100, Math.max(1, Number(searchParams.get("per_page") || 20)));
    const status = searchParams.get("status"); // PENDING, APPROVED, REJECTED, FLAGGED
    const tier = searchParams.get("tier"); // STANDARD, PREMIUM, MERCHANT

    // A kyc_records row exists from registration onward, long before the
    // merchant submits anything. submitted_at is what marks a real submission
    // (see migration 0039), so un-submitted records are not review queue work.
    let query = db("kyc_records")
      .join("users", "kyc_records.user_id", "users.id")
      .leftJoin("merchants", "users.id", "merchants.user_id")
      .whereNotNull("kyc_records.submitted_at")
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

    // Queue stats — same submitted-only basis as the list above, otherwise the
    // "Pending Review" card counts merchants who have never submitted.
    const stats = await db("kyc_records")
      .whereNotNull("submitted_at")
      .select("status")
      .count("id as count")
      .groupBy("status");

    const avgProcessTime = await db("kyc_records")
      .whereNotNull("process_time_ms")
      .avg("process_time_ms as avg_ms")
      .first();

    // 5 most recent KYC activity items (review decisions or submissions)
    const recentActivities = await db("kyc_records")
      .join("users as target_user", "kyc_records.user_id", "target_user.id")
      .leftJoin("merchants", "target_user.id", "merchants.user_id")
      .leftJoin("users as reviewer", "kyc_records.reviewed_by", "reviewer.id")
      .whereNotNull("kyc_records.submitted_at")
      .orderBy("kyc_records.updated_at", "desc")
      .limit(5)
      .select(
        "kyc_records.id",
        "kyc_records.identity_id",
        "kyc_records.status",
        "kyc_records.tier",
        "kyc_records.submitted_at",
        "kyc_records.reviewed_at",
        "kyc_records.updated_at",
        "target_user.email as target_email",
        "merchants.business_name as target_business_name",
        "reviewer.email as reviewer_email",
        "reviewer.first_name as reviewer_first_name",
        "reviewer.last_name as reviewer_last_name"
      );

    return Response.json({
      data: records,
      stats: {
        by_status: stats,
        avg_process_time_ms: Number(avgProcessTime?.avg_ms || 0),
      },
      recent_activities: recentActivities,
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
