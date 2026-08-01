import type { Knex } from "knex";
import crypto from "crypto";

export async function seed(knex: Knex): Promise<void> {
  await knex("system_logs").del();
  await knex("support_tickets").del();
  await knex("kyc_records").del();
  await knex("settlements").del();
  await knex("transactions").del();
  await knex("role_permissions").del();
  await knex("permissions").del();
  await knex("roles").del();

  // --- Roles & Permissions ---
  const roleIds = {
    superAdmin: crypto.randomUUID(),
    compliance: crypto.randomUUID(),
    support: crypto.randomUUID(),
    audit: crypto.randomUUID(),
  };
  await knex("roles").insert([
    { id: roleIds.superAdmin, name: "Super Admin", description: "Unrestricted platform-wide access", is_system_role: true },
    { id: roleIds.compliance, name: "Compliance Officer", description: "KYC approval and regulatory monitoring", is_system_role: true },
    { id: roleIds.support, name: "Support Agent", description: "Ticket resolution and transaction view", is_system_role: true },
    { id: roleIds.audit, name: "Read-only Audit", description: "Observer access for external auditors", is_system_role: false },
  ]);

  const permIds = {
    manageUsers: crypto.randomUUID(),
    approveKyc: crypto.randomUUID(),
    refund: crypto.randomUUID(),
    viewLogs: crypto.randomUUID(),
    manageRoles: crypto.randomUUID(),
    settlements: crypto.randomUUID(),
  };
  await knex("permissions").insert([
    { id: permIds.manageUsers, name: "manage-users", description: "Add, suspend, or terminate accounts." },
    { id: permIds.approveKyc, name: "approve-kyc", description: "Review identity documents and verify profiles." },
    { id: permIds.refund, name: "refund-transactions", description: "Authorize reversal of funds." },
    { id: permIds.viewLogs, name: "view-logs", description: "Access detailed activity history." },
    { id: permIds.manageRoles, name: "manage-roles", description: "Create or modify permission groups." },
    { id: permIds.settlements, name: "settlement-monitoring", description: "Real-time view of bank transfer flows." },
  ]);

  await knex("role_permissions").insert([
    // Super Admin gets all
    ...Object.values(permIds).map((pid) => ({ role_id: roleIds.superAdmin, permission_id: pid })),
    // Compliance
    { role_id: roleIds.compliance, permission_id: permIds.manageUsers },
    { role_id: roleIds.compliance, permission_id: permIds.approveKyc },
    { role_id: roleIds.compliance, permission_id: permIds.viewLogs },
    { role_id: roleIds.compliance, permission_id: permIds.settlements },
    // Support
    { role_id: roleIds.support, permission_id: permIds.viewLogs },
    // Audit
    { role_id: roleIds.audit, permission_id: permIds.viewLogs },
  ]);

  // --- Fetch merchant IDs ---
  const merchants = await knex("merchants").select("id", "region");
  if (merchants.length === 0) return;

  const m = (i: number) => merchants[i % merchants.length].id;

  // --- Transactions ---
  const txIds = Array.from({ length: 10 }, () => crypto.randomUUID());
  const methods = ["CARD", "MOBILE_MONEY", "BANK_TRANSFER", "USSD", "CRYPTO"];
  const statuses = ["SETTLED", "SETTLED", "SETTLED", "INITIATED", "FAILED"];
  const flags = ["NONE", "NONE", "NONE", "NONE", "MEDIUM", "HIGH"];

  await knex("transactions").insert(
    txIds.map((id, i) => ({
      id,
      tx_id_display: `TX-${Date.now().toString(36).toUpperCase()}-${i}`,
      merchant_id: m(i),
      amount: [124500, 24050, 85000, 112099, 45000, 32000, 89000, 250000, 150000, 75000][i],
      currency: "GHS",
      crypto_amount: null,
      crypto_currency: null,
      method: methods[i % methods.length],
      status: statuses[i % statuses.length],
      flag_level: flags[i % flags.length],
      gateway_node: ["ACC-EAST-1", "KSI-NORTH", "TMA-CENTRAL", "CC-WEST", "TML-NORTH"][i % 5],
      processing_fee: 0,
      network_gas: 0,
      metadata: "{}",
    }))
  );

  // --- Settlements ---
  await knex("settlements").insert(
    merchants.slice(0, 4).map((merchant, i) => ({
      id: crypto.randomUUID(),
      settlement_id_display: `SETL-${9281 - i}-XM`,
      merchant_id: merchant.id,
      gross_amount: [842900, 1029450, 921000, 540000][i],
      fees: [14210, 18490, 15800, 9200][i],
      net_amount: [828690, 1010960, 905200, 530800][i],
      currency: "GHS",
      status: i < 2 ? "COMPLETED" : "PENDING",
      date_range_start: knex.raw(`NOW() - INTERVAL '${(i + 1) * 7} days'`),
      date_range_end: knex.raw(`NOW() - INTERVAL '${i * 7} days'`),
      transaction_count: [24, 31, 18, 12][i],
    }))
  );

  // --- KYC Records ---
  const users = await knex("users").where("role", "MERCHANT").select("id");
  await knex("kyc_records").insert(
    users.slice(0, 6).map((user, i) => ({
      id: crypto.randomUUID(),
      user_id: user.id,
      identity_id: `TR-${8829 - i}-KYC-${i + 1}`,
      tier: ["PREMIUM", "STANDARD", "ENHANCED", "STANDARD", "ENHANCED", "PREMIUM"][i],
      status: ["PENDING", "PENDING", "IN_REVIEW", "PENDING", "PENDING", "IN_REVIEW"][i],
      process_time_ms: [252000, 840000, null, 180000, 300000, null][i],
      region: "GH",
      submitted_at: knex.raw(`NOW() - INTERVAL '${[2, 14, 60, 180, 240, 300][i]} minutes'`),
    }))
  );

  // --- Support Tickets ---
  const merchantIds = merchants.map((m) => m.id);
  await knex("support_tickets").insert([
    { id: crypto.randomUUID(), ticket_id_display: "TKT-00001", merchant_id: merchantIds[0], issue_type: "INTEGRATION_SUPPORT", priority: "HIGH", status: "IN_PROGRESS", description: "504 timeouts on /authorize endpoint since 09:00 UTC." },
    { id: crypto.randomUUID(), ticket_id_display: "TKT-00002", merchant_id: merchantIds[1], issue_type: "SETTLEMENT_ISSUE", priority: "MEDIUM", status: "OPEN", description: "Batch settlement shows GH₵12,450 less than expected." },
    { id: crypto.randomUUID(), ticket_id_display: "TKT-00003", merchant_id: merchantIds[2], issue_type: "KYC_QUERY", priority: "HIGH", status: "IN_PROGRESS", description: "Users unable to upload documents larger than 5MB." },
    { id: crypto.randomUUID(), ticket_id_display: "TKT-00004", merchant_id: merchantIds[3], issue_type: "PAYMENT_DISPUTE", priority: "HIGH", status: "OPEN", description: "Webhooks delayed by 15-20 minutes." },
    { id: crypto.randomUUID(), ticket_id_display: "TKT-00005", merchant_id: merchantIds[4], issue_type: "SETTLEMENT_ISSUE", priority: "MEDIUM", status: "RESOLVED", description: "Refund processed twice. Need to reverse duplicate." },
  ]);

  // --- System Logs ---
  const logEntries = [
    { level: "CRITICAL", source: "AUTH_CORE_V2", event_description: "Failed brute-force attempt from IP 192.168.1.104 on admin portal" },
    { level: "ERROR", source: "GATEWAY_API", event_description: "Timeout exceeded during handshake with external payment processor" },
    { level: "WARN", source: "DB_CLUSTER_B", event_description: "Query execution time exceeded threshold (842ms) - KYC table scan" },
    { level: "INFO", source: "KYC_HANDLER", event_description: "Identity verification completed for user_id: TR-99428-X" },
    { level: "INFO", source: "WEB_APP_SERVER", event_description: "Health check heart-beat acknowledged. Cluster integrity nominal" },
    { level: "CRITICAL", source: "SYSTEM_KERNEL", event_description: "Unexpected kernel panic in background scheduler - auto-recovery initiated" },
    { level: "INFO", source: "AUTH_CORE_V2", event_description: "Admin login session created for user: admin@trite.io" },
    { level: "WARN", source: "TRANSACTION_ENGINE", event_description: "High volume alert: 450 transactions/minute detected on mobile money gateway" },
    { level: "ERROR", source: "NOTIFICATION_SERVICE", event_description: "SMS gateway timeout - MTN Ghana API returning 503 errors" },
    { level: "INFO", source: "SETTLEMENT_CORE", event_description: "Batch settlement completed: GH₵2.4M processed to 14 merchant accounts" },
  ];
  await knex("system_logs").insert(logEntries.map((l) => ({ ...l, metadata: "{}" })));
}
