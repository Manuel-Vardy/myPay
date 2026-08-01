// GET  /api/admin/fee-schedules — list schedules (+ merchants for the picker)
// POST /api/admin/fee-schedules — create a schedule
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { validateScheduleBody } from "./validation";

export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const schedules = await db("fee_schedules")
      .leftJoin("merchants", "fee_schedules.merchant_id", "merchants.id")
      .select("fee_schedules.*", "merchants.business_name as merchant_name")
      .orderBy([
        { column: "fee_schedules.is_active", order: "desc" },
        { column: "fee_schedules.fee_type", order: "asc" },
        { column: "fee_schedules.created_at", order: "desc" },
      ]);

    const merchants = await db("merchants")
      .select("id", "business_name", "merchant_display_id")
      .orderBy("business_name");

    return Response.json({ schedules, merchants });
  } catch (error) {
    console.error("Failed to fetch fee schedules", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const validationError = validateScheduleBody(body);
    if (validationError) {
      return Response.json({ error: validationError }, { status: 400 });
    }

    const [schedule] = await db("fee_schedules")
      .insert({
        fee_type: body.fee_type,
        description: body.description || null,
        calculation_method: body.calculation_method,
        flat_amount: Math.round(Number(body.flat_amount ?? 0)),
        percentage_rate: Number(body.percentage_rate ?? 0),
        currency: body.currency || "GHS",
        minimum_amount: body.minimum_amount != null ? Math.round(Number(body.minimum_amount)) : null,
        maximum_amount: body.maximum_amount != null ? Math.round(Number(body.maximum_amount)) : null,
        applicability: body.applicability,
        merchant_tier: body.applicability === "MERCHANT_TIER" ? body.merchant_tier : null,
        merchant_id: body.applicability === "MERCHANT_SPECIFIC" ? body.merchant_id : null,
        applicable_rails: body.applicable_rails?.length ? body.applicable_rails : null,
        applicable_methods: body.applicable_methods?.length ? body.applicable_methods : null,
        tiered_bands: body.tiered_bands ? JSON.stringify(body.tiered_bands) : null,
        is_active: body.is_active ?? true,
        valid_from: body.valid_from || db.fn.now(),
        valid_until: body.valid_until || null,
        created_by: guard.session.userId,
      })
      .returning("*");

    return Response.json({ success: true, schedule }, { status: 201 });
  } catch (error) {
    console.error("Failed to create fee schedule", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
