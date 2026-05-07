# TRITE PSP — Admin UI & API Audit + Action Plan

> **Date:** 2026-04-27  
> **Scope:** Admin pages, API routes, database schema, auth layer — reviewed against AGENTS.md  
> **Status:** In-progress platform build; UI shells present, API layer partially wired, auth not yet integrated into pages.

---

## 1. Admin UI — Page-by-Page Review

### 1.1 Pages That Exist

| Page | Path | Data Source | Live Data? | Notes |
|------|------|-------------|:----------:|-------|
| Dashboard | `/admin` | `useAdminFetch("/api/admin/dashboard")`, `/api/admin/kyc`, `/api/admin/analytics` | ✅ | Stats, liquidity chart, activity table, security alerts, regional performance all wired to APIs |
| Login | `/admin/login` | None | ❌ | **Not wired** — `handleSubmit` just does `router.push("/admin")`, bypasses auth API entirely |
| Signup | `/admin/signup` | None | ❌ | **Not wired** — `handleSubmit` does `router.push("/admin/login")`, no API call |
| User Directory | `/admin/users` | `useAdminFetch("/api/admin/users")` | ✅ | Paginated, search & filter by status. Tier filter is client-only (not sent to API) |
| Transactions | `/admin/transactions` | `useAdminFetch("/api/admin/transactions")` | ✅ | Status filter, search, pagination all wired. Pagination buttons at bottom not fully functional |
| KYC Center | `/admin/kyc` | `useAdminFetch("/api/admin/kyc")` | ✅ | Stats, verification queue, pagination. Approve/Reject buttons exist but are **not wired** to API |
| System Logs | `/admin/logs` | `useAdminFetch("/api/admin/logs")` | ✅ | Console view with live indicator. Stats cards are **hardcoded** (12 Critical, 48 Warnings, etc.) |
| Role Management | `/admin/roles` | `useAdminFetch("/api/admin/roles")` | ✅ | Role list, permission checkboxes, save button — all wired with `PUT /api/admin/roles` |
| Support Center | `/admin/support` | `useAdminFetch("/api/admin/support")` | ✅ | Ticket list, quick resolve with reply textarea — wired with `PATCH /api/admin/support/[id]` |

### 1.2 Pages That Are Missing (per AGENTS.md spec)

| Required Feature | Status | Details |
|-----------------|--------|---------|
| Admin Settings | ❌ **Missing** | Sidebar links to `/admin/settings` but **no page exists**. Needed for admin profile, notification prefs, system config |
| Admin Layout Shell | ❌ **Missing** | No shared `layout.tsx` under `/admin` — every page copy-pastes the full sidebar + header (~120 lines each) |
| MFA Verification Step | ❌ **Missing** | Login API returns `mfa_required` but there is **no MFA prompt UI** after login |

---

## 2. API Routes — Inventory & Gap Analysis

### 2.1 Admin APIs

| Route | Method | Status | Notes |
|-------|--------|--------|-------|
| `/api/admin/dashboard` | GET | ✅ Implemented | Queries `transactions`, `merchants`, `settlements` — **no auth guard** |
| `/api/admin/analytics` | GET | ✅ Implemented | Regional performance by merchant region — **no auth guard** |
| `/api/admin/users` | GET | ✅ Implemented | Paginated with search, joins users + merchants — **no auth guard** |
| `/api/admin/transactions` | GET | ✅ Implemented | Paginated with status/search filters — **no auth guard** |
| `/api/admin/kyc` | GET | ✅ Implemented | Paginated queue with stats — **no auth guard** |
| `/api/admin/kyc/[id]` | PATCH | ✅ Implemented | Approve/reject individual KYC record — **no auth guard** |
| `/api/admin/logs` | GET | ✅ Implemented | Paginated system logs — **no auth guard** |
| `/api/admin/roles` | GET, PUT | ✅ Implemented | List roles + update permissions — **no auth guard** |
| `/api/admin/support` | GET | ✅ Implemented | List tickets with filters — **no auth guard** |
| `/api/admin/support/[id]` | PATCH | ✅ Implemented | Add reply message to ticket — **no auth guard** |

### 2.2 Auth APIs

| Route | Method | Status | Notes |
|-------|--------|--------|-------|
| `/api/auth/login` | POST | ✅ Implemented | Password verification, MFA check, session creation, audit logging |
| `/api/auth/register` | POST | ✅ Implemented | Merchant registration with bcrypt |
| `/api/auth/logout` | POST | ✅ Implemented | Clears session cookie |
| `/api/auth/me` | GET | ✅ Implemented | Returns session user info |
| `/api/auth/mfa` | POST | ✅ Implemented | TOTP verification |

### 2.3 Merchant APIs

| Route | Method | Status |
|-------|--------|--------|
| `/api/merchant/dashboard` | GET | ✅ |
| `/api/merchant/analytics` | GET | ✅ |
| `/api/merchant/transactions` | GET | ✅ |
| `/api/merchant/settlements` | GET | ✅ |
| `/api/merchant/customers` | GET | ✅ |
| `/api/merchant/settings` | GET, PUT | ✅ |
| `/api/merchant/settings/keys/[keyId]` | DELETE | ✅ |
| `/api/merchant/settlement-accounts` | GET, POST | ✅ |
| `/api/merchant/settlement-accounts/[id]` | PUT, DELETE | ✅ |

### 2.4 Public Payment APIs

| Route | Method | Status |
|-------|--------|--------|
| `/api/payments/initiate` | POST | ✅ |
| `/api/payments/[sessionId]` | GET | ✅ |
| `/api/payments/[sessionId]/status` | GET | ✅ |
| `/api/payments/process` | POST | ✅ |

---

## 3. Critical Issues Found

### 🔴 P0 — Security: No Auth Guards on Admin APIs

**Every admin API route has a `// TODO: Add auth middleware` comment but NO actual authorization check.** Any unauthenticated client can hit `/api/admin/dashboard`, `/api/admin/users`, etc. and receive full platform data.

**Impact:** All admin endpoints are publicly accessible. This is the single highest-priority fix.

**Fix:** Create a shared `requireAdmin()` helper that calls `getSession()`, checks `role === "ADMIN"`, and returns 401/403 if invalid. Apply to all `/api/admin/*` routes.

### 🔴 P0 — Auth: Login/Signup Pages Not Wired

The admin login page (`/admin/login`) bypasses the auth API entirely:

```tsx
// Current — just navigates, no auth
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  router.push("/admin");
};
```

**Fix:** Wire to `POST /api/auth/login`, handle `mfa_required` response, display errors.

### 🟡 P1 — Missing Admin Layout Shell

Every admin page duplicates the **entire** sidebar + header (~120+ lines). This means:
- Sidebar navigation state isn't preserved across pages (each page has its own `useState("dashboard")`)
- Any sidebar/header change must be replicated across **8 files**
- Mobile sidebar backdrop z-index varies between pages (z-40 vs z-60)

**Fix:** Extract a shared `/admin/layout.tsx` with the sidebar, header, and mobile drawer logic.

### 🟡 P1 — KYC Approve/Reject Not Wired

The KYC page renders approve (✓) and reject (✗) buttons but they have **no onClick handlers**. The API endpoint `PATCH /api/admin/kyc/[id]` exists and accepts `{ status, review_notes }`.

### 🟡 P1 — Logs Page Stats Are Hardcoded

The stats cards at the top of `/admin/logs` show hardcoded values:
- "12 Critical", "48 Warnings", "1.2k Info", "42.5k Total Events"

These should be computed from the `system_logs` table (e.g., `COUNT(*) WHERE level = 'CRITICAL'`).

### 🟡 P1 — Missing Admin Settings Page

Sidebar links to `/admin/settings` but no `page.tsx` exists. Per AGENTS.md, admin settings should cover system configuration, admin profile management, and notification preferences.

### 🟢 P2 — Inconsistent Icon Systems

Some pages use Lucide React imports directly:
- Dashboard, Users, Transactions, Logs → `import { ... } from "lucide-react"`

Others define custom SVG icon components at the bottom of the file:
- KYC → ~150 lines of custom SVG icon functions (`LayoutGridIcon`, `UsersIcon`, etc.)
- Roles → Same duplication

**Fix:** Standardize on Lucide React everywhere and remove the hand-rolled SVG icons.

### 🟢 P2 — Transaction Page Pagination Buttons

The first/last/prev/next buttons in the transactions page are visually present but **not connected** to the `page` state variable. Only the rows-per-page select works.

### 🟢 P2 — `useAdminFetch` Hook Lacks Auth Headers

The `useAdminFetch` hook does a bare `fetch(path)` with no `credentials: "include"` option. Since the session token is stored in an httpOnly cookie, this likely works for same-origin requests, but explicitly setting `credentials: "include"` would be more robust.

---

## 4. Database Schema Coverage

### Migrations Present

| Migration | Tables Created |
|-----------|---------------|
| `0001_users_merchants` | `users`, `admin_profiles`, `merchants` |
| `0002_roles_permissions` | `roles`, `permissions`, `role_permissions`, `user_roles` |
| `0003_transactions_settlements` | `transactions`, `settlements`, `payment_sessions` |
| `0004_compliance_logs` | `kyc_records`, `support_tickets`, `system_logs` |
| `0005_add_user_merchant_fields` | Adds `first_name`, `last_name` to users; `phone` to merchants |
| `0006_add_notification_passkey_fields` | Adds notification preferences and passkey fields |
| `0007_settlement_accounts` | `settlement_accounts` table |

### Schema vs AGENTS.md Alignment

| AGENTS.md Feature | DB Support | Notes |
|-------------------|:----------:|-------|
| Admin MFA | ✅ | `users.two_factor_enabled`, `users.two_factor_secret` |
| Merchant Tiers | ✅ | `merchants.tier` enum (STANDARD/PREMIUM/ENTERPRISE/INSTITUTIONAL) |
| API Key Management | ✅ | `merchants.api_keys` JSONB column |
| Transaction Methods | ✅ | `transactions.method` enum covers CARD, CRYPTO, ACH, SWIFT, MOBILE_MONEY, BANK_TRANSFER, DIGITAL_WALLET |
| Flag/Anomaly Detection | ✅ | `transactions.flag_level` (NONE/LOW/MEDIUM/HIGH) |
| KYC Tiers & Documents | ✅ | `kyc_records` with tier, status, documents JSONB |
| Support Tickets | ✅ | `support_tickets` with messages JSONB, priority, status |
| System Logs | ✅ | `system_logs` with level, source, actor_id, ip_address |
| RBAC | ✅ | `roles`, `permissions`, `role_permissions`, `user_roles` join tables |

---

## 5. Auth Infrastructure Status

| Component | Status | Details |
|-----------|--------|---------|
| Password hashing | ✅ | bcryptjs with 12 salt rounds |
| JWT session | ✅ | jose HS256, 7-day TTL, httpOnly cookie |
| Session helpers | ✅ | `createSession`, `getSession`, `deleteSession`, `encrypt`, `decrypt` |
| TOTP/MFA | ✅ API only | `otplib` in dependencies, `/api/auth/mfa` endpoint exists |
| Route protection | ❌ | No middleware or per-route guards in place |
| UI integration | ❌ | Login/signup forms submit without calling auth APIs |

---

## 6. Prioritized Action Plan

### Phase 1 — Security & Auth (P0)

| # | Task | Files Affected | Effort |
|---|------|---------------|--------|
| 1.1 | Create `requireAdmin(request)` auth guard helper | New: `src/lib/guards.ts` | Small |
| 1.2 | Apply auth guard to all `/api/admin/*` routes | 10 route files | Medium |
| 1.3 | Wire `/admin/login` form to `POST /api/auth/login` | `src/app/admin/login/page.tsx` | Medium |
| 1.4 | Add MFA verification step after login returns `mfa_required` | `src/app/admin/login/page.tsx` (or new modal) | Medium |
| 1.5 | Wire `/admin/signup` form to admin registration endpoint | `src/app/admin/signup/page.tsx` + possibly new API route | Medium |
| 1.6 | Add `requireMerchant()` guard to `/api/merchant/*` routes | 9 route files | Medium |

### Phase 2 — Admin Layout & Missing Pages (P1)

| # | Task | Files Affected | Effort |
|---|------|---------------|--------|
| 2.1 | Extract shared admin layout (`sidebar`, `header`, `mobile drawer`) | New: `src/app/admin/layout.tsx`, refactor all 8 admin pages | Large |
| 2.2 | Create `/admin/settings` page | New: `src/app/admin/settings/page.tsx` | Medium |
| 2.3 | Wire KYC approve/reject buttons to `PATCH /api/admin/kyc/[id]` | `src/app/admin/kyc/page.tsx` | Small |
| 2.4 | Replace hardcoded logs stats with API-driven counts | `src/app/admin/logs/page.tsx` + update `/api/admin/logs` | Small |
| 2.5 | Fix transactions page pagination buttons | `src/app/admin/transactions/page.tsx` | Small |

### Phase 3 — Code Quality & Polish (P2)

| # | Task | Files Affected | Effort |
|---|------|---------------|--------|
| 3.1 | Remove duplicated SVG icon components from KYC & Roles pages | `kyc/page.tsx`, `roles/page.tsx` | Small |
| 3.2 | Standardize `z-index` values across sidebar/backdrop overlays | All admin pages (fixed after layout extraction) | Small |
| 3.3 | Add `credentials: "include"` to `useAdminFetch` and `useMerchantFetch` | 2 hook files | Trivial |
| 3.4 | Add loading states / skeleton UIs to admin pages | All admin pages | Medium |
| 3.5 | Add error boundary / error states to data-fetching pages | All admin pages | Medium |
| 3.6 | Implement admin logout flow (clear session + redirect) | Sidebar logout button across pages | Small |

---

## 7. Summary

The admin section of TRITE PSP has a **solid UI foundation** — all 7 core pages from the AGENTS.md spec (Dashboard, Users, Transactions, KYC, Logs, Roles, Support) are built with proper data-fetching hooks and responsive layouts.
The **API layer is comprehensive** with 10 admin endpoints, 5 auth endpoints, 7 merchant endpoints, and 4 payment endpoints — all backed by a well-structured PostgreSQL schema across 7 migrations.

The **critical gap** is that **nothing is actually secured**: admin APIs have no auth guards, and the login/signup pages don't call the auth endpoints. Phase 1 (auth wiring) is the top priority before any other work.
