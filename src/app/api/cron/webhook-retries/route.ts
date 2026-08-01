// POST /api/cron/webhook-retries — drain due merchant webhook deliveries.
// Invoked by Cloud Scheduler (prod) with the CRON_SECRET bearer, same
// contract as /api/cron/process-settlements.
import { NextRequest } from "next/server";
import db from "@/lib/db";
import { drainPendingWebhooks } from "@/lib/webhooks/deliver";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await drainPendingWebhooks({ batch: 50 });

    // Opportunistic housekeeping: expired rate-limit windows
    const purged = await db("rate_limit_counters")
      .where("window_start", "<", db.raw("now() - interval '1 day'"))
      .delete();

    return Response.json({ ...result, rate_limit_rows_purged: purged });
  } catch (error) {
    console.error("Webhook retry drain error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
