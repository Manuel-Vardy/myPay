// GET /api/admin/users — paginated user directory
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { fromMinorUnits } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const per_page = Math.min(100, Math.max(1, Number(searchParams.get("per_page") || 20)));
    const role = searchParams.get("role"); // ADMIN, MERCHANT, USER
    const status = searchParams.get("status"); // ACTIVE, SUSPENDED, PENDING
    const search = searchParams.get("search"); // search by email or business name

    let query = db("users")
      .leftJoin("merchants", "users.id", "merchants.user_id")
      .leftJoin("admin_profiles", "users.id", "admin_profiles.user_id")
      .leftJoin("ledger_account_balances", function () {
        this.on("merchants.id", "=", "ledger_account_balances.owner_id")
          .andOnVal("ledger_account_balances.account_type", "=", "MERCHANT_FLOAT");
      })
      .select(
        "users.id",
        "users.email",
        "users.role",
        "users.status",
        "users.two_factor_enabled",
        "users.last_login",
        "users.created_at",
        "merchants.business_name",
        "merchants.merchant_display_id",
        "merchants.tier as merchant_tier",
        "ledger_account_balances.balance as available_balance",
        "admin_profiles.admin_id_display"
      );

    if (role) {
      query = query.where("users.role", role);
    }
    if (status) {
      query = query.where("users.status", status);
    }
    if (search) {
      query = query.where(function () {
        this.where("users.email", "ilike", `%${search}%`).orWhere(
          "merchants.business_name",
          "ilike",
          `%${search}%`
        );
      });
    }

    // Count total before pagination
    const countQuery = query.clone().clearSelect().clearOrder().count("users.id as cnt").first();
    const total = Number((await countQuery)?.cnt || 0);

    // Apply pagination
    const users = await query
      .orderBy("users.created_at", "desc")
      .limit(per_page)
      .offset((page - 1) * per_page);
      
    const formattedUsers = users.map((u: any) => ({
      ...u,
      available_balance: u.available_balance != null ? fromMinorUnits(u.available_balance) : null,
    }));

    return Response.json({
      data: formattedUsers,
      pagination: {
        page,
        per_page,
        total,
        total_pages: Math.ceil(total / per_page),
      },
    });
  } catch (error) {
    console.error("Admin users error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
