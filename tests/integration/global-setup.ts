import { execFileSync } from "node:child_process";
import path from "node:path";
import { Client } from "pg";
import { maintenanceUrl, TEST_DATABASE_NAME, testDatabaseUrl } from "./db-url";

/**
 * Runs once per `vitest` invocation, before any integration test file.
 *
 * Creates the test database if it is missing, then brings it to the current
 * schema by shelling out to the project's own knex CLI command — the same one
 * `npm run db:migrate` uses. Migrating through the real path (rather than a
 * hand-maintained schema dump) means the integration suite is also a
 * continuous check that the migration chain applies cleanly from scratch.
 */
export async function setup() {
  const dbUrl = testDatabaseUrl();
  const dbName = new URL(dbUrl).pathname.slice(1);

  if (dbName !== TEST_DATABASE_NAME && !process.env.TEST_DATABASE_URL) {
    throw new Error(`Refusing to run integration tests against "${dbName}"`);
  }

  const admin = new Client({ connectionString: maintenanceUrl() });
  try {
    await admin.connect();
  } catch (cause) {
    throw new Error(
      `Cannot reach Postgres at ${maintenanceUrl().replace(/:[^:@/]*@/, ":***@")}.\n` +
        `Start a local server, or set TEST_DATABASE_URL. See tests/README.md.`,
      { cause }
    );
  }

  try {
    const { rows } = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [
      dbName,
    ]);
    if (rows.length === 0) {
      // Identifier cannot be parameterised; dbName is validated above.
      await admin.query(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`);
    }
  } finally {
    await admin.end();
  }

  try {
    execFileSync(
      "npx",
      [
        "knex",
        "migrate:latest",
        "--knexfile",
        "src/lib/db/knexfile.ts",
        // Pin the knexfile environment. The CLI otherwise picks it from
        // NODE_ENV, which vitest sets to "test" — a key the knexfile does not
        // define, so knex would fail with a bare "option 'client' is missing".
        "--env",
        "local",
      ],
      {
        cwd: path.resolve(import.meta.dirname, "../.."),
        // dotenv in knexfile.ts does not override an existing process env var,
        // so DATABASE_URL here wins over .env.
        env: { ...process.env, DB_ENV: "local", DATABASE_URL: dbUrl },
        stdio: "pipe",
      }
    );
  } catch (err) {
    // execFileSync stringifies stdio as byte arrays, which is unreadable.
    const e = err as { stderr?: Buffer; stdout?: Buffer };
    throw new Error(
      `Migrating the test database failed:\n${e.stderr?.toString() ?? ""}${
        e.stdout?.toString() ?? ""
      }`
    );
  }
}
