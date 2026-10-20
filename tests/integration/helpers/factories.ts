import crypto from "node:crypto";
import { generateApiKey } from "@/lib/api-keys";
import { db } from "./db";

/**
 * Fixture builders. Each inserts a minimally-valid row and returns it, so a
 * test states only the fields it actually cares about.
 */

let counter = 0;
const uniq = () => `${Date.now().toString(36)}${(counter++).toString(36)}`;

export interface UserRow {
  id: string;
  email: string;
  role: string;
  email_verified_at: Date | null;
}

export async function createUser(
  overrides: Record<string, unknown> = {}
): Promise<UserRow> {
  const [row] = await db("users")
    .insert({
      email: `user-${uniq()}@example.test`,
      password_hash: "$2a$10$notarealhashnotarealhashnotarealhashnotarealhash",
      role: "MERCHANT",
      email_verified_at: new Date(),
      ...overrides,
    })
    .returning("*");
  return row;
}

export interface MerchantRow {
  id: string;
  user_id: string;
  merchant_display_id: string;
  tier: string;
  payments_paused_at: Date | null;
}

export async function createMerchant(
  overrides: Record<string, unknown> = {}
): Promise<MerchantRow & { user: UserRow }> {
  const user = (overrides.user_id
    ? await db("users").where({ id: overrides.user_id }).first()
    : await createUser()) as UserRow;

  const [row] = await db("merchants")
    .insert({
      user_id: user.id,
      business_name: `Merchant ${uniq()}`,
      merchant_display_id: `MER-${uniq().toUpperCase()}`,
      tier: "STANDARD",
      ...overrides,
    })
    .returning("*");
  return { ...row, user };
}

/** An API key row plus the raw key a client would send. */
export async function createApiKey(
  merchantId: string,
  overrides: Record<string, unknown> = {}
): Promise<{ rawKey: string; id: string }> {
  const { rawKey, keyHash, prefix } = generateApiKey();
  const [row] = await db("api_keys")
    .insert({
      merchant_id: merchantId,
      key_hash: keyHash,
      prefix,
      label: "test key",
      ...overrides,
    })
    .returning("*");
  return { rawKey, id: row.id };
}

export async function createKycRecord(
  userId: string,
  status = "APPROVED",
  overrides: Record<string, unknown> = {}
) {
  const [row] = await db("kyc_records")
    .insert({
      user_id: userId,
      identity_id: `ID-${uniq()}`,
      status,
      ...overrides,
    })
    .returning("*");
  return row;
}

export async function createFeeSchedule(overrides: Record<string, unknown> = {}) {
  const [row] = await db("fee_schedules")
    .insert({
      fee_type: "PAYMENT_PROCESSING",
      calculation_method: "PERCENTAGE",
      percentage_rate: 1.5,
      currency: "GHS",
      applicability: "ALL_MERCHANTS",
      is_active: true,
      valid_from: new Date(Date.now() - 60_000),
      ...overrides,
    })
    .returning("*");
  return row;
}

export async function createLedgerAccount(
  ownerId: string | null,
  accountType: string,
  currency = "GHS"
) {
  const [row] = await db("ledger_accounts")
    .insert({
      owner_id: ownerId,
      account_type: accountType,
      currency,
      label: `${accountType} (${currency})`,
    })
    .returning("*");
  return row;
}

/**
 * Post a ledger entry directly. `createdAt` lets a test place a credit inside
 * or outside the withdrawal aging window.
 */
export async function createLedgerEntry(params: {
  accountId: string;
  entryType: "CREDIT" | "DEBIT";
  amount: bigint | number | string;
  currency?: string;
  settlementId?: string | null;
  transactionId?: string | null;
  createdAt?: Date;
}) {
  const [row] = await db("ledger_entries")
    .insert({
      entry_id_display: `LE-${uniq().toUpperCase()}-${crypto
        .randomUUID()
        .slice(0, 4)
        .toUpperCase()}`,
      account_id: params.accountId,
      entry_type: params.entryType,
      amount: String(params.amount),
      currency: params.currency ?? "GHS",
      settlement_id: params.settlementId ?? null,
      transaction_id: params.transactionId ?? null,
      ...(params.createdAt ? { created_at: params.createdAt } : {}),
    })
    .returning("*");
  return row;
}

export async function createTransaction(
  merchantId: string,
  overrides: Record<string, unknown> = {}
) {
  const [row] = await db("transactions")
    .insert({
      tx_id_display: `TRX-${uniq().toUpperCase()}`,
      merchant_id: merchantId,
      amount: "10000",
      currency: "GHS",
      method: "CRYPTO",
      status: "AUTHORIZED",
      ...overrides,
    })
    .returning("*");
  return row;
}

export async function createPaymentSession(
  merchantId: string,
  overrides: Record<string, unknown> = {}
) {
  const [row] = await db("payment_sessions")
    .insert({
      merchant_id: merchantId,
      amount: "10000",
      currency: "GHS",
      status: "ACTIVE",
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      ...overrides,
    })
    .returning("*");
  return row;
}

export async function createPaymentLink(
  merchantId: string,
  overrides: Record<string, unknown> = {}
) {
  const [row] = await db("payment_links")
    .insert({
      link_id_display: `LNK-${uniq().toUpperCase()}`,
      merchant_id: merchantId,
      title: "Test link",
      amount: "10000",
      currency: "GHS",
      is_active: true,
      ...overrides,
    })
    .returning("*");
  return row;
}

export async function createSettlementAccount(
  merchantId: string,
  overrides: Record<string, unknown> = {}
) {
  const [row] = await db("settlement_accounts")
    .insert({
      merchant_id: merchantId,
      account_type: "MOBILE_MONEY",
      provider_name: "MTN MoMo",
      account_name: "Test Merchant",
      account_number: "233241234567",
      is_default: true,
      is_verified: true,
      ...overrides,
    })
    .returning("*");
  return row;
}

export async function createWithdrawalRequest(
  merchantId: string,
  settlementAccountId: string,
  overrides: Record<string, unknown> = {}
) {
  const [row] = await db("withdrawal_requests")
    .insert({
      request_id_display: `WDR-${uniq().toUpperCase()}`,
      merchant_id: merchantId,
      settlement_account_id: settlementAccountId,
      amount: "5000",
      currency: "GHS",
      status: "PENDING",
      ...overrides,
    })
    .returning("*");
  return row;
}

export async function createSettlement(
  merchantId: string,
  overrides: Record<string, unknown> = {}
) {
  const [row] = await db("settlements")
    .insert({
      settlement_id_display: `STL-${uniq().toUpperCase()}`,
      merchant_id: merchantId,
      gross_amount: "50000",
      fees: "0",
      net_amount: "50000",
      currency: "GHS",
      status: "PENDING",
      date_range_start: new Date(Date.now() - 24 * 60 * 60 * 1000),
      date_range_end: new Date(),
      ...overrides,
    })
    .returning("*");
  return row;
}

export async function createWebhookEndpoint(
  merchantId: string,
  overrides: Record<string, unknown> = {}
) {
  const [row] = await db("webhook_endpoints")
    .insert({
      merchant_id: merchantId,
      url: "https://merchant.test/hooks",
      secret: `whsec_${uniq()}`,
      events: ["payment.success", "payment.failed"],
      is_active: true,
      ...overrides,
    })
    .returning("*");
  return row;
}

// ---------- Session and RBAC fixtures ----------

export async function createUserSession(
  userId: string,
  overrides: Record<string, unknown> = {}
) {
  const [row] = await db("user_sessions")
    .insert({ user_id: userId, ...overrides })
    .returning("*");
  return row;
}

export async function createAdminProfile(
  userId: string,
  overrides: Record<string, unknown> = {}
) {
  const [row] = await db("admin_profiles")
    .insert({
      user_id: userId,
      admin_id_display: `ADM-${uniq().toUpperCase()}`,
      ...overrides,
    })
    .returning("*");
  return row;
}

export async function createRole(name: string, isSystemRole = false) {
  const [row] = await db("roles")
    .insert({ name, is_system_role: isSystemRole })
    .returning("*");
  return row;
}

export async function createPermission(name: string) {
  const [row] = await db("permissions").insert({ name }).returning("*");
  return row;
}

/** Attach a role to an admin profile. */
export async function assignRole(adminProfileId: string, roleId: string) {
  await db("admin_roles").insert({
    admin_profile_id: adminProfileId,
    role_id: roleId,
  });
}

/** Grant a permission to a role. */
export async function grantPermission(roleId: string, permissionId: string) {
  await db("role_permissions").insert({
    role_id: roleId,
    permission_id: permissionId,
  });
}
