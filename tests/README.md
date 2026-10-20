# Tests

Two projects. The unit layer is hermetic and runs anywhere; the integration
layer runs against a real, disposable Postgres.

```bash
npm test              # unit only (fast, no database)
npm run test:integration
npm run test:all      # both
npm run test:watch    # unit, watching
npm run test:coverage # both, with coverage
```

## Layout

```
tests/
  setup.ts                  # unit env setup
  stubs/server-only.ts      # alias target for the `server-only` package
  helpers/cookie-jar.ts     # in-memory stand-in for the Next cookie store
  lib/                      # unit tests, mirroring src/lib/
  app/                      # unit tests for code exported from src/app/
  integration/
    global-setup.ts         # creates + migrates the test database, once per run
    setup.ts                # points @/lib/db at the test database
    db-url.ts               # where the test database lives
    helpers/db.ts           # resetDatabase / closeDatabase
    helpers/factories.ts    # fixture builders
    lib/                    # integration tests, mirroring src/lib/
```

## Unit layer

Deterministic, pure logic on the money and auth paths:

| Module | What is pinned |
| --- | --- |
| `lib/utils` | minor-unit conversion, float-error handling, MSISDN normalisation |
| `lib/fees` | `calculateFee`: rounding, caps, tiered bands, bigint exactness |
| `lib/csv` | RFC 4180 escaping, including row-injection via merchant-supplied text |
| `lib/payments/networks` | telco resolution, incl. the `\bat\b` word-boundary regression |
| `lib/session` | JWT round-trip plus tamper, foreign-secret, expiry and `alg` confusion; cookie flags (httpOnly, sameSite, secure-in-prod), 7-day TTL agreement between cookie and token, delete |
| `lib/mfa` | backup-code single-use, TOTP verification, code alphabet |
| `lib/mfa-policy` | the mandatory-MFA role set claimed to the regulator |
| `lib/api-keys`, `lib/tokens` | hash-only persistence, entropy, prefix handling |
| `lib/webhooks/deliver` | the `t=<unix>,v1=<hmac>` signing contract merchants verify against |
| `lib/webhooks/payloads` | `amount` vs `charged_amount` under customer-borne fees |
| `lib/payments/controls` | pause-state predicate |
| `app/api/webhooks/{paystack,triton}` | inbound signature verification: algorithm, secret, replay, tamper, and length-mismatch handling |

`tests/setup.ts` repoints `DATABASE_URL` at a closed port before any module
loads. Knex connects lazily, so importing `@/lib/db` is safe, but any unit test
that accidentally issues a query fails loudly instead of reaching the dev
database (which `.env` sometimes points at a remote instance). Do not weaken
this — put the test in the integration project instead.

`server-only` is aliased to a stub via `vitest.config.mts`. The real package
exists to fail the build when server code leaks into a client bundle; under test
it has nothing to protect.

## Integration layer

| Area | What is pinned |
| --- | --- |
| `lib/fees` | schedule precedence (`MERCHANT_SPECIFIC` > `MERCHANT_TIER` > `ALL_MERCHANTS`), validity windows, currency binding, rail/method scoping |
| `lib/fees` charging | `fee_ledger` rate snapshot, balanced DEBIT/CREDIT pair, `processing_fee` increment, rollback with the caller's transaction, `ensureLedgerAccount` races |
| `lib/guards` (API key) | unknown vs revoked keys being indistinguishable, per-merchant and per-endpoint rate-limit budgets, `EMAIL_NOT_VERIFIED` / `KYC_NOT_APPROVED` gates, auth rate limiting |
| `lib/guards` (session) | authentication, `expiresAt`, role matching, session revocation taking effect immediately, the mandatory-MFA enrollment gate, RBAC permission resolution, and the merchant mobile/email/KYC verification chain |
| `lib/settlements/balance` | aging window, settlement-linked credits staying withdrawable, `PENDING`/`PROCESSING` withdrawal holds, currency and merchant isolation |
| `lib/payments/controls` | pausing expires outstanding sessions atomically, audit logs, no partial state on failure |
| `lib/payments/crypto-helpers` | `AUTHORIZED → SETTLED` once and only once, `SELECT ... FOR UPDATE` behaviour under a competing lock, ledger and webhook effects, expiry path |
| migration 0044 | `ledger_entries` and `system_logs` reject UPDATE and DELETE |

### The database

`tests/integration/global-setup.ts` creates the database if it is missing and
migrates it with the project's own knex CLI — the same command as
`npm run db:migrate`. Migrating through the real path means the integration run
is also a continuous check that the migration chain applies cleanly from
scratch.

Default target is `postgres://$USER@127.0.0.1:5432/trite_test`. Override with
`TEST_DATABASE_URL` (CI sets it to the workflow's Postgres service). Anything
this points at will have every table truncated between tests, so never aim it
at a database you care about.

### Isolation

`resetDatabase()` truncates every table in a `beforeEach`. The usual
wrap-in-a-transaction-and-roll-back trick does not work here: the code under
test opens its own `db.transaction()` on the singleton, which is a separate
connection from any transaction a test could hold open.

`system_logs` and `ledger_entries` refuse TRUNCATE unless
`trite.allow_immutable_writes` is on (migration 0044), so the reset takes the
same documented escape hatch the seeds use — `SET LOCAL` inside an explicit
transaction.

Integration files run serially (`fileParallelism: false`) because they share
one database.

### The cookie seam

`src/lib/session.ts` is the only module in `src/lib` that imports
`next/headers`, and every session-based guard funnels through its
`getSession()` -> `cookies()`. Outside a request context that call has nothing
to read, which is what kept the whole session-guard surface untestable.

`tests/helpers/cookie-jar.ts` is an in-memory stand-in for the cookie store.
Because `vi.mock` is hoisted above imports, the factory goes at the top of the
test file:

```ts
vi.mock("next/headers", async () => {
  const { cookiesMock } = await import("../helpers/cookie-jar");
  return { cookies: cookiesMock };
});
```

Then drive it with `cookieJar.set(...)`, and `cookieJar.clear()` in a
`beforeEach` so cookies never leak between tests. Integration tests sign in
through the real `createSession()` rather than hand-crafting tokens, so the
cookie-writing path is exercised too.

### Outbound calls

Tests never make real network calls. Where a function fires post-commit side
effects (`attemptDelivery`, `notifyTransactionSettled`), the module is mocked
and the call asserted; the enqueue itself is verified from the `webhook_events`
table, since that write happens inside the transaction under test.

### Testing code that lives in a route

The Paystack and Triton signature verifiers are exported from their
`route.ts` so they can be unit-tested directly. Next only constrains the
HTTP-method exports of a route module — its generated validator checks
`typeof import(route)` against a structural `extends RouteHandlerConfig`,
which permits additional exports — so the extra export is inert at build and
runtime. Verified with a full `next build`.

Prefer this over reaching into a route handler through a fake request: the
verifier is pure, and both route modules import cleanly in the hermetic unit
project without opening a database connection.

## Still uncovered

- **Settlement processing**: `settlements/process.ts`, `settlements/finalize.ts`,
  `payments/settle-momo.ts`.
- **Provider adapters**: `payments/moolre.ts`, `paystack.ts`, `triton.ts`,
  `anm.ts` — these need recorded HTTP fixtures, not a database.
- **API route handlers** end to end. The cookie seam removes the blocker — 62
  of the 96 handlers sit behind a session guard — so these are now a matter of
  writing them.
- **React components** and the **checkout flow**. Note that Vitest does not
  support async Server Components (see the Next testing guide), so the async
  RSC pages need E2E rather than unit tests. Sync and client components are
  testable today: jsdom is installed, and a file opts in with a
  `// @vitest-environment jsdom` docblock.

### A note on the coverage report

The v8 reporter elides long filenames (`...to-helpers.ts`) and, in the merged
two-project run, drops rows for some fully-covered files — `session.ts` does
not appear in the table at all despite having 27 tests against it. Treat a
missing row as "not reported", not "not covered"; the mutation checks are the
more reliable signal.
