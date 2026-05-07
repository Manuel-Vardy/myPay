// GET /api/admin/support — paginated support ticket list with filters
// POST /api/admin/support — create a new support ticket
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import crypto from "crypto";
import { requireAdmin } from "@/lib/guards";

export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const per_page = Math.min(100, Math.max(1, Number(searchParams.get("per_page") || 20)));
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const issue_type = searchParams.get("issue_type");
    const merchant_id = searchParams.get("merchant_id");

    let query = db("support_tickets")
      .join("merchants", "support_tickets.merchant_id", "merchants.id")
      .select(
        "support_tickets.*",
        "merchants.business_name",
        "merchants.merchant_display_id"
      );

    if (status) query = query.where("support_tickets.status", status);
    if (priority) query = query.where("support_tickets.priority", priority);
    if (issue_type) query = query.where("support_tickets.issue_type", issue_type);
    if (merchant_id) query = query.where("support_tickets.merchant_id", merchant_id);

    const countQuery = query.clone().clearSelect().clearOrder().count("support_tickets.id as cnt").first();
    const total = Number((await countQuery)?.cnt || 0);

    const tickets = await query
      .orderBy("support_tickets.created_at", "desc")
      .limit(per_page)
      .offset((page - 1) * per_page);

    return Response.json({
      data: tickets,
      pagination: { page, per_page, total, total_pages: Math.ceil(total / per_page) },
    });
  } catch (error) {
    console.error("Admin support GET error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    const body = await request.json();
    const { merchant_id, issue_type, priority = "MEDIUM", description } = body;

    if (!merchant_id || !issue_type) {
      return Response.json(
        { error: "merchant_id and issue_type are required" },
        { status: 400 }
      );
    }

    const merchant = await db("merchants").where({ id: merchant_id }).first();
    if (!merchant) {
      return Response.json({ error: "Merchant not found" }, { status: 404 });
    }

    const count = await db("support_tickets").count("id as cnt").first();
    const seq = String(Number(count?.cnt || 0) + 1).padStart(5, "0");

    const [ticket] = await db("support_tickets")
      .insert({
        id: crypto.randomUUID(),
        ticket_id_display: `TKT-${seq}`,
        merchant_id,
        issue_type,
        priority,
        status: "OPEN",
        description: description || null,
        messages: JSON.stringify([]),
      })
      .returning("*");

    return Response.json(ticket, { status: 201 });
  } catch (error) {
    console.error("Admin support POST error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
