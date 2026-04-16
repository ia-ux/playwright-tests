import { test, expect } from '@playwright/test';

import { identifier, testBeforeEachConfig } from '../../config';

test.beforeEach(async ({ context }) => {
  await testBeforeEachConfig(context);
});

test.describe('About pages', () => {
  test('Canonical About page has correct title and text', async ({ page }) => {
    await test.step('Navigate to About page', async () => {
      await page.goto(identifier.about.url, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Validate page title and heading', async () => {
      await expect(page).toHaveTitle(/About IA/);
      await expect(
        page.locator('h1:has-text("About the Internet Archive")'),
      ).toBeVisible();
    });

    await test.step('Validate main content links and text', async () => {
      await expect(
        page.locator('#maincontent').locator('a:has-text("Job Opportunities")'),
      ).toBeVisible();
      await expect(
        page.locator('#maincontent').locator('a:has-text("Terms of Service")'),
      ).toBeVisible();
      await expect(page.locator('#maincontent')).toContainText(
        '501(c)(3) non-profit',
      );
      await expect(page.locator('news-stories')).toBeVisible();
    });
  });

  test('About > Bios page has correct title and text', async ({ page }) => {
    await test.step('Navigate to Bios page', async () => {
      await page.goto(identifier.about.bios, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Validate page title and content', async () => {
      await expect(page).toHaveTitle(/Bios/);
      await expect(page.locator('h1:has-text("Bios")')).toBeVisible();
      await expect(page.locator('#maincontent')).toContainText(
        'A passionate advocate for public Internet access',
      );
    });
  });

  test('About > Contact page has correct title and text', async ({ page }) => {
    await test.step('Navigate to Contact page', async () => {
      await page.goto(identifier.about.contact, {
        waitUntil: 'domcontentloaded',
      });
    });

    await test.step('Validate page title and content', async () => {
      await expect(page).toHaveTitle(/Contact/);
      await expect(
        page.locator('h1:has-text("Contacts at the Internet Archive")'),
      ).toBeVisible();
      await expect(page.locator('#maincontent')).toContainText(
        '300 Funston Avenue',
      );
      await expect(
        page
          .locator('#maincontent')
          .locator('a:has-text("Frequently Asked Questions")'),
      ).toBeVisible();
    });
  });

  test('About > Credits page has correct title and text', async ({ page }) => {
    await test.step('Navigate to Credits page', async () => {
      await page.goto(identifier.about.credits, {
        waitUntil: 'domcontentloaded',
      });
    });

    await test.step('Validate page title and content', async () => {
      await expect(page).toHaveTitle(/Credits/);
      await expect(
        page.locator(
          'h1:has-text("Credits: Thank You from the Internet Archive")',
        ),
      ).toBeVisible();
      await expect(page.locator('#maincontent')).toContainText(
        'The Kahle/Austin Foundation',
      );
    });
  });

  test('About > Jobs page has correct title and text', async ({ page }) => {
    await test.step('Navigate to Jobs page', async () => {
      await page.goto(identifier.about.jobs, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Validate page title and content', async () => {
      await expect(page).toHaveTitle(/Jobs/);
      await expect(
        page.locator('h1:has-text("Job Opportunities")'),
      ).toBeVisible();
      await expect(page.locator('#maincontent')).toContainText(
        'Based in San Francisco',
      );
    });
  });

  test('About > News Stories page has correct title and text', async ({
    page,
  }) => {
    await test.step('Navigate to News Stories page', async () => {
      await page.goto(identifier.about.news, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Validate page title and content', async () => {
      await expect(page).toHaveTitle(/News Stories/);
      await expect(page.locator('h1:has-text("News stories")')).toBeVisible();
      await expect(page.locator('body')).toContainText(
        'Including The Wayback Machine',
      );
    });
  });

  test('About > Terms of Service page has correct title and text', async ({
    page,
  }) => {
    await test.step('Navigate to Terms of Service page', async () => {
      await page.goto(identifier.about.terms, {
        waitUntil: 'domcontentloaded',
      });
    });

    await test.step('Validate page title and content', async () => {
      await expect(page).toHaveTitle(/Terms of Use/);
      await expect(page.locator('h1:has-text("Terms of Use")')).toBeVisible();
      await expect(page.locator('#maincontent')).toContainText(
        'This terms of use agreement',
      );
    });
  });

  test('About > Volunteer Positions page has correct title and text', async ({
    page,
  }) => {
    await test.step('Navigate to Volunteer Positions page', async () => {
      await page.goto(identifier.about.volunteer, {
        waitUntil: 'domcontentloaded',
      });
    });

    await test.step('Validate page title and content', async () => {
      await expect(page).toHaveTitle(/Volunteer Positions/);
      await expect(
        page.locator('h1:has-text("Volunteer Positions")'),
      ).toBeVisible();
      await expect(page.locator('#maincontent')).toContainText(
        'We could always use a hand',
      );
    });
  });
});
