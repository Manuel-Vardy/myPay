import type { Knex } from "knex";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function seed(knex: Knex): Promise<void> {
  await knex("merchants").del();
  await knex("admin_profiles").del();
  await knex("users").del();

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

  await knex("merchants").insert([
    { id: crypto.randomUUID(), user_id: merchantUserIds[0], business_name: "Gala Venture", merchant_display_id: "TR-99428-X", tier: "STANDARD", region: "GH", available_balance: 24000, api_keys: "[]", webhook_config: "{}" },
    { id: crypto.randomUUID(), user_id: merchantUserIds[1], business_name: "Thorne Digital", merchant_display_id: "IND-88216-P", tier: "PREMIUM", region: "NG", available_balance: 8900, api_keys: "[]", webhook_config: "{}" },
    { id: crypto.randomUUID(), user_id: merchantUserIds[2], business_name: "Global Pay Ltd", merchant_display_id: "TR-11844-L", tier: "STANDARD", region: "GH", available_balance: 51000, api_keys: "[]", webhook_config: "{}" },
    { id: crypto.randomUUID(), user_id: merchantUserIds[3], business_name: "Accra FinTech", merchant_display_id: "GH-77281-A", tier: "INSTITUTIONAL", region: "GH", available_balance: 128000, api_keys: "[]", webhook_config: "{}" },
    { id: crypto.randomUUID(), user_id: merchantUserIds[4], business_name: "Kumasi Markets", merchant_display_id: "GH-99123-K", tier: "STANDARD", region: "GH", available_balance: 12000, api_keys: "[]", webhook_config: "{}" },
    { id: crypto.randomUUID(), user_id: merchantUserIds[5], business_name: "Tema Finance", merchant_display_id: "GH-44567-T", tier: "PREMIUM", region: "GH", available_balance: 37000, api_keys: "[]", webhook_config: "{}" },
    { id: crypto.randomUUID(), user_id: merchantUserIds[6], business_name: "FinTech Org", merchant_display_id: "IND-22589-Q", tier: "STANDARD", region: "ZA", available_balance: 450, api_keys: "[]", webhook_config: "{}" },
  ]);
}
