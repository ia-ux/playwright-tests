import { test, expect } from '@playwright/test';

import { identifier, testBeforeEachConfig } from '../../config';

test.beforeEach(async ({ context }) => {
  await testBeforeEachConfig(context);
});

test('Main Legal page has correct title and text', async ({ page }) => {
  await test.step('Navigate to Legal page', async () => {
    await page.goto(identifier.legal.url, { waitUntil: 'domcontentloaded' });
  });

  await test.step('Verify page title and content', async () => {
    await expect(page).toHaveTitle(/Internet Archive: Legal: Requests/);
    await expect(
      page.locator('h1:has-text("Information Requests")'),
    ).toBeVisible();
    await expect(page.locator('#maincontent')).toContainText(
      'The following sets forth',
    );
  });
});

test('Legal > Affidavit page has correct title and text', async ({ page }) => {
  await test.step('Navigate to Affidavit page', async () => {
    await page.goto(identifier.legal.affidavit, {
      waitUntil: 'domcontentloaded',
    });
  });

  await test.step('Verify page title and content', async () => {
    await expect(page).toHaveTitle(/Internet Archive: Legal: Affidavit/);
    await expect(
      page.locator('h1:has-text("Standard Affidavit")'),
    ).toBeVisible();
    await expect(page.locator('#maincontent')).toContainText(
      'I am a Records Request Processor at the Internet Archive',
    );
  });
});

test('Legal > FAQ page has correct title and text', async ({ page }) => {
  await test.step('Navigate to Legal FAQ page', async () => {
    await page.goto(identifier.legal.faq, { waitUntil: 'domcontentloaded' });
  });

  await test.step('Verify page title and content', async () => {
    await expect(page).toHaveTitle(/Internet Archive: Legal FAQ/);
    await expect(
      page.locator('h1:has-text("FREQUENTLY ASKED QUESTIONS")'),
    ).toBeVisible();
    await expect(page.locator('#maincontent')).toContainText(
      'Do I really need an affidavit',
    );
  });
});
