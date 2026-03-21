import { type Page, type Locator } from '@playwright/test';

import { config, identifier } from '../../config';
import { UserType } from '../models';

const { accountSettings, login } = identifier;

export class LoginPage {
  readonly page: Page;

  readonly authTemplate: Locator;
  readonly accountSettingsHeading: Locator;
  readonly accountSettingsFormText: Locator;
  readonly verifyPasswordButton: Locator;
  readonly notLoggedInMessage: Locator;

  public constructor(page: Page) {
    this.page = page;

    this.authTemplate = this.page.locator('authentication-template');
    this.accountSettingsHeading = this.authTemplate
      .locator('div.form-element')
      .first()
      .locator('h2');
    this.accountSettingsFormText = this.authTemplate.locator('form > p');
    this.verifyPasswordButton = this.authTemplate
      .locator('div.form-element')
      .last()
      .locator('button');
    this.notLoggedInMessage = this.page.locator('#maincontent > div > div');
  }

  async loginAs(user: UserType) {
    const asUser = user === 'privs' ? config.privUser : config.patronUser;

    await this.page.goto(login.url, { waitUntil: 'domcontentloaded' });
    await this.page.fill(
      'input.form-element.input-email[type=email]',
      asUser.email,
    );
    await this.page.fill(
      'input.form-element.input-password[type=password]',
      asUser.password,
    );
    await this.page.locator('input.btn.btn-primary.btn-submit').click();

    // should go back to baseUrl
    await this.page.waitForURL('/');
  }

  async gotoAccountSettings() {
    await this.page.goto(accountSettings.url, { waitUntil: 'domcontentloaded' });
    await this.page.waitForURL(/settings=1/);
  }
}
