import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { closeDatabase, db, resetDatabase } from "./helpers/db";
import { createLedgerAccount, createLedgerEntry, createMerchant } from "./helpers/factories";

beforeEach(resetDatabase);
afterAll(closeDatabase);

/**
 * Guards the harness itself. If these fail, every other integration result is
 * suspect.
 */
describe("integration harness", () => {
  it("is connected to the disposable test database, not a real one", async () => {
    const { rows } = await db.raw("SELECT current_database() AS name");
    expect(rows[0].name).toMatch(/test/);
  });

  it("has the full migrated schema", async () => {
    const { rows } = await db.raw(
      "SELECT count(*)::int AS n FROM pg_tables WHERE schemaname = 'public'"
    );
    expect(rows[0].n).toBeGreaterThan(30);
  });

  it("resets state between tests", async () => {
    await createMerchant();
    expect(Number((await db("merchants").count("* as n").first())!.n)).toBe(1);
    await resetDatabase();
    expect(Number((await db("merchants").count("* as n").first())!.n)).toBe(0);
  });

  it("truncates append-only tables despite the migration 0044 guard", async () => {
    const account = await createLedgerAccount(null, "ESCROW");
    await createLedgerEntry({ accountId: account.id, entryType: "CREDIT", amount: 100n });
    await db("system_logs").insert({
      level: "INFO",
      source: "TEST",
      event_description: "harness check",
    });

    await expect(resetDatabase()).resolves.toBeUndefined();
    expect(Number((await db("ledger_entries").count("* as n").first())!.n)).toBe(0);
    expect(Number((await db("system_logs").count("* as n").first())!.n)).toBe(0);
  });
});

describe("append-only enforcement (migration 0044)", () => {
  it("refuses UPDATE and DELETE on ledger_entries from ordinary app code", async () => {
    const account = await createLedgerAccount(null, "ESCROW");
    const entry = await createLedgerEntry({
      accountId: account.id,
      entryType: "CREDIT",
      amount: 100n,
    });

    // The compliance claim is that ledger history cannot be rewritten.
    await expect(
      db("ledger_entries").where({ id: entry.id }).update({ amount: "1" })
    ).rejects.toThrow();
    await expect(
      db("ledger_entries").where({ id: entry.id }).del()
    ).rejects.toThrow();

    const after = await db("ledger_entries").where({ id: entry.id }).first();
    expect(String(after.amount)).toBe("100");
  });

  it("refuses UPDATE and DELETE on system_logs", async () => {
    const [log] = await db("system_logs")
      .insert({ level: "INFO", source: "TEST", event_description: "original" })
      .returning("*");

    await expect(
      db("system_logs").where({ id: log.id }).update({ event_description: "rewritten" })
    ).rejects.toThrow();
    await expect(db("system_logs").where({ id: log.id }).del()).rejects.toThrow();
  });
});
