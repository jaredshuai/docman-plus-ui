import { defineConfig, devices } from '@playwright/test';

const DOCMAN_E2E_BASE_URL = process.env.DOCMAN_E2E_BASE_URL || 'http://localhost';
const DEFAULT_PLAYWRIGHT_WORKERS = process.env.CI ? 1 : 4;
const PLAYWRIGHT_WORKERS = Number(process.env.PLAYWRIGHT_WORKERS || DEFAULT_PLAYWRIGHT_WORKERS);

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: Number.isFinite(PLAYWRIGHT_WORKERS) && PLAYWRIGHT_WORKERS > 0 ? PLAYWRIGHT_WORKERS : DEFAULT_PLAYWRIGHT_WORKERS,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html', { outputFolder: 'e2e-report' }], ['list']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: DOCMAN_E2E_BASE_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'retain-on-failure',

    /* Default timeout for each action */
    actionTimeout: 10000
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],

  /* Run local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: DOCMAN_E2E_BASE_URL,
  //   reuseExistingServer: !process.env.CI,
  // },

  /* Expect timeout */
  expect: {
    timeout: 10000
  },

  /* Global test timeout */
  timeout: 60000
});
