// Global test setup. Runs before every test file.
//
// The repo's .env points DATABASE_URL at a real dev database (sometimes a
// remote one), and importing most of src/lib transitively constructs the knex
// client. Knex connects lazily, so merely importing is safe — but a unit test
// that accidentally issues a query must fail loudly instead of reaching a live
// database. Pointing the connection at a closed local port guarantees that.
// `local` is the knexfile environment that reads DATABASE_URL directly.
process.env.DB_ENV = "local";
process.env.DATABASE_URL = "postgres://test:test@127.0.0.1:1/trite_test_unreachable";

// Deterministic secrets so signing/verification assertions are reproducible.
process.env.AUTH_SECRET = "test-auth-secret-do-not-use-outside-tests";
