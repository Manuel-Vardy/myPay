// PATCH /api/admin/support/[id] — update ticket status, assign agent, append message
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import type { TicketMessage } from "@/lib/types";
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
    const { status, assigned_to, message } = body;

    const ticket = await db("support_tickets").where({ id }).first();
    if (!ticket) {
      return Response.json({ error: "Ticket not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = { updated_at: db.fn.now() };

    if (status) updates.status = status;
    if (assigned_to !== undefined) updates.assigned_to = assigned_to;

    if (message) {
      const { sender_id, content } = message;
      if (!sender_id || !content) {
        return Response.json(
          { error: "message requires sender_id and content" },
          { status: 400 }
        );
      }
      const existing: TicketMessage[] = ticket.messages || [];
      updates.messages = JSON.stringify([
        ...existing,
        { sender_id, content, timestamp: new Date().toISOString() },
      ]);
    }

    const [updated] = await db("support_tickets")
      .where({ id })
      .update(updates)
      .returning("*");

    return Response.json(updated);
  } catch (error) {
    console.error("Admin support PATCH error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
