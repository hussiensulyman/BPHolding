import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: true,
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
    command: "npm run dev",
    url: `${baseURL}/ar`,
    timeout: 240000,
    reuseExistingServer: !process.env.CI,
  },
});