// PATCH  /api/admin/fee-schedules/[id] — update a schedule
// DELETE /api/admin/fee-schedules/[id] — deactivate (never hard-delete:
//        fee_ledger rows reference schedules with ON DELETE RESTRICT)
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { validateScheduleBody } from "../validation";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db("fee_schedules").where({ id }).first();
    if (!existing) {
      return Response.json({ error: "Fee schedule not found" }, { status: 404 });
    }

    // Validate the merged result so partial updates can't produce an
    // inconsistent schedule (e.g. MERCHANT_TIER without a tier).
    const merged = { ...existing, ...body };
    const validationError = validateScheduleBody(merged);
    if (validationError) {
      return Response.json({ error: validationError }, { status: 400 });
    }

    const [schedule] = await db("fee_schedules")
      .where({ id })
      .update({
        fee_type: merged.fee_type,
        description: merged.description || null,
        calculation_method: merged.calculation_method,
        flat_amount: Math.round(Number(merged.flat_amount ?? 0)),
        percentage_rate: Number(merged.percentage_rate ?? 0),
        currency: merged.currency || "GHS",
        minimum_amount:
          merged.minimum_amount != null ? Math.round(Number(merged.minimum_amount)) : null,
        maximum_amount:
          merged.maximum_amount != null ? Math.round(Number(merged.maximum_amount)) : null,
        applicability: merged.applicability,
        merchant_tier:
          merged.applicability === "MERCHANT_TIER" ? merged.merchant_tier : null,
        merchant_id:
          merged.applicability === "MERCHANT_SPECIFIC" ? merged.merchant_id : null,
        applicable_rails: merged.applicable_rails?.length ? merged.applicable_rails : null,
        applicable_methods: merged.applicable_methods?.length
          ? merged.applicable_methods
          : null,
        tiered_bands: merged.tiered_bands ? JSON.stringify(merged.tiered_bands) : null,
        is_active: merged.is_active ?? true,
        valid_until: merged.valid_until || null,
        updated_at: db.fn.now(),
      })
      .returning("*");

    return Response.json({ success: true, schedule });
  } catch (error) {
    console.error("Failed to update fee schedule", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const { id } = await params;
    const updated = await db("fee_schedules")
      .where({ id })
      .update({ is_active: false, updated_at: db.fn.now() });

    return updated
      ? Response.json({ success: true })
      : Response.json({ error: "Fee schedule not found" }, { status: 404 });
  } catch (error) {
    console.error("Failed to deactivate fee schedule", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
