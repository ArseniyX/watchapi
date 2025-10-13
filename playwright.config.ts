import { defineConfig, devices } from "@playwright/test";

const E2E_HOST = process.env.E2E_HOST ?? "127.0.0.1";
const E2E_PORT = process.env.E2E_PORT ?? "3100";
const BASE_URL = `http://${E2E_HOST}:${E2E_PORT}`;

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const defaultWorkers = parseInt(process.env.PLAYWRIGHT_WORKERS ?? "1", 10) || 1;

export default defineConfig({
  testDir: "./tests/e2e",
  /* Global setup - run before all tests */
  globalSetup: require.resolve("./tests/e2e/global-setup.ts"),
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Run tests in parallel on CI with multiple workers */
  workers: process.env.CI ? 4 : defaultWorkers,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: BASE_URL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    /* Screenshot on failure */
    screenshot: "only-on-failure",
    /* Increase timeout for slow operations */
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },
  /* Global timeout for each test */
  timeout: 60000,

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        headless: true,
      },
    },

    // Uncomment to test on other browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "node ./scripts/start-next-dev.js",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
    env: {
      DATABASE_URL: process.env.DATABASE_URL_E2E || process.env.DATABASE_URL,
      NODE_ENV: "test",
      HOSTNAME: E2E_HOST,
      HOST: E2E_HOST,
      PORT: E2E_PORT,
    },
  },
});
