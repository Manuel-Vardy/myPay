/**
 * The integration suite runs against a real, disposable Postgres database.
 *
 * Override with TEST_DATABASE_URL. The default targets a local server (the
 * Postgres.app / homebrew setup most of the team runs) using the OS username,
 * which is how a stock local install authenticates.
 *
 * This must never point at a database anyone cares about: the reset helper
 * truncates every table between tests.
 */
export const TEST_DATABASE_NAME = "trite_test";

export function testDatabaseUrl(): string {
  if (process.env.TEST_DATABASE_URL) return process.env.TEST_DATABASE_URL;
  const user = process.env.USER || process.env.USERNAME || "postgres";
  return `postgres://${user}@127.0.0.1:5432/${TEST_DATABASE_NAME}`;
}

/** Same server, but the maintenance database — used to CREATE DATABASE. */
export function maintenanceUrl(): string {
  const url = new URL(testDatabaseUrl());
  url.pathname = "/postgres";
  return url.toString();
}
