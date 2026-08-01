// GET /api/admin/settlement-schedule — read the platform payout schedule
// PUT /api/admin/settlement-schedule — update payout time / threshold
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { fromMinorUnits, toMinorUnits } from "@/lib/utils";
import {
  SETTLEMENT_SCHEDULE_KEY,
  MAX_WITHDRAWAL_AGE_HOURS,
  getSettlementSchedule,
  isValidPayoutTime,
  isValidWithdrawalAgeHours,
} from "@/lib/settlements/schedule";

export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const schedule = await getSettlementSchedule();
    return Response.json({
      payout_time: schedule.payout_time,
      payout_threshold:
        schedule.payout_threshold_minor != null
          ? fromMinorUnits(schedule.payout_threshold_minor)
          : null,
      withdrawal_age_hours: schedule.withdrawal_age_hours,
    });
  } catch (error) {
    console.error("Failed to fetch settlement schedule", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const body = await request.json();

    if (!isValidPayoutTime(body.payout_time)) {
      return Response.json(
        { error: "payout_time must be a 24h time in HH:MM format" },
        { status: 400 }
      );
    }

    let thresholdMinor: number | null = null;
    if (body.payout_threshold != null && body.payout_threshold !== "") {
      const threshold = Number(body.payout_threshold);
      if (!Number.isFinite(threshold) || threshold <= 0) {
        return Response.json(
          { error: "payout_threshold must be a positive amount or empty" },
          { status: 400 }
        );
      }
      thresholdMinor = toMinorUnits(threshold);
    }

    const ageHours = Number(body.withdrawal_age_hours);
    if (!isValidWithdrawalAgeHours(ageHours)) {
      return Response.json(
        {
          error: `withdrawal_age_hours must be a whole number of hours between 0 and ${MAX_WITHDRAWAL_AGE_HOURS}`,
        },
        { status: 400 }
      );
    }

    const value = {
      payout_time: body.payout_time,
      payout_threshold_minor: thresholdMinor,
      withdrawal_age_hours: ageHours,
    };

    await db("platform_settings")
      .insert({
        key: SETTLEMENT_SCHEDULE_KEY,
        value: JSON.stringify(value),
        updated_at: new Date(),
        updated_by: guard.session.userId,
      })
      .onConflict("key")
      .merge();

    return Response.json({
      payout_time: value.payout_time,
      payout_threshold: thresholdMinor != null ? fromMinorUnits(thresholdMinor) : null,
      withdrawal_age_hours: value.withdrawal_age_hours,
    });
  } catch (error) {
    console.error("Failed to update settlement schedule", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
