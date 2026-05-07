import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: true,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium-ar",
      use: {
        ...devices["Desktop Chrome"],
        locale: "ar-SA",
      },
    },
    {
      name: "chromium-en",
      use: {
        ...devices["Desktop Chrome"],
        locale: "en-US",
      },
    },
  ],
  webServer: {
    command: "npm run build && npm run start",
    url: `${baseURL}/ar`,
    timeout: 600000,
    reuseExistingServer: false,
    env: {
      AUTH_SECRET: "bp-holding-dev-secret",
      RFQ_RATE_LIMIT_MAX: "20",
      RFQ_RATE_LIMIT_WINDOW_MS: "3600000",
    },
  },
});
