import type { Knex } from "knex";

/**
 * Migration 0029 — auth rate limiting
 *
 * `rate_limit_counters` (0015) is keyed by merchant_id and can't cover
 * unauthenticated auth endpoints (login, MFA verify) where the only
 * identifiers available are a user_id or an IP address. Adds a parallel
 * fixed-window counter table keyed by an arbitrary string identifier.
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("auth_rate_limit_counters", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.string("identifier", 200).notNullable(); // e.g. `user:<uuid>` or `ip:<addr>`
    table.string("endpoint", 200).notNullable();
    table.timestamp("window_start", { useTz: true }).notNullable();
    table.integer("request_count").notNullable().defaultTo(1);

    table.unique(["identifier", "endpoint", "window_start"]);
  });

  await knex.raw(
    `CREATE INDEX "auth_rate_limit_counters_window_start_index" ON "auth_rate_limit_counters" ("window_start")`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("auth_rate_limit_counters");
}
