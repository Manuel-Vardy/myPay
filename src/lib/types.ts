// ============================================================
// Shared TypeScript types for the TRITE PSP platform
// ============================================================

// ---------- Enums ----------

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "MERCHANT" | "CUSTOMER" | "SUPPORT";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION" | "DEACTIVATED";

export type MerchantTier = "STANDARD" | "PREMIUM" | "ENTERPRISE";

export type FeeBearer = "MERCHANT" | "CUSTOMER";

export type PaymentMethod =
  | "CARD"
  | "MOBILE_MONEY"
  | "BANK_TRANSFER"
  | "USSD"
  | "CRYPTO";

export type PaymentRail =
  | "VISA"
  | "MASTERCARD"
  | "MTN_MOMO"
  | "AT_MONEY"
  | "TELECEL_CASH"
  | "GHIPSS_NIP"
  | "USDT_TRC20"
  | "USDT_ERC20"
  | "USDC_ERC20"
  | "USDC_BASE"
  | "USDC_BSC"
  | "USDC_ETHEREUM"
  | "USDC_SOLANA"
  | "USDT_BASE"
  | "USDT_BSC"
  | "USDT_ETHEREUM"
  | "USDT_SOLANA";

export type TransactionStatus =
  | "INITIATED"
  | "PENDING_AUTH"
  | "AUTHENTICATED"
  | "AUTHORIZED"
  | "CAPTURED"
  | "PARTIALLY_CAPTURED"
  | "PENDING_SETTLEMENT"
  | "SETTLED"
  | "FAILED"
  | "CANCELLED"
  | "EXPIRED"
  | "REVERSED";

export type FlagLevel = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type SettlementStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
export type SessionStatus = "ACTIVE" | "COMPLETED" | "EXPIRED" | "CANCELLED";

export type KycTier = "STANDARD" | "ENHANCED" | "PREMIUM";
export type KycStatus = "PENDING" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "EXPIRED";

export type TicketIssueType = "PAYMENT_DISPUTE" | "SETTLEMENT_ISSUE" | "ACCOUNT_ACCESS" | "KYC_QUERY" | "INTEGRATION_SUPPORT" | "CHARGEBACK" | "OTHER";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "AWAITING_MERCHANT" | "RESOLVED" | "CLOSED";

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR" | "CRITICAL";

export type FeeType =
  | "PAYMENT_PROCESSING"
  | "PAYMENT_GATEWAY"
  | "CROSS_BORDER"
  | "CRYPTO_NETWORK_GAS"
  | "THREE_DS_AUTH"
  | "CHARGEBACK"
  | "REFUND_PROCESSING"
  | "SETTLEMENT_TRANSFER"
  | "SETTLEMENT_FX"
  | "EARLY_SETTLEMENT"
  | "SETTLEMENT_MINIMUM_SHORTFALL"
  | "MONTHLY_PLATFORM"
  | "API_CALL_OVERAGE"
  | "DISPUTE_MANAGEMENT"
  | "KYC_VERIFICATION";

export type FeeCalculationMethod =
  | "FLAT"
  | "PERCENTAGE"
  | "FLAT_PLUS_PERCENTAGE"
  | "TIERED";

export type FeeApplicability =
  | "ALL_MERCHANTS"
  | "MERCHANT_TIER"
  | "MERCHANT_SPECIFIC";

export type CustomerTier = "STANDARD" | "PREMIUM";
export type CustomerStatus = "ACTIVE" | "BLOCKED";

// ---------- Database Row Types ----------

export interface TwoFactorBackupCode {
  hash: string;
  used_at: string | null;
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  two_factor_enabled: boolean;
  two_factor_secret: string | null;
  two_factor_pending_secret: string | null;
  two_factor_backup_codes: TwoFactorBackupCode[] | null;
  status: UserStatus;
  last_login: Date | null;
  email_verified_at: Date | null;
  email_verification_token: string | null;
  email_verification_expires: Date | null;
  password_reset_token: string | null;
  password_reset_expires: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface AdminProfile {
  id: string;
  user_id: string;
  admin_id_display: string;
  notification_settings?: {
    systemAlerts: boolean;
    newRegistrations: boolean;
    complianceFlags: boolean;
    largeTransactions: boolean;
  };
  created_at: Date;
  updated_at: Date;
}

export interface Merchant {
  id: string;
  user_id: string;
  business_name: string;
  merchant_display_id: string;
  tier: MerchantTier;
  fee_bearer: FeeBearer;
  region: string | null;
  business_address_line1: string | null;
  business_address_line2: string | null;
  business_city: string | null;
  business_region: string | null;
  business_country: string | null;
  api_keys: ApiKeyEntry[];
  webhook_config: WebhookConfig;
  notification_email: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ApiKeyEntry {
  key_id: string;
  label: string;
  prefix: string; // first 8 chars visible
  created_at: string;
  last_used: string | null;
  is_active: boolean;
}

export interface WebhookConfig {
  url?: string;
  secret?: string;
  events?: string[];
}

// --- API integrations (migration 0026) ---
// ApiKeyEntry/WebhookConfig above describe the legacy merchants JSONB columns
// and go away when those columns are dropped.

export interface ApiKeyRow {
  id: string;
  merchant_id: string;
  key_hash: string; // sha256 hex of the raw key — never the key itself
  prefix: string;
  label: string;
  last_used_at: Date | null;
  revoked_at: Date | null; // null = active
  created_at: Date;
  updated_at: Date;
}

export interface WebhookEndpointRow {
  id: string;
  merchant_id: string;
  url: string;
  secret: string;
  events: string[];
  is_active: boolean;
  secret_rotated_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export type WebhookEventStatus = "PENDING" | "DELIVERED" | "FAILED" | "EXHAUSTED";

export interface WebhookEventRow {
  id: string;
  merchant_id: string;
  transaction_id: string | null;
  event_type: string;
  payload: Record<string, unknown>;
  endpoint_url: string;
  status: WebhookEventStatus;
  attempt_count: number;
  last_attempt_at: Date | null;
  next_retry_at: Date | null;
  delivered_at: Date | null;
  last_error: string | null;
  response_status: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  is_system_role: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Permission {
  id: string;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Transaction {
  id: string;
  tx_id_display: string;
  merchant_id: string;
  customer_id: string | null;
  payment_session_id: string | null;
  amount: number;
  currency: string;
  crypto_amount: number | null;
  crypto_currency: string | null;
  method: PaymentMethod;
  rail: PaymentRail | null;
  status: TransactionStatus;
  flag_level: FlagLevel;
  gateway_node: string | null;
  gateway_reference: string | null;
  crypto_network_hash: string | null;
  processing_fee: number;
  /** Pre-fee order amount fees are calculated against, when `amount` was
   *  inflated to include a customer-paid fee. Null when fee is merchant-borne. */
  fee_basis_amount: number | null;
  network_gas: number;
  failure_reason: string | null;
  payer_email: string | null;
  payer_wallet_address: string | null;
  payer_phone: string | null;
  card_token: string | null;
  card_last_four: string | null;
  card_brand: string | null;
  momo_reference: string | null;
  three_ds_session_id: string | null;
  three_ds_status: string | null;
  idempotency_key: string | null;
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface TransactionEvent {
  id: string;
  transaction_id: string;
  from_status: TransactionStatus | null;
  to_status: TransactionStatus;
  triggered_by: string;
  raw_payload: Record<string, unknown> | null;
  created_at: Date;
}

export interface FeeSchedule {
  id: string;
  fee_type: FeeType;
  description: string | null;
  calculation_method: FeeCalculationMethod;
  flat_amount: number; // minor units
  percentage_rate: number; // 1.5 = 1.5%
  currency: string;
  minimum_amount: number | null;
  maximum_amount: number | null;
  applicability: FeeApplicability;
  merchant_tier: MerchantTier | null;
  merchant_id: string | null;
  applicable_rails: PaymentRail[] | null;
  applicable_methods: PaymentMethod[] | null;
  tiered_bands: TieredBand[] | null;
  is_active: boolean;
  valid_from: Date;
  valid_until: Date | null;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface TieredBand {
  from: number; // minor units, inclusive
  to: number | null; // minor units, inclusive; null = unbounded
  rate: number; // percentage e.g. 1.5
}

export interface FeeLedgerRow {
  id: string;
  fee_schedule_id: string | null;
  fee_type: FeeType;
  transaction_id: string | null;
  settlement_id: string | null;
  merchant_id: string;
  amount: number; // minor units
  currency: string;
  flat_amount_applied: number | null;
  percentage_rate_applied: number | null;
  basis_amount: number | null;
  is_waived: boolean;
  waived_by: string | null;
  waiver_reason: string | null;
  created_at: Date;
}

export interface Settlement {
  id: string;
  settlement_id_display: string;
  merchant_id: string;
  gross_amount: number;
  fees: number;
  net_amount: number;
  currency: string;
  status: SettlementStatus;
  date_range_start: Date;
  date_range_end: Date;
  transaction_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface PaymentSession {
  id: string;
  merchant_id: string;
  amount: number;
  currency: string;
  description: string | null;
  redirect_url: string | null;
  cancel_url: string | null;
  status: SessionStatus;
  metadata: Record<string, unknown>;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface PaymentLink {
  id: string;
  link_id_display: string;
  merchant_id: string;
  title: string;
  description: string | null;
  amount: number;
  currency: string;
  redirect_url: string | null;
  is_active: boolean;
  expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
}


export interface KycRecord {
  id: string;
  user_id: string;
  identity_id: string;
  tier: KycTier;
  status: KycStatus;
  process_time_ms: number | null;
  region: string | null;
  review_notes: string | null;
  reviewed_by: string | null;
  submitted_at: Date;
  reviewed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface KycDocument {
  id: string;
  kyc_id: string;
  doc_type: string;
  storage_key: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejection_reason: string | null;
  reviewed_at: Date | null;
  created_at: Date;
}

export interface Customer {
  id: string;
  merchant_id: string;
  user_id: string;
  tier: CustomerTier;
  status: CustomerStatus;
  total_spent: number;
  transaction_count: number;
  last_transaction_at: Date | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface SupportTicket {
  id: string;
  ticket_id_display: string;
  merchant_id: string;
  assigned_to: string | null;
  issue_type: TicketIssueType;
  priority: TicketPriority;
  status: TicketStatus;
  description: string | null;
  messages: TicketMessage[];
  created_at: Date;
  updated_at: Date;
}

export interface TicketMessage {
  sender_id: string;
  content: string;
  timestamp: string;
}

export interface SystemLog {
  id: number;
  level: LogLevel;
  source: string;
  event_description: string;
  actor_id: string | null;
  ip_address: string | null;
  metadata: Record<string, unknown>;
  timestamp: Date;
}

// ---------- API Request/Response Types ----------

export interface LoginRequest {
  email: string;
  password: string;
}

export interface MfaVerifyRequest {
  user_id: string;
  token: string;
}

export interface RegisterMerchantRequest {
  email: string;
  password: string;
  business_name: string;
  region?: string;
}

export interface AdminDashboardResponse {
  total_platform_volume: number;
  active_merchants: number;
  system_uptime: string;
  liquidity_inbound: number;
  liquidity_outbound: number;
  security_alerts: number;
  recent_transactions: Transaction[];
}

export interface MerchantDashboardResponse {
  available_balance: number;
  balance_currency: string;
  daily_volume: number;
  total_transactions: number;
  gateway_health: "OPERATIONAL" | "DEGRADED" | "DOWN";
}

export interface MerchantAnalyticsResponse {
  total_revenue: number;
  aov: number;
  conversion_rate: number;
  method_mix: Record<PaymentMethod, number>;
  revenue_by_region: Record<string, number>;
  revenue_trend: { date: string; amount: number }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface PaymentSessionResponse {
  session_id: string;
  merchant_name: string;
  amount: number;
  currency: string;
  stablecoin_equivalent: number;
  processing_fee: number;
  network_gas: string;
  available_methods: PaymentMethod[];
  expires_at: string;
}

export interface ProcessPaymentRequest {
  session_id: string;
  method: PaymentMethod;
  payer_email?: string;
  wallet_address?: string;
  card_token?: string;
  mobile_money_number?: string;
  mobile_money_network?: "MTN" | "TELECEL" | "AT";
  otp_code?: string;
}
