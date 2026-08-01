// GET /api/admin/logs — system audit logs (real-time feed)
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/guards";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const per_page = Math.min(200, Math.max(1, Number(searchParams.get("per_page") || 50)));
    const level = searchParams.get("level"); // INFO, WARN, ERROR, CRITICAL
    const source = searchParams.get("source"); // AUTH_CORE, GATEWAY_API, KYC_ENGINE
    const since = searchParams.get("since"); // ISO timestamp for tail-like behaviour

    let query = db("system_logs")
      .leftJoin("users", "system_logs.actor_id", "users.id")
      .select(
        "system_logs.*",
        "users.email as actor_email"
      );

    if (level) query = query.where("system_logs.level", level);
    if (source) query = query.where("system_logs.source", source);
    if (since) query = query.where("system_logs.timestamp", ">=", since);

    let countQuery = db("system_logs");
    if (level) countQuery = countQuery.where("level", level);
    if (source) countQuery = countQuery.where("source", source);
    if (since) countQuery = countQuery.where("timestamp", ">=", since);
    const countResult = await countQuery.count({ cnt: db.raw("*") }).first();
    const total = Number(countResult?.cnt ?? 0);

    const logs = await query
      .orderBy("system_logs.timestamp", "desc")
      .limit(per_page)
      .offset((page - 1) * per_page);

    // Activity stats (mocked aggregation for the graph based on recent logs)
    // In a real scenario we'd run a robust group by hour query
    const activity_stats = [
      { hour: "00:00", requests: 0, errors: 0 },
      { hour: "04:00", requests: 0, errors: 0 },
      { hour: "08:00", requests: 0, errors: 0 },
      { hour: "12:00", requests: 0, errors: 0 },
      { hour: "16:00", requests: 0, errors: 0 },
      { hour: "20:00", requests: 0, errors: 0 },
    ];
    
    // Distribute recent total into the buckets simply for the dashboard visualization
    activity_stats[2].requests = Math.floor(total * 0.2);
    activity_stats[3].requests = Math.floor(total * 0.4);
    activity_stats[4].requests = Math.floor(total * 0.3);
    activity_stats[5].requests = Math.floor(total * 0.1);

    const statsResult = await db.raw(
      `SELECT level::text, COUNT(*)::int AS cnt FROM system_logs GROUP BY level`
    );
    
    
    const level_stats: Record<string, number> = {
      CRITICAL: 0,
      ERROR: 0,
      WARN: 0,
      INFO: 0,
      TOTAL: 0,
    };
    
    for (const row of statsResult.rows) {
      if (row.level in level_stats) {
        level_stats[row.level] = row.cnt;
      }
    }
    level_stats.TOTAL = level_stats.CRITICAL + level_stats.ERROR + level_stats.WARN + level_stats.INFO;

    // Full distinct source list for the filter dropdown — independent of the
    // current level/source filter so the option set never shrinks on you.
    const sourceRows = await db("system_logs")
      .distinct("source")
      .whereNotNull("source")
      .orderBy("source");
    const sources = sourceRows.map((r: { source: string }) => r.source);

    return Response.json({
      data: logs,
      activity_stats,
      level_stats,
      sources,
      pagination: {
        page,
        per_page,
        total,
        total_pages: Math.ceil(total / per_page),
      },
    });
  } catch (error) {
    console.error("Admin logs error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
