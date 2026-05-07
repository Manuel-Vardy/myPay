import knex, { type Knex } from "knex";
import config from "./knexfile";

const environment = process.env.NODE_ENV || "development";

const db: Knex = knex(config[environment] || config.development);

export default db;
