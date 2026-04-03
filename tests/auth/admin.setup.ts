import fs from 'fs';
import { test as setup } from '@playwright/test';

import { LoginPage } from '../page-objects/login-page';

setup('authenticate as admin', async ({ page }) => {
  fs.mkdirSync('.auth', { recursive: true });

  const loginPage = new LoginPage(page);
  await loginPage.loginAs('privs');
  await page.context().storageState({ path: '.auth/admin.json' });
});
