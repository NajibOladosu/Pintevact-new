import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { appEnv } from "./tests/support/local-services.ts";

const serverOnly = fileURLToPath(new URL("./tests/support/server-only.ts", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true, alias: { "server-only": serverOnly } },
  test: {
    css: false,
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "jsdom",
          setupFiles: ["./tests/setup.ts"],
          include: ["tests/unit/**/*.test.{ts,tsx}"],
        },
      },
      {
        extends: true,
        test: {
          // Runs against the real local stack: `supabase start` + stripe/stripe-mock (see README).
          name: "integration",
          environment: "node",
          include: ["tests/integration/**/*.test.ts"],
          env: appEnv(),
          fileParallelism: false,
          testTimeout: 30_000,
          hookTimeout: 60_000,
        },
      },
    ],
  },
});
