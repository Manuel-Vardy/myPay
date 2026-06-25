<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
The following `AGENTS.md` file is structured to provide AI agents with a comprehensive overview of the platform's user roles, functional requirements, and UI specifications based on the project’s technical scope and wireframe designs.

---

# AGENTS.md: Development Guide for TRITE PSP

## 1. System Overview
TRITE PSP is a high-fidelity, stablecoin-enabled Payment Service Provider designed to bridge traditional banking with digital assets, specifically optimized for the African market. The platform provides seamless, high-velocity global settlements through an integrated stablecoin layer

## Theme
Colors:
- #fff - backgrounds mostly
- #22c55e - CTAs, etc
- #000 - minor
---

## 2. Core User Personas & Functional Scopes

### 2.1 Admin (Institutional Oversight)
**Scope:** Internal management and platform-wide monitoring.
* **Authentication:** Requires Admin ID/Email, Password, and mandatory Multi-Factor Authentication (MFA) to access the restricted terminal.
* **Oversight Dashboard:** Real-time monitoring of total platform volume, active merchant counts, system uptime (99.99%), and global liquidity inbound/outbound flows.
* **User Directory:** Capability to manage and audit institutional and individual accounts, including registration of new users and tracking verification tiers (Standard, Premium, Merchant).
* **Transaction Monitoring:** Live ledger views of SWIFT, ACH, and Crypto transactions with real-time status (Success, Failed, Pending) and anomaly detection insights.
* **KYC Center:** Management of user identity verification queues, process time tracking, and automated system alerts for regional compliance limits.
* **System Logs & Role Management:** Real-time security auditing through console outputs and granular permission-based control for roles such as Super Admin, Compliance Officer, and Support Agent.
* **Support Center:** Management of merchant inquiries and system escalations (e.g., timeout errors or settlement discrepancies).

### 2.2 Merchant / User (Institutional Portal)
**Scope:** Business-facing dashboard for managing revenue and operations.
* **Account Management:** Self-service registration and login with security health indicators and API key management (active key count).
* **Financial Overview:** View available institutional balances in stablecoins (e.g., USDT) with options to withdraw funds or view a detailed ledger.
* **Institutional Analytics:** High-level performance metrics including Total Revenue, Average Order Value (AOV), Conversion Rates, and Method Mix (Credit Cards, Digital Wallets, Bank Transfers).
* **Settlement Reporting:** Tracking of settlement IDs, gross amounts, and fees with real-time gateway health monitoring.
* **Customer Directory:** Management of client relationships, tracking spending patterns, and monitoring customer verification statuses (Verified, Pending).

### 2.3 Public (The Payer)
**Scope:** Unauthenticated users making payments via merchant-generated links.
* **Payment Method Selection:** Choice between Crypto & Stablecoin (MetaMask, WalletConnect), Mobile Money (MTN, Telcel), or Card & Local Wallet (Debit/Credit Card, Regional Bank Transfer).
* **Finalization:** Review of total amounts in fiat (USD) and stablecoin (USDT) equivalent, processing fees ($0.00), and network gas (Included).
* **Transaction Lifecycle:** Interactive processing states, successful payment confirmations with receipt viewing, or failure notifications with support contact options.

---

## 3. Technical Integration Reference
Agents should reference these third-party service estimates for implementation logic:
* **Compliance:** **Sumsub/Appruve** for KYC compliance, ohers for KYT.

---

## 4. Guardrails & Development Principles
1.  **Bank-Grade Security:** All interfaces must reflect "Bank-Grade Security" and end-to-end encryption.
2.  **Real-Time Performance:** Dashboards must prioritize "Institutional Oversight" via real-time telemetry.
3.  **African Optimization:** Payout logic must prioritize Mobile Money integrations for the Ghanaian market.

---

## 5. Where to Find What (Codebase Directory & File Guide)
This project is built as a **Next.js App Router** application with a **PostgreSQL** database managed via **Knex**.

### 5.1 Pages and Routing (Frontend)
- **Home / Landing Page**: [page.tsx](file:///Users/kwametwum/GitHub/Trite-1/src/app/page.tsx)
- **Admin Portal Pages**: [src/app/admin](file:///Users/kwametwum/GitHub/Trite-1/src/app/admin)
  - Layout & Navigation: [layout.tsx](file:///Users/kwametwum/GitHub/Trite-1/src/app/admin/(dashboard)/layout.tsx)
  - Overview Dashboard: [page.tsx](file:///Users/kwametwum/GitHub/Trite-1/src/app/admin/(dashboard)/page.tsx)
  - Subsections: KYC review, security logs, role management, settings, support escalation, and transaction tracking.
- **Merchant Portal Pages**: [src/app/merchant](file:///Users/kwametwum/GitHub/Trite-1/src/app/merchant)
  - Layout & Navigation: [layout.tsx](file:///Users/kwametwum/GitHub/Trite-1/src/app/merchant/layout.tsx)
  - Overview Dashboard: [page.tsx](file:///Users/kwametwum/GitHub/Trite-1/src/app/merchant/page.tsx)
  - Subsections: analytics, customer directory, settings, settlements, and transactions.
- **Public Checkout Portal (The Payer)**: [src/app/pay/[sessionId]](file:///Users/kwametwum/GitHub/Trite-1/src/app/pay/[sessionId]/page.tsx)

### 5.2 API Routes (Backend Handlers)
- **Authentication**: [src/app/api/auth](file:///Users/kwametwum/GitHub/Trite-1/src/app/api/auth) (handles login, logout, me, session creation, and MFA verification).
- **Admin Specific**: [src/app/api/admin](file:///Users/kwametwum/GitHub/Trite-1/src/app/api/admin) (handles KYC status updates, platform metrics, active admin session logs, and permissions).
- **Merchant Specific**: [src/app/api/merchant](file:///Users/kwametwum/GitHub/Trite-1/src/app/api/merchant) (analytics, API keys, balance queries, and settlement triggers).
- **Payment Handling**: [src/app/api/payments](file:///Users/kwametwum/GitHub/Trite-1/src/app/api/payments) and webhooks.

### 5.3 Database & Migrations
- **Knex Setup**: [knexfile.ts](file:///Users/kwametwum/GitHub/Trite-1/src/lib/db/knexfile.ts) (configured for PostgreSQL via `DATABASE_URL`).
- **Database Client**: [index.ts](file:///Users/kwametwum/GitHub/Trite-1/src/lib/db/index.ts) (exports default `db` instance).
- **Schema Migrations**: [src/lib/db/migrations](file:///Users/kwametwum/GitHub/Trite-1/src/lib/db/migrations) (defines table layouts: users, merchants, transactions, settlements, KYC, logs, banks, customers).
- **Database Seeds**: [src/lib/db/seeds](file:///Users/kwametwum/GitHub/Trite-1/src/lib/db/seeds) (pre-populates system roles, test users, and simulated transactions).

### 5.4 Components and UI Elements
- **Layout / Structural Components**: [src/components](file:///Users/kwametwum/GitHub/Trite-1/src/components) (Globe, Header, Footer, and Background elements).
- **UI Kit**: [src/components/ui](file:///Users/kwametwum/GitHub/Trite-1/src/components/ui) (buttons, inputs, and carousels).

### 5.5 Core Libraries & Custom Hooks
- **Security Guards**: [guards.ts](file:///Users/kwametwum/GitHub/Trite-1/src/lib/guards.ts) (handles server-side session role checking, e.g., `requireAdmin`, `requireMerchant`).
- **Session Manager**: [session.ts](file:///Users/kwametwum/GitHub/Trite-1/src/lib/session.ts) (handles encrypting/decrypting JWT tokens stored in `session` HTTP-only cookies).
- **TypeScript Types**: [types.ts](file:///Users/kwametwum/GitHub/Trite-1/src/lib/types.ts) (defines platform domains, enums, and database row mappings).
- **Payment Gateways**: [src/lib/payments](file:///Users/kwametwum/GitHub/Trite-1/src/lib/payments) (integrations for mobile money or processing adapters).
- **Fetch Hooks**: [src/lib/hooks](file:///Users/kwametwum/GitHub/Trite-1/src/lib/hooks) (`useAdminFetch` and `useMerchantFetch` to manage client-side state requests safely).

---

## 6. How Things Are Wired (System Architecture & Flows)

### 6.1 Database Connection & Queries
All data persistence uses **PostgreSQL**.
- Every API endpoint or server-side fetch imports the database client directly:
  ```ts
  import db from "@/lib/db";
  // Example query:
  const user = await db("users").where({ email }).first();
  ```
- Migrations are run using standard Knex CLI commands mapped in `package.json` (`npm run db:migrate`).

### 6.2 Authentication and Session Management
- **Token Generation**: On login validation (`/api/auth/login`), a secure JSON Web Token (JWT) is signed containing `userId`, `role`, and expiration date.
- **Cookie Storage**: The JWT is set into an `httpOnly`, `secure` (in production), and `sameSite: "lax"` cookie named `session`.
- **Middleware / Guard Validation**: Server-side routes verify credentials by calling helper guards (`requireRole("ADMIN")` or `requireRole("MERCHANT")`). These check cookie presence, decode the JWT, verify expiration, and confirm role hierarchy.
- **Client Session Context**: Pages use `/api/auth/me` or custom helper hooks to inspect the user's role and state dynamically.

### 6.3 Secure Route Execution Pattern
To perform authorized mutations or read telemetry, routes follow a strict gatekeeping pattern:
```ts
import { requireAdmin } from "@/lib/guards";

export async function GET(request: NextRequest) {
  // Enforce access control
  const guard = await requireAdmin();
  if (guard.error) return guard.error; // Returns 401 or 403 Response

  const { session } = guard; // Session contains verified actor info
  
  // Proceed with data retrieval using the db client...
}
```

### 6.4 Client-Side Fetching & State
- Admin and Merchant portals query their respective endpoints via custom wrapper hooks (`useAdminFetch` / `useMerchantFetch`).
- These hooks automatically forward credentials and handle loading/error states in React components.
