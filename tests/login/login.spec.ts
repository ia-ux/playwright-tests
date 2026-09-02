import { test, expect } from '../fixtures';

test.describe('Account settings - Login as a patron', () => {
  test('Verify account settings page', async ({ patronLoginPage }) => {
    await test.step('Navigate to account settings page', async () => {
      await patronLoginPage.gotoAccountSettings('patron');
    });

    await test.step('Verify account settings heading, form text, and verify button', async () => {
      await expect(patronLoginPage.accountSettingsHeading).toBeVisible();
      await expect(patronLoginPage.accountSettingsFormText).toHaveText(
        'To access your account settings, as an extra security measure, you will need to verify your identity.',
      );
      await expect(patronLoginPage.verifyPasswordButton).toBeVisible();
    });
  });
});

test.describe('Account settings - Login as a admin', () => {
  test('Verify account settings page', async ({ adminLoginPage }) => {
    await test.step('Navigate to account settings page', async () => {
      await adminLoginPage.gotoAccountSettings('privs');
    });

    await test.step('Verify account settings heading, form text, and verify button', async () => {
      await expect(adminLoginPage.accountSettingsHeading).toBeVisible();
      await expect(adminLoginPage.accountSettingsFormText).toHaveText(
        'To access your account settings, as an extra security measure, you will need to verify your identity.',
      );
      await expect(adminLoginPage.verifyPasswordButton).toBeVisible();
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
