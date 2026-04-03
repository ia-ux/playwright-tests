import { defineConfig, devices } from '@playwright/test';

import { config } from './config';

const formattedDateTime = () => {
  const d = new Date();
  const month = `${String(d.getMonth() + 1).padStart(2, '0')}`;
  const day = `${String(d.getDate() + 1).padStart(2, '0')}`;
  const hour = `${String(d.getHours()).padStart(2, '0')}`;
  const min = `${String(d.getMinutes()).padStart(2, '0')}`;

  const date = `${d.getFullYear()}-${month}-${day}`;
  const time = `${hour}.${min}.${d.getSeconds()}`;

  return `${date}T${time}`;
};

const reportName = () => `${process.env.CATEGORY}/${formattedDateTime()}`;

/**
 * See https://playwright.dev/docs/test-configuration.
 * 
 * Timeouts are set by `ms`.
 * Can be modified if needed
 */
export default defineConfig({
  workers: 10,  // see scripts/executeTests.js instead
  // Give failing tests 3 retry attempts
  retries: 3,
  // Timeout for each test
  timeout: 10 * 60 * 1000,         // set to 10mins
  // Maximum time the whole test suite can run
  globalTimeout: 30 * 60 * 1000,  // set to 30mins
  testDir: './tests',
  reporter: [
    [
      'html',
      {
        outputFolder: `playwright-report/${reportName()}`,
        open: 'never',
      },
    ],
  ],
  expect: {
    timeout: 10 * 60 * 1000,  // set to 10mins
  },
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // This is set in config/index.ts
    baseURL: config.baseURL,
    actionTimeout: 10 * 60 * 1000,  // set to 10mins
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    { name: 'patron-setup', testMatch: '**/auth/patron.setup.ts' },
    { name: 'admin-setup', testMatch: '**/auth/admin.setup.ts' },
    {
      name: 'Desktop - Chromium',
      testIgnore: ['**/auth/*.setup.ts', '**/login/**'],
      use: {
        ...devices['Desktop Chrome'],
        ignoreHTTPSErrors: true,  // This is needed to avoid getting warnings like: The website is not safe
      },
    },
    {
      name: 'Desktop - Chromium (Auth)',
      dependencies: ['patron-setup', 'admin-setup'],
      testMatch: '**/login/**',
      use: {
        ...devices['Desktop Chrome'],
        ignoreHTTPSErrors: true,
      },
    },
    // Uncomment the following projects to test on more browsers. 
    // Note that you will need to have the browsers installed on your machine to run these tests, and they will run slower than Chromium in headless mode, 
    // so we recommend only running these tests in headed mode and not in CI for now.

    // {
    //   name: 'Desktop - Firefox',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //     ignoreHTTPSErrors: true,
    //   },
    // },
    // {
    //   name: 'Desktop - Webkit',
    //   use: {
    //     ...devices['Desktop Safari'],
    //     ignoreHTTPSErrors: true,
    //   },
    // },
    // {
    //   name: 'Desktop - Microsoft Edge',
    //   use: { 
    //     ...devices['Desktop Edge'],
    //     ignoreHTTPSErrors: true,
    //     channel: 'msedge' // or 'msedge-dev'
    //   }, 
    // },
  ],
});
