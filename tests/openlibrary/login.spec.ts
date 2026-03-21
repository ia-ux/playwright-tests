import { test, expect } from '@playwright/test';

const openlibrary_login_url = 'https://openlibrary.org/account/login';

test('OpenLibrary: Google sign-in loads and is clickable', async ({ page, browserName, browser }) => {
  await test.step('Navigate to OpenLibrary login page', async () => {
    await page.goto(openlibrary_login_url, { waitUntil: 'networkidle' });
    await page.waitForLoadState('networkidle');
  });

  await test.step('Verify third-party login iframe is present and has content', async () => {
    const iframe = page.locator('#ia-third-party-logins');
    expect(await iframe.count()).toBeGreaterThan(0);

    const iframeHandle = await iframe.elementHandle();
    expect(iframeHandle).not.toBeNull();

    const frame = await iframeHandle!.contentFrame();
    expect(frame).not.toBeNull();

    const htmlLength = await frame!.evaluate(() => document.documentElement.innerHTML.length);
    expect(htmlLength).toBeGreaterThan(50);
  });

  await test.step('Verify Google sign-in button is visible inside iframe', async () => {
    const iframe = page.locator('#ia-third-party-logins');
    const iframeHandle = await iframe.elementHandle();
    const frame = await iframeHandle!.contentFrame();

    const googleIframe = frame!.locator('iframe[src*="accounts.google.com/gsi/button"]');
    await expect(googleIframe).toHaveCount(1);

    const googleFrameHandle = await googleIframe.elementHandle();
    const googleFrame = await googleFrameHandle!.contentFrame();
    expect(googleFrame).not.toBeNull();

    const googleButton = googleFrame!.locator('[role="button"], button').first();
    await expect(googleButton).toBeVisible();
  });

  await test.step('Click Google sign-in button and verify OAuth popup opens', async () => {
    const browserVersion = browser.version();
    const excludedVersions = ['18.5', '139.0'];
    // Skip click test on known problematic versions - WebKit 18.5 and Firefox 139.0 - also if running in BrowserStack
    if (excludedVersions.some(version => browserVersion.includes(version))) {
      console.log(`Skipping Google sign-in click test on ${browserName}`);
    } else {
      const iframe = page.locator('#ia-third-party-logins');
      const iframeHandle = await iframe.elementHandle();
      const frame = await iframeHandle!.contentFrame();
      const googleIframe = frame!.locator('iframe[src*="accounts.google.com/gsi/button"]');
      const googleFrameHandle = await googleIframe.elementHandle();
      const googleFrame = await googleFrameHandle!.contentFrame();
      const googleButton = googleFrame!.locator('[role="button"], button').first();

      const [popup] = await Promise.all([
        page.waitForEvent('popup'),
        googleButton.evaluate(button => button.click()),
      ]);
      expect(popup.url()).toContain('accounts.google.com');
    }
  });

  await page.close();
});
