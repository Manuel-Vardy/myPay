// PATCH /api/admin/kyc/[id] — approve or reject a KYC record
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/guards";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    const { id } = await params;
    const body = await request.json();
    const { status, review_notes } = body;

    if (!status || !["APPROVED", "REJECTED", "FLAGGED"].includes(status)) {
      return Response.json(
        { error: "status must be one of: APPROVED, REJECTED, FLAGGED" },
        { status: 400 }
      );
    }

    const record = await db("kyc_records").where({ id }).first();
    if (!record) {
      return Response.json(
        { error: "KYC record not found" },
        { status: 404 }
      );
    }

    // Calculate process time
    const submittedAt = new Date(record.submitted_at).getTime();
    const processTime = Date.now() - submittedAt;

    const [updated] = await db("kyc_records")
      .where({ id })
      .update({
        status,
        review_notes: review_notes || null,
        reviewed_at: db.fn.now(),
        process_time_ms: processTime,
        // TODO: set reviewed_by from authenticated admin context
      })
      .returning("*");

    // If approved, activate the user
    if (status === "APPROVED") {
      await db("users")
        .where({ id: record.user_id })
        .update({ status: "ACTIVE" });
    }

    // Log the event
    await db("system_logs").insert({
      level: status === "REJECTED" ? "WARNING" : "INFO",
      source: "KYC_ENGINE",
      event_description: `KYC ${record.identity_id} ${status.toLowerCase()} (${processTime}ms)`,
      actor_id: record.user_id,
    });

    return Response.json({ data: updated });
  } catch (error) {
    console.error("KYC update error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
