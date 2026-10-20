import db from "@/lib/db";

/**
 * Truncate every table between tests.
 *
 * The obvious alternative — wrap each test in a transaction and roll back —
 * does not work here: the code under test (finaliseCryptoPayment,
 * pauseMerchantPayments, processSettlement) opens its own `db.transaction()`
 * on the singleton, which is a separate connection from any transaction a test
 * could hold open. Truncation is slower but it actually isolates.
 *
 * `system_logs` and `ledger_entries` refuse TRUNCATE unless
 * `trite.allow_immutable_writes` is on (migration 0044). That guard is exactly
 * what we want in production, so the reset takes the same documented escape
 * hatch the seeds use: SET LOCAL inside an explicit transaction.
 */
let cachedTables: string[] | null = null;

async function tableNames(): Promise<string[]> {
  if (cachedTables) return cachedTables;
  const { rows } = await db.raw(`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename NOT LIKE 'knex_migrations%'
  `);
  cachedTables = rows.map((r: { tablename: string }) => `"${r.tablename}"`);
  return cachedTables!;
}

export async function resetDatabase(): Promise<void> {
  const tables = await tableNames();
  if (tables.length === 0) return;
  await db.transaction(async (trx) => {
    await trx.raw("SET LOCAL trite.allow_immutable_writes = 'on'");
    await trx.raw(`TRUNCATE TABLE ${tables.join(", ")} RESTART IDENTITY CASCADE`);
  });
}

/** Close the pool so vitest can exit cleanly. */
export async function closeDatabase(): Promise<void> {
  await db.destroy();
}

export { db };
