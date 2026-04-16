import fs from 'fs';
import { chromium } from '@playwright/test';
import { config } from './config';
import { LoginPage } from './tests/page-objects/login-page';

async function globalSetup() {
  fs.mkdirSync('.auth', { recursive: true });

  const browser = await chromium.launch();

  try {
    // Login as patron
    console.log('Setting up patron authentication...');
    try {
      const context = await browser.newContext({ baseURL: config.baseURL });
      const page = await context.newPage();
      const loginPage = new LoginPage(page);
      
      await loginPage.loginAs('patron');
      await context.storageState({ path: '.auth/patron.json' });
      await context.close();
      console.log('✓ Patron authentication successful');
    } catch (error) {
      console.error('✗ Patron authentication failed:', error instanceof Error ? error.message : error);
      // Create empty state as fallback
      fs.writeFileSync('.auth/patron.json', JSON.stringify({ cookies: [], origins: [] }));
    }

    // Login as admin
    console.log('Setting up admin authentication...');
    try {
      const adminContext = await browser.newContext({ baseURL: config.baseURL });
      const adminPage = await adminContext.newPage();
      const adminLoginPage = new LoginPage(adminPage);
      
      await adminLoginPage.loginAs('privs');
      await adminContext.storageState({ path: '.auth/admin.json' });
      await adminContext.close();
      console.log('✓ Admin authentication successful');
    } catch (error) {
      console.error('✗ Admin authentication failed:', error instanceof Error ? error.message : error);
      // Create empty state as fallback
      fs.writeFileSync('.auth/admin.json', JSON.stringify({ cookies: [], origins: [] }));
    }
  } finally {
    await browser.close();
  }
}

export default globalSetup;
