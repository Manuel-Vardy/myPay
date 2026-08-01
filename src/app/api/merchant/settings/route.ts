// GET /api/merchant/settings — merchant profile + notification configuration
// PUT /api/merchant/settings — update merchant settings
// API keys live at /api/merchant/api-keys; webhooks at /api/merchant/webhook-endpoint
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireMerchant, requireVerifiedMerchant } from "@/lib/guards";

import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const guard = await requireMerchant();
    if (guard.error) return guard.error;
    const session = guard.session;

    const merchantUser = await db("merchants").where({ user_id: session.userId }).first();
    if (!merchantUser) {
      return Response.json({ error: "Merchant profile not found" }, { status: 404 });
    }
    const merchant_id = merchantUser.id;

    const merchant = await db("merchants").where({ id: merchant_id }).first();
    if (!merchant) {
      return Response.json({ error: "Merchant not found" }, { status: 404 });
    }

    const user = await db("users")
        .select(["id", "two_factor_enabled", "first_name", "last_name", "email", "mobile_number", "city", "country", "passkeys"]).where({ id: session.userId }).first();
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({
      user: {
        ...user,
        full_name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
      },
      merchant_display_id: merchant.merchant_display_id,
      business_name: merchant.business_name,
      fee_bearer: merchant.fee_bearer,
      notification_email: merchant.notification_email,
      notification_settings: merchant.notification_settings,
      region: merchant.region,
      business_address_line1: merchant.business_address_line1,
      business_address_line2: merchant.business_address_line2,
      business_city: merchant.business_city,
      business_region: merchant.business_region,
      business_country: merchant.business_country,
    });
  } catch (error) {
    console.error("Merchant settings GET error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      notification_email,
      notification_settings,
      business_name,
      fee_bearer,
      region,
      business_address_line1,
      business_address_line2,
      business_city,
      business_region,
      business_country,
      user_data,
      password_change
    } = body;

    const guard = await requireVerifiedMerchant();
    if (guard.error) return guard.error;
    const session = guard.session;
    const merchant = guard.merchant;
    const merchant_id = merchant.id;

    // Update merchant fields
    const merchantUpdates: Record<string, unknown> = {};

    if (notification_email !== undefined) {
      merchantUpdates.notification_email = notification_email;
    }

    if (notification_settings !== undefined) {
      merchantUpdates.notification_settings = JSON.stringify(notification_settings);
    }

    if (business_name !== undefined) {
      merchantUpdates.business_name = business_name;
    }

    if (fee_bearer !== undefined) {
      if (!["MERCHANT", "CUSTOMER"].includes(fee_bearer)) {
        return Response.json(
          { error: "fee_bearer must be MERCHANT or CUSTOMER" },
          { status: 400 }
        );
      }
      merchantUpdates.fee_bearer = fee_bearer;
    }

    if (region !== undefined) {
      merchantUpdates.region = region;
    }

    if (business_address_line1 !== undefined) merchantUpdates.business_address_line1 = business_address_line1;
    if (business_address_line2 !== undefined) merchantUpdates.business_address_line2 = business_address_line2;
    if (business_city !== undefined) merchantUpdates.business_city = business_city;
    if (business_region !== undefined) merchantUpdates.business_region = business_region;
    if (business_country !== undefined) merchantUpdates.business_country = business_country;

    if (Object.keys(merchantUpdates).length > 0) {
      await db("merchants")
        .where({ id: merchant_id })
        .update({
          ...merchantUpdates,
          updated_at: db.fn.now(),
        });
    }

    // Update user fields
    const userUpdates: Record<string, unknown> = {};
    if (user_data) {
      // two_factor_enabled is intentionally excluded — it can only be flipped
      // via /api/auth/mfa/confirm (enable) or /api/auth/mfa/disable (disable),
      // both of which require actual proof (a live code / the password).
      const fields = ["first_name", "last_name", "mobile_number", "city", "country", "passkeys"];
      fields.forEach(field => {
        if (user_data[field] !== undefined) {
          if (field === "passkeys") {
            userUpdates[field] = JSON.stringify(user_data[field]);
          } else {
            userUpdates[field] = user_data[field];
          }
        }
      });
    }

    // Handle password change
    if (password_change) {
      const { current_password, new_password } = password_change;
      const user = await db("users").where({ id: session.userId }).first();
      
      const isMatch = await bcrypt.compare(current_password, user.password_hash);
      if (!isMatch) {
        return Response.json({ error: "Current password incorrect" }, { status: 400 });
      }

      userUpdates.password_hash = await bcrypt.hash(new_password, 10);
    }

    if (Object.keys(userUpdates).length > 0) {
      await db("users")
        .where({ id: session.userId })
        .update({
          ...userUpdates,
          updated_at: db.fn.now(),
        });
    }

    return Response.json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Merchant settings PUT error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
