import { defineConfig, devices } from "@playwright/test";
import { appEnv, local } from "./tests/support/local-services";

const PORT = new URL(local.siteUrl).port;

/**
 * End-to-end tests drive a production build against the real local stack:
 * Supabase (`npm run stack:up`), Stripe's stripe-mock API server, the Mailpit inbox and
 * an HLS fixture server standing in for the Bunny CDN.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 3,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: local.siteUrl,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: [
    {
      command: "node tests/support/video-server.mjs",
      url: `${local.videoOrigin}/health`,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `npm run build && npx next start -p ${PORT}`,
      url: local.siteUrl,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
      env: appEnv(),
    },
  ],
});
