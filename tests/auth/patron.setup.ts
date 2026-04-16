import fs from 'fs';
import { test as setup } from '@playwright/test';

import { LoginPage } from '../page-objects/login-page';

setup('authenticate as patron', async ({ page }, testInfo) => {
  fs.mkdirSync('.auth', { recursive: true });

  const loginPage = new LoginPage(page);

  // Add delay before retries to avoid rate limiting
  if (testInfo.retry > 0) {
    const delayMs = 3000 * testInfo.retry; // 3s, 6s, 9s for retries 1, 2, 3
    console.log(
      `Retry attempt ${testInfo.retry}, waiting ${delayMs}ms before login...`,
    );
    await page.waitForTimeout(delayMs);
  }

  await loginPage.loginAs('patron');
  await page.context().storageState({ path: '.auth/patron.json' });
});
