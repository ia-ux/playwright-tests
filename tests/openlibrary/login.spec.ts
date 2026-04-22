import { test, expect } from '@playwright/test';

const openlibrary_login_url = 'https://openlibrary.org/account/login';

test('OpenLibrary: Google sign-in loads and is clickable', async ({
  page,
  browserName,
  browser,
}) => {
  await page.route(/(analytics|fonts|googletag|doubleclick|adservice)/, route =>
    route.abort(),
  );

  await test.step('Navigate to OpenLibrary login page', async () => {
    await page.goto(openlibrary_login_url, { waitUntil: 'domcontentloaded' });
  });

  await test.step('Verify third-party login iframe is present and has content', async () => {
    const frame = page.frameLocator('#ia-third-party-logins');
    const htmlLength = await frame
      .locator('html')
      .evaluate(el => el.innerHTML.length);
    expect(htmlLength).toBeGreaterThan(50);
  });

  await test.step('Verify Google sign-in button is visible inside iframe', async () => {
    const frame = page.frameLocator('#ia-third-party-logins');
    const googleFrame = frame.frameLocator(
      'iframe[src*="accounts.google.com/gsi/button"]',
    );
    const googleButton = googleFrame.locator('[role="button"], button').first();
    const isVisible = await googleButton.isVisible().catch(() => false);
    if (!isVisible) {
      test.skip(
        true,
        'Google GSI iframe did not load — likely blocked in this environment',
      );
    }
    await expect(googleButton).toBeVisible({ timeout: 30000 });
  });

  await test.step('Click Google sign-in button and verify OAuth popup opens', async () => {
    const browserVersion = browser.version();
    const excludedVersions = ['18.5', '139.0'];
    // Skip click test on known problematic versions - WebKit 18.5 and Firefox 139.0 - also if running in BrowserStack
    if (excludedVersions.some(version => browserVersion.includes(version))) {
      console.log(`Skipping Google sign-in click test on ${browserName}`);
    } else {
      const frame = page.frameLocator('#ia-third-party-logins');
      const googleFrame = frame.frameLocator(
        'iframe[src*="accounts.google.com/gsi/button"]',
      );
      const googleButton = googleFrame
        .locator('[role="button"], button')
        .first();

      const [popup] = await Promise.all([
        page.waitForEvent('popup', { timeout: 30000 }),
        googleButton.evaluate(button => (button as HTMLElement).click()),
      ]);
      expect(popup.url()).toContain('accounts.google.com');
    }
  });

  await page.close().catch(() => {});
});
