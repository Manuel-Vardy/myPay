// ============================================================
// Shared TypeScript types for the TRITE PSP platform
// ============================================================

// ---------- Enums ----------

export type UserRole = "ADMIN" | "MERCHANT" | "USER";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "PENDING";

export type MerchantTier = "STANDARD" | "PREMIUM" | "ENTERPRISE" | "INSTITUTIONAL";

export type PaymentMethod =
  | "CARD"
  | "CRYPTO"
  | "ACH"
  | "SWIFT"
  | "MOBILE_MONEY"
  | "BANK_TRANSFER"
  | "DIGITAL_WALLET";

export type TransactionStatus = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "REFUNDED";
export type FlagLevel = "NONE" | "LOW" | "MEDIUM" | "HIGH";

export type SettlementStatus = "PENDING" | "COMPLETED" | "FAILED";
export type SessionStatus = "ACTIVE" | "COMPLETED" | "EXPIRED";

export type KycTier = "STANDARD" | "PREMIUM" | "MERCHANT";
export type KycStatus = "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED" | "EXPIRED";

export type TicketIssueType = "GATEWAY_TIMEOUT" | "KYC_UPLOAD" | "PAYMENT" | "SETTLEMENT" | "ACCOUNT" | "OTHER";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export type LogLevel = "INFO" | "WARNING" | "ERROR" | "CRITICAL";

export type CustomerTier = "standard" | "enterprise" | "institutional";
export type CustomerStatus = "active" | "inactive";

// ---------- Database Row Types ----------

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  two_factor_enabled: boolean;
  two_factor_secret: string | null;
  status: UserStatus;
  last_login: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface AdminProfile {
  id: string;
  user_id: string;
  admin_id_display: string;
  created_at: Date;
  updated_at: Date;
}

export interface Merchant {
  id: string;
  user_id: string;
  business_name: string;
  merchant_display_id: string;
  tier: MerchantTier;
  region: string | null;
  available_balance: number;
  balance_currency: string;
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
  amount: number;
  currency: string;
  stablecoin_amount: number | null;
  stablecoin_currency: string | null;
  method: PaymentMethod;
  status: TransactionStatus;
  flag_level: FlagLevel;
  gateway_node: string | null;
  network_hash: string | null;
  processing_fee: number;
  network_gas: number;
  payer_email: string | null;
  payer_wallet_address: string | null;
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
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
  status: SessionStatus;
  transaction_id: string | null;
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
  documents: KycDocument[];
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
  type: string;
  url: string;
  uploaded_at: string;
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
