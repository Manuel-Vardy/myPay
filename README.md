# Trite PSP

A stablecoin-enabled Payment Service Provider bridging traditional banking and
digital assets, optimised for the African market. Merchants collect via mobile
money, card, or crypto; funds settle to a ledger and are paid out on a
schedule.

Next.js 16 (App Router) · React 19 · PostgreSQL via Knex · TypeScript

New to the codebase? Read **[docs/ONBOARDING.md](docs/ONBOARDING.md)** after
finishing the setup below — it covers the architecture, the payment
lifecycle, and the conventions that are not obvious from the code.

---

## Prerequisites

| | Version | Notes |
| --- | --- | --- |
| Node | 22+ | CI runs 22; local development is on 24 |
| PostgreSQL | 15 | Matches production. [Postgres.app](https://postgresapp.com) is fine on macOS |
| npm | 10+ | `package-lock.json` is committed — use `npm ci`, not `npm install` |

No external provider account is needed to run the app locally. Mobile money,
card, crypto, email, and SMS all degrade gracefully when their keys are blank.

## Setup

```bash
git clone <repo-url> && cd Trite-1
npm ci
```

Create your environment file:

```bash
cp env.example .env
```

`env.example` already carries the right local defaults, including
`NODE_ENV=local` and `DB_ENV=local`. You only need to fill in two values:

```bash
DATABASE_URL="postgresql://<user>@localhost:5432/trite"
AUTH_SECRET="<paste output of: openssl rand -base64 32>"
```

Leave every other key blank. `env.example` documents what each one turns on,
and everything optional degrades gracefully when unset — email logs instead of
sending, SMS falls back to the `000000` bypass code, and checkout still works
without device intelligence.

Do not change `NODE_ENV` to `development`. `src/lib/db/knexfile.ts` keys its
configuration by environment name, and only the `local` block reads
`DATABASE_URL`; `development` targets a Cloud SQL unix socket and fails on a
laptop. `DB_ENV` does the same job for the app process and takes precedence.

Create and populate the database:

```bash
createdb trite
npm run db:migrate
npm run db:seed
```

`db:migrate` applies 48 migrations; `db:seed` truncates the fixture tables and
loads test accounts, fee schedules, and platform data. Both read `.env`
through the knexfile, so run them after editing it.

Start the app:

```bash
npm run dev
```

http://localhost:3000 — check http://localhost:3000/api/health, which should
return `{"status":"ok"}`.

## Test accounts

All seeded accounts share the password `Password123!`.

| Email | Role | Notes |
| --- | --- | --- |
| `admin@trite.io` | Admin | See the MFA note below |
| `elena@galaventure.io` | Merchant | Gala Venture — the main fixture merchant |
| `kwame.a@accrafintech.gh` | Merchant | Accra FinTech — Enterprise tier |
| `m.thorne@icloud.com` | Merchant | **Suspended** — for testing the 403 path |

**First admin login takes two attempts, and this is expected.** The seed sets
`two_factor_enabled = true` without a TOTP secret. Sign in, submit any code at
the MFA prompt, and the app will report that MFA was not fully configured and
has been disabled. Sign in again and you are through. This self-heal lives in
[src/app/api/auth/mfa/route.ts](src/app/api/auth/mfa/route.ts) — an account
with MFA enabled and no secret is an unrecoverable lockout, so the route
treats it as not enabled rather than demanding a code that could never exist.

The seed also creates deterministic API keys so the docs and curl examples
work out of the box:

```
Gala Venture   trite_sk_deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef
Accra FinTech  trite_sk_cafebabecafebabecafebabecafebabecafebabecafebabecafebabecafebabe
```

## Commands

```bash
npm run dev              # dev server
npm run build            # production build
npm run lint             # eslint (see the note in the CI section)

npm test                 # unit tests — hermetic, no database, ~6s
npm run test:watch       # unit tests, watching
npm run test:integration # integration tests — needs local Postgres
npm run test:all         # both
npm run test:coverage    # both, with coverage

npm run db:migrate           # apply migrations
npm run db:migrate:rollback  # roll back the last batch
npm run db:migrate:make <name>
npm run db:seed              # reload fixtures (destructive — truncates)
```

The integration suite creates and migrates its own database, defaulting to
`postgres://$USER@127.0.0.1:5432/trite_test`. It truncates every table between
tests, so never point `TEST_DATABASE_URL` at anything you care about.

## Continuous integration

Three workflows in `.github/workflows/`:

- **test.yml** — typecheck (`tsc --noEmit`), eslint over `tests/` only, unit
  tests, and integration tests against a Postgres 15 service. Lint is scoped
  to the test sources deliberately: `npm run lint` currently reports 126
  pre-existing errors under `src/`, so a repo-wide gate would fail for reasons
  unrelated to the change under review.
- **security.yml** — dependency advisories and gitleaks secret scanning, on
  every PR and weekly on Mondays.
- **deploy-prod.yml** — production deployment to Google Cloud Run.

## Documentation

| Document | Contents |
| --- | --- |
| [docs/ONBOARDING.md](docs/ONBOARDING.md) | Architecture tour, payment lifecycle, conventions, first change |
| [AGENTS.md](AGENTS.md) | Personas, file map, integration reference — also the AI-agent brief |
| [tests/README.md](tests/README.md) | Test layers, database isolation, the cookie seam, coverage gaps |
| [env.example](env.example) | Every environment variable, annotated |

The production deployment plan — GCP topology, services, secrets, and the
deploy pipeline — is not in this repository. Ask a maintainer for it on the
company drive.
