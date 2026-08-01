import type { Knex } from "knex";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function seed(knex: Knex): Promise<void> {
  const tables = [
    "system_logs",
    "support_tickets",
    "kyc_records",
    "settlements",
    "transactions",
    "payment_sessions",
    "payment_links",
    "customers",
    "settlement_accounts",
    "admin_profiles",
    "merchants",
    "users"
  ];
  for (const table of tables) {
    await knex.raw(`TRUNCATE TABLE "${table}" CASCADE`);
  }

  const hash = await bcrypt.hash("Password123!", 12);

  const adminUserId = crypto.randomUUID();
  const merchantUserIds = [
    crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID(),
    crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID(),
    crypto.randomUUID(),
  ];

  await knex("users").insert([
    {
      id: adminUserId,
      email: "admin@trite.io",
      password_hash: hash,
      role: "ADMIN",
      two_factor_enabled: true,
      status: "ACTIVE",
    },
    { id: merchantUserIds[0], email: "elena@galaventure.io", password_hash: hash, role: "MERCHANT", status: "ACTIVE" },
    { id: merchantUserIds[1], email: "m.thorne@icloud.com", password_hash: hash, role: "MERCHANT", status: "SUSPENDED" },
    { id: merchantUserIds[2], email: "jenkins.s@global-pay.com", password_hash: hash, role: "MERCHANT", status: "ACTIVE" },
    { id: merchantUserIds[3], email: "kwame.a@accrafintech.gh", password_hash: hash, role: "MERCHANT", status: "ACTIVE" },
    { id: merchantUserIds[4], email: "abena@kumasimarkets.gh", password_hash: hash, role: "MERCHANT", status: "ACTIVE" },
    { id: merchantUserIds[5], email: "y.boateng@temafinance.gh", password_hash: hash, role: "MERCHANT", status: "ACTIVE" },
    { id: merchantUserIds[6], email: "kevin.z@fintech.org", password_hash: hash, role: "MERCHANT", status: "ACTIVE" },
  ]);

  await knex("admin_profiles").insert({
    id: crypto.randomUUID(),
    user_id: adminUserId,
    admin_id_display: "ADM-000001",
  });

  const merchantIds = merchantUserIds.map(() => crypto.randomUUID());

  await knex("merchants").insert([
    { id: merchantIds[0], user_id: merchantUserIds[0], business_name: "Gala Venture", merchant_display_id: "TR-99428-X", tier: "STANDARD", region: "GH", api_keys: "[]", webhook_config: "{}" },
    { id: merchantIds[1], user_id: merchantUserIds[1], business_name: "Thorne Digital", merchant_display_id: "IND-88216-P", tier: "PREMIUM", region: "NG", api_keys: "[]", webhook_config: "{}" },
    { id: merchantIds[2], user_id: merchantUserIds[2], business_name: "Global Pay Ltd", merchant_display_id: "TR-11844-L", tier: "STANDARD", region: "GH", api_keys: "[]", webhook_config: "{}" },
    { id: merchantIds[3], user_id: merchantUserIds[3], business_name: "Accra FinTech", merchant_display_id: "GH-77281-A", tier: "ENTERPRISE", region: "GH", api_keys: "[]", webhook_config: "{}" },
    { id: merchantIds[4], user_id: merchantUserIds[4], business_name: "Kumasi Markets", merchant_display_id: "GH-99123-K", tier: "STANDARD", region: "GH", api_keys: "[]", webhook_config: "{}" },
    { id: merchantIds[5], user_id: merchantUserIds[5], business_name: "Tema Finance", merchant_display_id: "GH-44567-T", tier: "PREMIUM", region: "GH", api_keys: "[]", webhook_config: "{}" },
    { id: merchantIds[6], user_id: merchantUserIds[6], business_name: "FinTech Org", merchant_display_id: "IND-22589-Q", tier: "STANDARD", region: "ZA", api_keys: "[]", webhook_config: "{}" },
  ]);

  // --- Dev API keys (deterministic so the docs/curl examples work out of the box) ---
  // Gala Venture:  trite_sk_<"deadbeef" x8>
  // Accra FinTech: trite_sk_<"cafebabe" x8>  (for cross-merchant 404 tests)
  const devKeys = [
    { merchantIdx: 0, raw: `trite_sk_${"deadbeef".repeat(8)}`, label: "Dev key (seeded)" },
    { merchantIdx: 3, raw: `trite_sk_${"cafebabe".repeat(8)}`, label: "Dev key (seeded)" },
  ];
  await knex("api_keys").insert(
    devKeys.map((k) => ({
      merchant_id: merchantIds[k.merchantIdx],
      key_hash: crypto.createHash("sha256").update(k.raw).digest("hex"),
      prefix: k.raw.slice(0, 16),
      label: k.label,
    }))
  );

  // --- Dev webhook endpoint for Gala Venture (point a local receiver at :9999) ---
  await knex("webhook_endpoints").insert({
    merchant_id: merchantIds[0],
    url: "http://localhost:9999/hook",
    secret: `whsec_${"0123456789abcdef".repeat(3)}`,
    events: ["payment.success", "payment.failed", "payout.success", "payout.failed"],
    is_active: true,
  });
}
