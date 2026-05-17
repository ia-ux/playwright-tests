import { test, expect } from '../fixtures';

test.describe('Donate page', () => {
  test('Donate page displays main elements', async ({
    donatePage: { page },
  }) => {
    await test.step('Verify appeal letter and donation form are present', async () => {
      // element lives in shadow DOM and may be empty; check it is attached
      await expect(page.locator('donate-page-appeal-letter')).toBeAttached();
      await expect(page.locator('donation-form')).toBeVisible();
    });

    await test.step('Verify frequency options are visible', async () => {
      // radio inputs are opacity:0; target the visible <label> instead
      await expect(
        page.locator('label', { hasText: 'One time' }),
      ).toBeVisible();
      await expect(page.locator('label', { hasText: 'Monthly' })).toBeVisible();
    });

    await test.step('Verify at least one amount option is visible', async () => {
      await expect(page.locator('label[for^="amount-"]').first()).toBeVisible();
    });

    await test.step('Verify cover fees checkbox is visible', async () => {
      await expect(
        page.getByRole('checkbox', { name: /cover fees/i }),
      ).toBeVisible();
    });

    await test.step('Verify total amount text is visible', async () => {
      await expect(page.getByText(/Total:/)).toBeVisible();
    });
  });

  test('Payment method buttons are displayed', async ({
    donatePage: { page },
  }) => {
    await test.step('Verify Google Pay button is visible', async () => {
      await expect(
        page.getByRole('button', { name: /google.*pay/i }),
      ).toBeVisible();
    });

    await test.step('Verify PayPal button is visible', async () => {
      await expect(
        page
          .frameLocator('iframe.zoid-component-frame')
          .getByRole('button', { name: 'PayPal' }),
      ).toBeVisible();
    });

    await test.step('Verify credit card button is visible', async () => {
      await expect(
        page.getByRole('button', { name: 'Credit Card' }),
      ).toBeVisible();
    });

    await test.step('Verify crypto donation link is visible', async () => {
      await expect(
        page.getByRole('link', { name: /donate cryptocurrency/i }),
      ).toBeVisible();
    });
  });

  // Google Pay uses the browser's native Payment Request API (not a popup).
  // PayPal popups are blocked in BrowserStack. Button presence is verified above.
  test.skip('Google Pay opens payment popup', async ({
    donatePage: { page },
  }) => {
    await test.step('Click Google Pay and wait for popup', async () => {
      const popupPromise = page.context().waitForEvent('page');
      await page.getByRole('button', { name: /google.*pay/i }).click();
      const popup = await popupPromise;
      await popup.waitForLoadState('domcontentloaded');
      await popup.close();
    });
  });

  test.skip('PayPal opens payment popup', async ({ donatePage: { page } }) => {
    await test.step('Click PayPal and wait for popup', async () => {
      const popupPromise = page.context().waitForEvent('page');
      await page
        .frameLocator('iframe.zoid-component-frame')
        .getByRole('button', { name: 'PayPal' })
        .click();
      const popup = await popupPromise;
      await popup.waitForLoadState('domcontentloaded');
      await popup.close();
    });
  });

  test('Credit card payment shows contact form section', async ({
    donatePage: { page },
  }) => {
    await test.step('Click credit card button', async () => {
      await page.getByRole('button', { name: 'Credit Card' }).click();
    });

    await test.step('Verify contact form section and donate button are visible', async () => {
      await expect(page.locator('#contactFormSection')).toBeVisible();
      await expect(page.locator('#donate-button')).toBeVisible();
    });
  });

  test('Change payment method hides contact form section from previous selection', async ({
    donatePage: { page },
  }) => {
    await test.step('Select credit card to show contact form', async () => {
      await page.getByRole('button', { name: 'Credit Card' }).click();
      await expect(page.locator('#contactFormSection')).toBeVisible();
    });

    await test.step('Click change payment method and verify form is hidden', async () => {
      await page.locator('#change-payment-method').click();
      await expect(page.locator('#contactFormSection')).not.toBeVisible();
    });
  });
});
