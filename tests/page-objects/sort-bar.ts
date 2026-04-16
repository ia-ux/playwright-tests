import { type Page, type Locator } from '@playwright/test';

import { SortOrder } from '../models';
import { PAGE_WAIT_TIME } from '../utils';

export class SortBar {
  readonly page: Page;
  readonly sortFilterBar: Locator;
  readonly btnSortDirection: Locator;
  readonly alphaBar: Locator;
  readonly srSortText: Locator;

  readonly sortDropdown: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.alphaBar = page.locator('alpha-bar');
    this.sortFilterBar = page.locator('sort-filter-bar section#sort-bar');
    this.btnSortDirection = this.sortFilterBar.locator('.sort-direction-icon');
    this.srSortText = this.sortFilterBar.locator(
      'button.sort-direction-selector span.sr-only',
    );

    this.sortDropdown = this.sortFilterBar.locator(
      '#sort-dropdown-container #sort-dropdown',
    );
  }

  async applySortFilter(filterBy: string) {
    await this.sortDropdown.waitFor({ state: 'visible' });
    await this.sortDropdown.click();
    await this.sortDropdown.getByRole('button', { name: filterBy }).click();
  }

  async clickSortDirection(sortOrder: SortOrder) {
    const currentSortText = await this.srSortText.innerText();
    const oppositeSortText =
      sortOrder === 'ascending' ? 'descending' : 'ascending';

    if (currentSortText.includes(sortOrder)) {
      await this.btnSortDirection.click();
      return oppositeSortText;
    }
    return null;
  }

  async checkAlphaBarVisibility(_filter: string) {
    return this.alphaBar.isVisible({ timeout: PAGE_WAIT_TIME });
  }

  async clickAlphaBarLetterByPosition(pos: number) {
    const nthLetter = this.alphaBar.locator('#container ul > li').nth(pos);
    const letterSelected = this.alphaBar.locator('#container ul > li.selected');

    // Wait for the alpha-bar to finish rendering (web components render after DOMContentLoaded)
    await nthLetter.waitFor({ state: 'visible', timeout: PAGE_WAIT_TIME });
    // Click the button inside the li — clicking the li directly is intercepted by alpha-bar-tooltip
    await nthLetter.locator('button').click();
    await letterSelected.waitFor({ state: 'visible', timeout: PAGE_WAIT_TIME });

    return {
      letterText: await nthLetter.innerText(),
      selectedCount: await letterSelected.count(),
      expectedLetter: String.fromCharCode(65 + pos),
    };
  }
}
