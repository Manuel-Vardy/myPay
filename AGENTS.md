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
- #92bd30 - CTAs, etc
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
