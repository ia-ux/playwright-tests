import fs from 'fs';
import { Browser } from '@playwright/test';
import { chromium } from '@playwright/test';
import { browserChannel, config } from './config';
import { LoginPage } from './tests/page-objects/login-page';
import { UserType } from './tests/models';

const LOGIN_ATTEMPTS = 3;

// archive.org's login redirect occasionally times out under no fault of the
// test — retry a few times before giving up, since a single flaky attempt
// otherwise poisons every downstream test that relies on this session.
async function loginWithRetry(
  browser: Browser,
  user: UserType,
  statePath: string,
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= LOGIN_ATTEMPTS; attempt++) {
    const context = await browser.newContext({ baseURL: config.baseURL });
    try {
      const page = await context.newPage();
      const loginPage = new LoginPage(page);

      await loginPage.loginAs(user);
      await context.storageState({ path: statePath });
      console.log(`✓ ${user} authentication successful (attempt ${attempt})`);
      return;
    } catch (error) {
      lastError = error;
      console.error(
        `✗ ${user} authentication attempt ${attempt}/${LOGIN_ATTEMPTS} failed:`,
        error instanceof Error ? error.message : error,
      );
    } finally {
      await context.close();
    }
  }

  throw new Error(
    `${user} authentication failed after ${LOGIN_ATTEMPTS} attempts: ${
      lastError instanceof Error ? lastError.message : lastError
    }`,
  );
}

async function globalSetup() {
  fs.mkdirSync('.auth', { recursive: true });

  const browser = await chromium.launch({ channel: browserChannel });

  try {
    console.log('Starting global setup for authentication...');
    console.log(`Setting up patron authentication... BASE: ${config.baseURL}`);
    await loginWithRetry(browser, 'patron', '.auth/patron.json');

    console.log(`Setting up admin authentication... BASE: ${config.baseURL}`);
    await loginWithRetry(browser, 'privs', '.auth/admin.json');
  } finally {
    await browser.close();
  }
}

export default globalSetup;
