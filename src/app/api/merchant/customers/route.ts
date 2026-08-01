// GET & POST /api/merchant/customers — customer directory for a merchant
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireVerifiedMerchant } from "@/lib/guards";
import { hashPassword } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const per_page = Math.min(50, Math.max(1, Number(searchParams.get("per_page") || 20)));
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "recent"; // recent | volume | name
    const tier = searchParams.get("tier"); // standard | enterprise | institutional

    const guard = await requireVerifiedMerchant();
    if (guard.error) return guard.error;
    const merchant_id = guard.merchant.id;

    // --- Main query: customers joined with users for profile info ---
    let query = db("customers")
      .where("customers.merchant_id", merchant_id)
      .join("users", "customers.user_id", "users.id")
      .select(
        "customers.id",
        "customers.user_id",
        "customers.tier",
        "customers.status",
        "customers.total_spent",
        "customers.transaction_count",
        "customers.last_transaction_at",
        "customers.notes",
        "customers.created_at",
        "users.email",
        "users.first_name",
        "users.last_name",
        "users.mobile_number as phone",
        "users.country",
        "users.city"
      );

    if (tier) {
      query = query.where("customers.tier", tier);
    }

    if (search) {
      query = query.where(function () {
        this.where("users.email", "ilike", `%${search}%`)
          .orWhere("users.first_name", "ilike", `%${search}%`)
          .orWhere("users.last_name", "ilike", `%${search}%`);
      });
    }

    // Count for pagination
    const countResult = await query.clone().clearSelect().clearOrder().count("customers.id as cnt").first();
    const total = Number(countResult?.cnt || 0);

    // Sort mapping
    let orderColumn = "customers.created_at";
    let orderDirection: "asc" | "desc" = "desc";
    if (sort === "volume") {
      orderColumn = "customers.total_spent";
      orderDirection = "desc";
    } else if (sort === "name") {
      orderColumn = "users.first_name";
      orderDirection = "asc";
    }

    const customers = await query
      .orderBy(orderColumn, orderDirection)
      .limit(per_page)
      .offset((page - 1) * per_page);

    // --- Acquisition rate: this month vs last month new customers ---
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonthCount = await db("customers")
      .where({ merchant_id })
      .where("created_at", ">=", thisMonthStart.toISOString())
      .count("id as cnt")
      .first();

    const lastMonthCount = await db("customers")
      .where({ merchant_id })
      .where("created_at", ">=", lastMonthStart.toISOString())
      .where("created_at", "<", thisMonthStart.toISOString())
      .count("id as cnt")
      .first();

    const thisCount = Number(thisMonthCount?.cnt || 0);
    const lastCount = Number(lastMonthCount?.cnt || 0);

    let acquisitionRate = 0;
    if (lastCount > 0) {
      acquisitionRate = ((thisCount - lastCount) / lastCount) * 100;
    } else if (thisCount > 0) {
      acquisitionRate = 100;
    }

    // --- Portfolio value: total spent across all customers for this merchant ---
    const portfolioResult = await db("customers")
      .where({ merchant_id })
      .sum("total_spent as total")
      .first();
    const portfolioValue = Number(portfolioResult?.total || 0);

    return Response.json({
      data: customers.map((c: Record<string, unknown>) => ({
        ...c,
        // Compose display name from user's first/last name
        name: [c.first_name, c.last_name].filter(Boolean).join(" ") || null,
        total_spent: Number(c.total_spent),
        transaction_count: Number(c.transaction_count),
      })),
      acquisition_rate: {
        percentage: Number(acquisitionRate.toFixed(1)),
        this_month: thisCount,
        last_month: lastCount,
      },
      portfolio_value: portfolioValue,
      pagination: {
        page,
        per_page,
        total,
        total_pages: Math.ceil(total / per_page),
      },
    });
  } catch (error) {
    console.error("Merchant customers error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await requireVerifiedMerchant();
    if (guard.error) return guard.error;
    const merchant_id = guard.merchant.id;

    const body = await request.json();
    const { name, email, tier, phone } = body;

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // --- Find or create the user (role USER) ---
    let user = await db("users").where({ email }).first();

    if (!user) {
      // Split full name into first/last
      const parts = (name || "").trim().split(/\s+/);
      const first_name = parts[0] || null;
      const last_name = parts.length > 1 ? parts.slice(1).join(" ") : null;

      // Create a placeholder user with a random password
      // (they'll set a real password when they register or via a reset flow)
      const placeholder_hash = await hashPassword(crypto.randomUUID());

      [user] = await db("users")
        .insert({
          email,
          password_hash: placeholder_hash,
          role: "USER",
          first_name,
          last_name,
          mobile_number: phone || null,
        })
        .returning("*");
    } else {
      // User exists — update name/phone if provided and currently empty
      const updates: Record<string, string> = {};
      if (name && !user.first_name) {
        const parts = name.trim().split(/\s+/);
        updates.first_name = parts[0];
        if (parts.length > 1) updates.last_name = parts.slice(1).join(" ");
      }
      if (phone && !user.mobile_number) {
        updates.mobile_number = phone;
      }
      if (Object.keys(updates).length > 0) {
        await db("users").where({ id: user.id }).update(updates);
      }
    }

    // --- Check if this customer-merchant link already exists ---
    const existing = await db("customers")
      .where({ merchant_id, user_id: user.id })
      .first();

    if (existing) {
      return Response.json(
        { error: "This customer is already in your directory" },
        { status: 409 }
      );
    }

    // --- Create the customer record ---
    const [customer] = await db("customers")
      .insert({
        merchant_id,
        user_id: user.id,
        tier: tier || "standard",
      })
      .returning("*");

    return Response.json({
      data: {
        ...customer,
        email: user.email,
        name: [user.first_name, user.last_name].filter(Boolean).join(" ") || null,
        phone: user.mobile_number,
        total_spent: Number(customer.total_spent),
        transaction_count: Number(customer.transaction_count),
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Create customer error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
