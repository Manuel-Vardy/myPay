import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("platform_settings", (table) => {
    table.string("key", 100).primary(); // e.g. 'integration:triton:webhook', 'integration:moolre:webhook'
    table.jsonb("value").notNullable(); // e.g. { id: '...', secret: '...', url: '...', eventTypes: [...] }
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.uuid("updated_by").references("id").inTable("users").onDelete("SET NULL");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("platform_settings");
}
