// GET /api/public/banks — returns a list of active Ghanaian banks (no auth required)
import { type NextRequest } from "next/server";
import db from "@/lib/db";

export async function GET(_request: NextRequest) {
  try {
    const banks = await db("banks")
      .where({ is_active: true })
      .select("id", "name", "short_code")
      .orderBy("name", "asc");

    return Response.json({ data: banks });
  } catch (error) {
    console.error("GET /api/public/banks error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
