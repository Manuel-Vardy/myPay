import type { Knex } from "knex";

// Tracks issued auth sessions so users can see and revoke active devices.
// The session id is embedded in the JWT (sessionId) and checked by guards.
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("user_sessions", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("user_agent", 512).nullable();
    table.string("ip_address", 64).nullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("last_seen_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("revoked_at").nullable();

    table.index(["user_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("user_sessions");
}
