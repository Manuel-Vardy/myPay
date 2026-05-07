import type { Knex } from "knex";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";
import { config as loadEnv } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadEnv({ path: path.resolve(__dirname, "../../../.env") });

const config: Record<string, Knex.Config> = {
  development: {
    client: "pg",
    connection: process.env.DATABASE_URL,
    pool: { min: 2, max: 10 },
    migrations: {
      directory: "./migrations",
      extension: "ts",
    },
    seeds: {
      directory: "./seeds",
      extension: "ts",
    },
  },

  production: {
    client: "pg",
    connection: process.env.DATABASE_URL,
    pool: { min: 2, max: 20 },
    migrations: {
      directory: "./migrations",
      extension: "ts",
    },
  },
};

export default config;
