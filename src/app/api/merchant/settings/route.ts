// GET /api/merchant/settings — merchant Configuration (webhooks, API keys, email)
// PUT /api/merchant/settings — update merchant settings
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/session";
import crypto from "crypto";

import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "MERCHANT") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Mask API key values — only show prefix
    const maskedKeys = (merchant.api_keys || []).map(
      (key: { key_id: string; label: string; prefix: string; created_at: string; last_used: string | null; is_active: boolean }) => ({
        key_id: key.key_id,
        label: key.label,
        prefix: key.prefix,
        created_at: key.created_at,
        last_used: key.last_used,
        is_active: key.is_active,
      })
    );

    return Response.json({
      user: {
        ...user,
        full_name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
      },
      merchant_display_id: merchant.merchant_display_id,
      business_name: merchant.business_name,
      notification_email: merchant.notification_email,
      notification_settings: merchant.notification_settings,
      region: merchant.region,
      webhook_config: {
        url: merchant.webhook_config?.url || null,
        events: merchant.webhook_config?.events || [],
        // Don't expose the secret
      },
      api_keys: maskedKeys,
      active_key_count: maskedKeys.filter((k: { is_active: boolean }) => k.is_active).length,
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
      webhook_url, 
      webhook_events, 
      notification_email, 
      notification_settings,
      generate_api_key,
      business_name,
      region,
      user_data,
      password_change
    } = body;

    const session = await getSession();
    if (!session || session.role !== "MERCHANT") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const merchantUser = await db("merchants").where({ user_id: session.userId }).first();
    if (!merchantUser) {
      return Response.json({ error: "Merchant profile not found" }, { status: 404 });
    }
    const merchant_id = merchantUser.id;

    const merchant = await db("merchants").where({ id: merchant_id }).first();
    if (!merchant) {
      return Response.json({ error: "Merchant not found" }, { status: 404 });
    }

    // Update merchant fields
    const merchantUpdates: Record<string, unknown> = {};

    if (webhook_url !== undefined || webhook_events !== undefined) {
      const currentConfig = merchant.webhook_config || {};
      merchantUpdates.webhook_config = JSON.stringify({
        ...currentConfig,
        ...(webhook_url !== undefined && { url: webhook_url }),
        ...(webhook_events !== undefined && { events: webhook_events }),
      });
    }

    if (notification_email !== undefined) {
      merchantUpdates.notification_email = notification_email;
    }

    if (notification_settings !== undefined) {
      merchantUpdates.notification_settings = JSON.stringify(notification_settings);
    }

    if (business_name !== undefined) {
      merchantUpdates.business_name = business_name;
    }

    if (region !== undefined) {
      merchantUpdates.region = region;
    }

    // Generate new API key
    let newKey = null;
    if (generate_api_key) {
      const rawKey = `trite_${crypto.randomBytes(32).toString("hex")}`;
      newKey = {
        key_id: crypto.randomUUID(),
        label: generate_api_key.label || `Key ${(merchant.api_keys || []).length + 1}`,
        prefix: rawKey.substring(0, 12),
        created_at: new Date().toISOString(),
        last_used: null,
        is_active: true,
      };

      const existingKeys = merchant.api_keys || [];
      merchantUpdates.api_keys = JSON.stringify([...existingKeys, newKey]);
    }

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
      const fields = ["first_name", "last_name", "mobile_number", "city", "country", "two_factor_enabled", "passkeys"];
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

    return Response.json({
      message: "Settings updated successfully",
      ...(newKey && {
        new_api_key: {
          key_id: newKey.key_id,
          prefix: newKey.prefix,
          full_key: `trite_${newKey.key_id}`,
        },
      }),
    });
  } catch (error) {
    console.error("Merchant settings PUT error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
