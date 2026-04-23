import { type Page, type Locator } from '@playwright/test';

import { config, identifier } from '../../config';
import { UserType } from '../models';

const { accountSettings, login } = identifier;

export class LoginPage {
  readonly page: Page;

  readonly accountSettingsHeading: Locator;
  readonly accountSettingsFormText: Locator;
  readonly verifyPasswordButton: Locator;
  readonly loginHeading: Locator;

  public constructor(page: Page) {
    this.page = page;

    this.accountSettingsHeading = page.getByRole('heading', {
      name: 'Account settings',
      level: 2,
    });
    this.accountSettingsFormText = page
      .locator('p')
      .filter({ hasText: 'extra security measure' });
    this.verifyPasswordButton = page.getByRole('button', {
      name: 'Verify password',
    });
    this.loginHeading = page.getByRole('heading', { name: 'Log In', level: 1 });
  }

  private resolveUser(user: UserType) {
    return user === 'privs' ? config.privUser : config.patronUser;
  }

  async loginAs(user: UserType) {
    const asUser = this.resolveUser(user);

    await this.page.goto(login.url, { waitUntil: 'domcontentloaded' });

    // Wait for login form to be fully loaded
    await this.page.waitForSelector('main form', { timeout: 10000 });

    await this.page
      .getByRole('textbox', { name: 'Email address' })
      .fill(asUser.email);
    await this.page
      .getByRole('textbox', { name: 'Password' })
      .fill(asUser.password);

    // Small delay to ensure form is ready before submission
    await this.page.waitForTimeout(500);

    await this.page
      .getByRole('button', { name: 'Log in', exact: true })
      .click();

    // Wait for network to settle to ensure login response is received
    await this.page
      .waitForLoadState('networkidle', { timeout: 15000 })
      .catch(() => {});

    // Detect login error by looking for the error message paragraph
    const errorParagraph = this.page.locator('main paragraph, main p').filter({
      hasText: /unable to log you in|incorrect|invalid|error|sorry/i,
    });

    const redirected = this.page.waitForURL('/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    const result = await Promise.race([
      redirected.then(() => 'success'),
      errorParagraph
        .first()
        .waitFor({ state: 'visible', timeout: 15000 })
        .then(async () => {
          // Get the text content from the error element
          const errorElement = errorParagraph.first();
          const msg = await errorElement
            .textContent()
            .catch(() => 'login failed');
          return `error: ${msg?.trim() || 'unknown error'}`;
        })
        .catch(() => 'redirect_timeout'),
    ]);

    if (result !== 'success') {
      throw new Error(
        `Auth setup failed for ${user} (${asUser.email}): ${result}`,
      );
    }
  }

  async fillCredentials(user: UserType) {
    const asUser = this.resolveUser(user);
    await this.page
      .getByRole('textbox', { name: 'Email address' })
      .fill(asUser.email);
    await this.page
      .getByRole('textbox', { name: 'Password' })
      .fill(asUser.password);
    await this.page
      .getByRole('button', { name: 'Log in', exact: true })
      .click();
    // wait until redirected away from the login page (referer returns to original page)
    await this.page.waitForURL(/^(?!.*\/login)/, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
  }

  async gotoAccountSettings(user?: UserType) {
    await this.page.goto(accountSettings.url, {
      waitUntil: 'domcontentloaded',
    });
    await this.page
      .locator('main')
      .waitFor({ state: 'attached', timeout: 30000 });

    // If session expired, the page redirects to login — re-authenticate
    if (this.page.url().includes('/login') && user && user !== 'no-login') {
      const banner = this.page.locator('#banner-body-container');
      if (await banner.isVisible().catch(() => false)) {
        await this.page.locator('main form').scrollIntoViewIfNeeded();
      }
      await this.fillCredentials(user);
      // Archive.org may redirect to / after login rather than back to settings
      if (!this.page.url().includes('/account/settings')) {
        await this.page.goto(accountSettings.url, {
          waitUntil: 'domcontentloaded',
        });
        await this.page
          .locator('main')
          .waitFor({ state: 'attached', timeout: 30000 });
      }
    }
  }
}
