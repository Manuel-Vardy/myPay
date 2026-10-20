import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

const serverOnlyStub = path.resolve(import.meta.dirname, "tests/stubs/server-only.ts");

const shared = {
  plugins: [react()],
  resolve: {
    // Resolves the "@/*" -> "./src/*" paths from tsconfig.json natively.
    tsconfigPaths: true,
    alias: {
      // `server-only` throws by design when imported outside a React Server
      // Component. Most of src/lib is marked with it, so tests stub it out.
      "server-only": serverOnlyStub,
    },
  },
};

export default defineConfig({
  ...shared,
  test: {
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage",
      include: ["src/lib/**/*.ts"],
      exclude: ["src/lib/db/migrations/**", "src/lib/db/seeds/**"],
    },
    projects: [
      {
        ...shared,
        test: {
          name: "unit",
          // Backend-heavy app; component tests opt into jsdom per file with a
          // `// @vitest-environment jsdom` docblock.
          environment: "node",
          globals: false,
          setupFiles: ["tests/setup.ts"],
          include: [
            "tests/lib/**/*.test.{ts,tsx}",
            "tests/app/**/*.test.{ts,tsx}",
          ],
        },
      },
      {
        ...shared,
        test: {
          name: "integration",
          environment: "node",
          globals: false,
          setupFiles: ["tests/integration/setup.ts"],
          globalSetup: ["tests/integration/global-setup.ts"],
          include: ["tests/integration/**/*.test.ts"],
          // Tests share one database and reset it between cases, so they must
          // not run concurrently.
          fileParallelism: false,
          testTimeout: 20_000,
          hookTimeout: 60_000,
        },
      },
    ],
  },
});
