import type { Knex } from "knex";

const GHANAIAN_BANKS = [
  { name: "GCB Bank", short_code: "GCB" },
  { name: "Absa Bank Ghana", short_code: "ABSA" },
  { name: "Ecobank Ghana", short_code: "ECO" },
  { name: "Stanbic Bank Ghana", short_code: "STANBIC" },
  { name: "Fidelity Bank Ghana", short_code: "FIDELITY" },
  { name: "CalBank", short_code: "CAL" },
  { name: "Access Bank Ghana", short_code: "ACCESS" },
  { name: "Standard Chartered Ghana", short_code: "SCB" },
  { name: "Zenith Bank Ghana", short_code: "ZENITH" },
  { name: "Agricultural Development Bank (ADB)", short_code: "ADB" },
  { name: "Universal Merchant Bank (UMB)", short_code: "UMB" },
  { name: "National Investment Bank (NIB)", short_code: "NIB" },
  { name: "Consolidated Bank Ghana (CBG)", short_code: "CBG" },
  { name: "Guaranty Trust Bank Ghana", short_code: "GTB" },
  { name: "OmniBSIC Bank", short_code: "OMNIBSIC" },
  { name: "Republic Bank Ghana", short_code: "REPUBLIC" },
  { name: "First Atlantic Bank", short_code: "FAB" },
  { name: "Prudential Bank", short_code: "PRUDENTIAL" },
  { name: "Bank of Africa Ghana", short_code: "BOA" },
  { name: "Societe Generale Ghana", short_code: "SG" },
];

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("banks", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.string("name", 200).notNullable();
    table.string("short_code", 30).notNullable().unique();
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamps(true, true);
  });

  // Seed with Ghanaian banks
  await knex("banks").insert(
    GHANAIAN_BANKS.map((b) => ({ name: b.name, short_code: b.short_code }))
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("banks");
}
