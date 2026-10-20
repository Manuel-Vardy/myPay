// GET & POST /api/merchant/customers — customer directory for a merchant
//
// Customers are created automatically when a payment settles (see
// lib/payments/customers.ts); this route is the merchant's view of them, plus
// a manual-add path for relationships that started off-platform.
//
// Spend and activity are computed from `transactions` on every read rather
// than stored on the customer row. Settlement is not perfectly idempotent, so
// a counter incremented there could drift permanently upward; and a single
// total cannot hold GHS and USD without adding up currencies that don't.
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireVerifiedMerchant } from "@/lib/guards";
import { hashPassword } from "@/lib/auth";
import { normalizeMsisdn, fromMinorUnits } from "@/lib/utils";
import type { CustomerTier } from "@/lib/types";

const TIERS: CustomerTier[] = ["STANDARD", "PREMIUM"];

/** The merchant portal reports spend in GHS; other currencies are broken out. */
const REPORTING_CURRENCY = "GHS";

/**
 * Per-customer settled totals, joined in as a lateral so the aggregate is
 * available to ORDER BY as well as to the response.
 */
const SPEND_LATERAL = `
  LEFT JOIN LATERAL (
    SELECT
      coalesce(sum(g.cnt), 0)                                   AS transaction_count,
      max(g.last_at)                                            AS last_transaction_at,
      coalesce(max(g.total) FILTER (WHERE g.currency = ?), 0)   AS spent_reporting,
      coalesce(jsonb_object_agg(g.currency, g.total), '{}'::jsonb) AS spend_by_currency
    FROM (
      SELECT
        t.currency,
        sum(t.amount)     AS total,
        count(*)          AS cnt,
        max(t.created_at) AS last_at
      FROM transactions t
      WHERE t.customer_id = customers.user_id
        AND t.merchant_id = customers.merchant_id
        AND t.status = 'SETTLED'
      GROUP BY t.currency
    ) g
  ) spend ON TRUE
`;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const per_page = Math.min(50, Math.max(1, Number(searchParams.get("per_page") || 20)));
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "recent"; // recent | volume | name
    const tier = searchParams.get("tier"); // STANDARD | PREMIUM

    const guard = await requireVerifiedMerchant();
    if (guard.error) return guard.error;
    const merchant_id = guard.merchant.id;

    // --- Main query: customers joined with users for profile info ---
    let query = db("customers")
      .where("customers.merchant_id", merchant_id)
      .join("users", "customers.user_id", "users.id")
      .joinRaw(SPEND_LATERAL, [REPORTING_CURRENCY])
      .select(
        "customers.id",
        "customers.user_id",
        "customers.tier",
        "customers.status",
        "customers.notes",
        "customers.created_at",
        "users.email",
        "users.first_name",
        "users.last_name",
        "users.mobile_number as phone",
        "users.country",
        "users.city",
        db.raw("spend.transaction_count"),
        db.raw("spend.last_transaction_at"),
        db.raw("spend.spent_reporting"),
        db.raw("spend.spend_by_currency")
      );

    if (tier && TIERS.includes(tier.toUpperCase() as CustomerTier)) {
      query = query.where("customers.tier", tier.toUpperCase());
    }

    if (search) {
      query = query.where(function () {
        this.where("users.email", "ilike", `%${search}%`)
          .orWhere("users.first_name", "ilike", `%${search}%`)
          .orWhere("users.last_name", "ilike", `%${search}%`)
          .orWhere("users.mobile_number", "ilike", `%${search}%`);
      });
    }

    // Count for pagination
    const countResult = await query.clone().clearSelect().clearOrder().count("customers.id as cnt").first();
    const total = Number(countResult?.cnt || 0);

    // Sort mapping
    let orderColumn = "customers.created_at";
    let orderDirection: "asc" | "desc" = "desc";
    if (sort === "volume") {
      orderColumn = "spend.spent_reporting";
      orderDirection = "desc";
    } else if (sort === "name") {
      orderColumn = "users.first_name";
      orderDirection = "asc";
    }

    const customers = await query
      .orderByRaw(`${orderColumn} ${orderDirection} NULLS LAST`)
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

    // --- Portfolio value: settled volume from known customers ---
    // Restricted to customers in the directory, so it answers "what have my
    // customers spent" rather than "what have I taken" (that's the settlements
    // page). Anonymous payments have no customer_id and don't count.
    const portfolioResult = await db("transactions")
      .join("customers", function () {
        this.on("customers.user_id", "=", "transactions.customer_id").andOn(
          "customers.merchant_id",
          "=",
          "transactions.merchant_id"
        );
      })
      .where("transactions.merchant_id", merchant_id)
      .where("transactions.status", "SETTLED")
      .where("transactions.currency", REPORTING_CURRENCY)
      .sum("transactions.amount as total")
      .first();
    const portfolioValue = fromMinorUnits(String(portfolioResult?.total || 0));

    return Response.json({
      data: customers.map(({ spent_reporting, ...c }: Record<string, unknown>) => ({
        ...c,
        // Compose display name from user's first/last name
        name: [c.first_name, c.last_name].filter(Boolean).join(" ") || null,
        // Amounts are stored in minor units; the portal renders major.
        total_spent: fromMinorUnits(String(spent_reporting || 0)),
        total_spent_currency: REPORTING_CURRENCY,
        spend_by_currency: Object.fromEntries(
          Object.entries((c.spend_by_currency as Record<string, string>) || {}).map(
            ([currency, minor]) => [currency, fromMinorUnits(minor)]
          )
        ),
        transaction_count: Number(c.transaction_count || 0),
      })),
      acquisition_rate: {
        percentage: Number(acquisitionRate.toFixed(1)),
        this_month: thisCount,
        last_month: lastCount,
      },
      portfolio_value: portfolioValue,
      portfolio_currency: REPORTING_CURRENCY,
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

    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : null;
    const normalizedPhone = normalizeMsisdn(phone);

    // Either identifier is enough — a mobile money customer often has no
    // email at all, which is exactly how the automatic path stores them.
    if (!normalizedEmail && !normalizedPhone) {
      return Response.json(
        { error: "An email address or phone number is required" },
        { status: 400 }
      );
    }

    if (phone && !normalizedPhone) {
      return Response.json({ error: "Phone number is not valid" }, { status: 400 });
    }

    const resolvedTier: CustomerTier = TIERS.includes(String(tier).toUpperCase() as CustomerTier)
      ? (String(tier).toUpperCase() as CustomerTier)
      : "STANDARD";

    // --- Find or create the user, matching how settlement resolves a payer ---
    let user = normalizedEmail
      ? await db("users").whereRaw("lower(email) = ?", [normalizedEmail]).first()
      : undefined;

    if (!user && normalizedPhone) {
      user = await db("users")
        .where({ mobile_number: normalizedPhone, role: "CUSTOMER" })
        .first();
    }

    if (!user) {
      // Split full name into first/last
      const parts = (name || "").trim().split(/\s+/).filter(Boolean);
      const first_name = parts[0] || null;
      const last_name = parts.length > 1 ? parts.slice(1).join(" ") : null;

      // Create a placeholder user with a random password
      // (they'll set a real password when they register or via a reset flow)
      const placeholder_hash = await hashPassword(crypto.randomUUID());

      [user] = await db("users")
        .insert({
          email: normalizedEmail,
          password_hash: placeholder_hash,
          role: "CUSTOMER",
          first_name,
          last_name,
          mobile_number: normalizedPhone,
        })
        .returning("*");
    } else {
      // User exists — fill in anything we now know and they don't have.
      const updates: Record<string, string> = {};
      if (name && !user.first_name) {
        const parts = name.trim().split(/\s+/).filter(Boolean);
        updates.first_name = parts[0];
        if (parts.length > 1) updates.last_name = parts.slice(1).join(" ");
      }
      if (normalizedPhone && !user.mobile_number) {
        updates.mobile_number = normalizedPhone;
      }
      if (normalizedEmail && !user.email) {
        updates.email = normalizedEmail;
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
        tier: resolvedTier,
      })
      .returning("*");

    return Response.json({
      data: {
        ...customer,
        email: user.email,
        name: [user.first_name, user.last_name].filter(Boolean).join(" ") || null,
        phone: user.mobile_number,
        // A brand new relationship has no settled payments behind it yet.
        total_spent: 0,
        total_spent_currency: REPORTING_CURRENCY,
        spend_by_currency: {},
        transaction_count: 0,
        last_transaction_at: null,
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
