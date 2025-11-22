import { test, expect } from '@playwright/test';

const openlibrary_login_url = 'https://openlibrary.org/account/login';

test('OpenLibrary: Google sign-in loads and is clickable', async ({ page, browserName }) => {

  await page.goto(openlibrary_login_url);
  await page.waitForLoadState('networkidle');

  const iframe = page.locator('#ia-third-party-logins');
  expect(await iframe.count()).toBeGreaterThan(0);

  const iframeVisible = await iframe.isVisible();
  console.log('Iframe visible:', iframeVisible);

  const iframeHandle = await iframe.elementHandle();
  console.log('iframeHandle:', iframeHandle !== null);
  expect(iframeHandle).not.toBeNull();

  const frame = await iframeHandle!.contentFrame();
  console.log('frame attached:', frame !== null);
  expect(frame).not.toBeNull();

  const htmlLength = await frame!.evaluate(() => document.documentElement.innerHTML.length);
  console.log('iframe HTML length:', htmlLength);
  expect(htmlLength).toBeGreaterThan(50);

  const googleIframe = frame!.locator('iframe[src*="accounts.google.com/gsi/button"]');
  await expect(googleIframe).toHaveCount(1);

  const googleFrameHandle = await googleIframe.elementHandle();
  const googleFrame = await googleFrameHandle!.contentFrame();
  expect(googleFrame).not.toBeNull();

  const googleButton = googleFrame!.locator('[role="button"], button').first();
  console.log('Google button visible:', await googleButton.isVisible());
  await expect(googleButton).toBeVisible();

  if (browserName === 'chromium') {
    // Click button and wait for popup
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      googleButton.evaluate(button => button.click())
    ]);
    expect(popup.url()).toContain('accounts.google.com');
  }
});
