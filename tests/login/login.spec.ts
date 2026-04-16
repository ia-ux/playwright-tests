import { test, expect } from '../fixtures';

test.describe('Account settings - Login as a patron', () => {
  test.use({ storageState: '.auth/patron.json' });

  test('Verify account settings page', async ({ loginPage }) => {
    await test.step('Navigate to account settings page', async () => {
      await loginPage.gotoAccountSettings();
    });

    await test.step('Verify account settings heading, form text, and verify button', async () => {
      await expect(loginPage.accountSettingsHeading).toBeVisible();
      await expect(loginPage.accountSettingsFormText).toHaveText(
        'To access your account settings, as an extra security measure, you will need to verify your identity.',
      );
      await expect(loginPage.verifyPasswordButton).toBeVisible();
    });
  });
});

test.describe('Account settings - Login as a admin', () => {
  test.use({ storageState: '.auth/admin.json' });

  test('Verify account settings page', async ({ loginPage }) => {
    await test.step('Navigate to account settings page', async () => {
      await loginPage.gotoAccountSettings();
    });

    await test.step('Verify account settings heading, form text, and verify button', async () => {
      await expect(loginPage.accountSettingsHeading).toBeVisible();
      await expect(loginPage.accountSettingsFormText).toHaveText(
        'To access your account settings, as an extra security measure, you will need to verify your identity.',
      );
      await expect(loginPage.verifyPasswordButton).toBeVisible();
    });
  });
});

test('Account settings - Not logged in', async ({ loginPage }) => {
  await test.step('Navigate to account settings page as guest', async () => {
    await loginPage.gotoAccountSettings();
  });

  await test.step('Verify redirect to login page', async () => {
    await expect(loginPage.accountSettingsHeading).not.toBeVisible();
    await expect(loginPage.loginHeading).toBeVisible();
  });
});
