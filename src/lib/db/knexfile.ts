import type { Knex } from "knex";
import path from "path";
import { config as loadEnv } from "dotenv";

// __dirname exists in both contexts this file runs in: the knex CLI
// (ts-node transpiles to CJS) and Next.js server bundles.
loadEnv({ path: path.resolve(__dirname, "../../../.env") });

const config: Record<string, Knex.Config> = {
  local: {
    client: "pg",
    connection: process.env.DATABASE_URL,
    pool: { min: 0, max: 10 },
    migrations: {
      directory: "./migrations",
      extension: "ts",
    },
    seeds: {
      directory: "./seeds",
      extension: "ts",
    }
  },
  development: {
    client: "pg",
    connection: {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      host: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`,
    },
    pool: { min: 0, max: 5, acquireTimeoutMillis: 30000, idleTimeoutMillis: 600000 },
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
    pool: { min: 0, max: 3, acquireTimeoutMillis: 30000 },
    migrations: {
      directory: "./migrations",
      extension: "ts",
    },
  },
};

export default config;
