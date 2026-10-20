// Per-file setup for the integration project. Runs before the test file's
// module graph is imported, so `@/lib/db` picks up the test connection.
import { testDatabaseUrl } from "./db-url";

process.env.DB_ENV = "local";
process.env.DATABASE_URL = testDatabaseUrl();
process.env.AUTH_SECRET = "test-auth-secret-do-not-use-outside-tests";
