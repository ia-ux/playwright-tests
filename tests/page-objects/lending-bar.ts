import { type Page, Locator, expect } from '@playwright/test';

export class LendingBar {
  readonly page: Page;
  readonly iaBookActions: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.iaBookActions = this.page.locator('ia-book-actions');
  }

  async verifyDefaultTexts() {
    await this.iaBookActions.waitFor({ state: 'visible' });
    const textGroup = this.iaBookActions.locator(
      'text-group > .variable-texts',
    );
    await expect(textGroup).toBeVisible();
    const textGroupTexts = await textGroup.textContent();

    expect(textGroupTexts).toContain(
      'Renews automatically with continued use.',
    );
  }

  async verifyInfoIcon() {
    await this.iaBookActions.waitFor({ state: 'visible' });
    const infoIcon = this.iaBookActions.locator('info-icon');
    await expect(infoIcon).toBeVisible();
    const infoIconUrl = await infoIcon.locator('a').getAttribute('href');

    expect(infoIconUrl).toContain(
      'https://help.archive.org/help/borrowing-from-the-lending-library',
    );
  }

  async verifyLendingBarBasicNonLoggedIn() {
    await expect(this.iaBookActions).toBeVisible();

    const actionGroup = this.iaBookActions.locator('collapsible-action-group');
    const primaryAction = actionGroup.locator('button.initial').first();

    await expect(actionGroup).toBeVisible();
    await expect(primaryAction).toBeVisible();
    const primaryActionText = await primaryAction.textContent();
    expect(primaryActionText).toContain('Log In and Borrow');

    // click on this primaryAction button should send you on login page
    await primaryAction.click();

    // wait for navigation to complete
    await this.page.waitForLoadState('load');

    // Assert that the current URL contains a specific substring or matches a pattern
    await expect(this.page).toHaveURL(/\/login/);
  }

  async verifyLendingBarLoggedIn() {
    await this.iaBookActions.waitFor({ state: 'visible' });

    // Both states: borrow button is inside collapsible-action-group;
    // return button is a direct child of ia-book-actions with class "danger initial"
    const actionGroup = this.iaBookActions.locator('collapsible-action-group');
    const borrowButton = actionGroup.getByRole('button', { name: 'Borrow', exact: true });
    const returnNowButton = this.iaBookActions.locator('button.ia-button', { hasText: 'Return now' });

    const isBorrowState = await borrowButton.isVisible();

    if (isBorrowState) {
      // patron hasn't borrowed yet — verify borrow button and click it
      await expect(borrowButton).toContainText('Borrow');
      await borrowButton.click();
      await this.page.waitForLoadState('load');
    } else {
      // patron already has the book — verify return controls
      await expect(returnNowButton).toBeVisible();
      await expect(returnNowButton).toContainText('Return now');
      await returnNowButton.click();
      await this.page.waitForLoadState('load');
    }
  }
}
