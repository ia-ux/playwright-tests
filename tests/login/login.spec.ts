import { test, expect } from '../fixtures';

test('Account settings - Login as a patron', async ({ patronLoginPage }) => {
  await test.step('Navigate to account settings page', async () => {
    await patronLoginPage.gotoAccountSettings();
  });

  await test.step('Verify authentication template is visible', async () => {
    await expect(patronLoginPage.authTemplate).toBeVisible();
  });

  await test.step('Verify account settings heading, form text, and verify button', async () => {
    expect(await patronLoginPage.accountSettingsHeading.innerText()).toBe('Account settings');
    expect(await patronLoginPage.accountSettingsFormText.innerText()).toBe(
      'To access your account settings, as an extra security measure, please enter your password.',
    );
    expect(await patronLoginPage.verifyPasswordButton.innerText()).toBe('Verify password');
  });
});

test('Account settings - Login as a admin', async ({ privsLoginPage }) => {
  await test.step('Navigate to account settings page', async () => {
    await privsLoginPage.gotoAccountSettings();
  });

  await test.step('Verify authentication template is visible', async () => {
    await expect(privsLoginPage.authTemplate).toBeVisible();
  });

  await test.step('Verify account settings heading, form text, and verify button', async () => {
    expect(await privsLoginPage.accountSettingsHeading.innerText()).toBe('Account settings');
    expect(await privsLoginPage.accountSettingsFormText.innerText()).toBe(
      'To access your account settings, as an extra security measure, please enter your password.',
    );
    expect(await privsLoginPage.verifyPasswordButton.innerText()).toBe('Verify password');
  });
});

test('Account settings - Not logged in', async ({ loginPage }) => {
  await test.step('Navigate to account settings page as guest', async () => {
    await loginPage.gotoAccountSettings();
  });

  await test.step('Verify authentication template is not shown and login prompt appears', async () => {
    await expect(loginPage.authTemplate).not.toBeVisible();
    expect(await loginPage.notLoggedInMessage.innerText()).toContain(
      'You must be logged in to change your settings',
    );
  });
});
