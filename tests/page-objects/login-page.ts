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

    this.accountSettingsHeading = this.page.getByRole('heading', { name: 'Account settings', level: 2 });
    this.accountSettingsFormText = this.page.locator('main p').first();
    this.verifyPasswordButton = this.page.locator('ia-button.submit-btn');
    this.loginHeading = this.page.getByRole('heading', { name: 'Log In', level: 1 });
  }

  async loginAs(user: UserType) {
    const asUser = user === 'privs' ? config.privUser : config.patronUser;

    await this.page.goto(login.url, { waitUntil: 'domcontentloaded' });
    await this.page.getByRole('textbox', { name: 'Email address' }).fill(asUser.email);
    await this.page.getByRole('textbox', { name: 'Password' }).fill(asUser.password);
    await this.page.getByRole('button', { name: 'Log in', exact: true }).click();

    // should go back to baseUrl
    await this.page.waitForURL('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  }

  async fillCredentials(user: UserType) {
    const asUser = user === 'privs' ? config.privUser : config.patronUser;
    await this.page.getByRole('textbox', { name: 'Email address' }).fill(asUser.email);
    await this.page.getByRole('textbox', { name: 'Password' }).fill(asUser.password);
    await this.page.getByRole('button', { name: 'Log in', exact: true }).click();
    // wait until redirected away from the login page (referer returns to original page)
    await this.page.waitForURL(/^(?!.*\/login)/, { waitUntil: 'domcontentloaded', timeout: 60000 });
  }

  async gotoAccountSettings() {
    await this.page.goto(accountSettings.url, { waitUntil: 'domcontentloaded' });
  }
}
