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

    this.sortDropdown = this.sortFilterBar.locator('#sort-dropdown-container  #sort-dropdown');
  }

  async applySortFilter(filterBy: string) {
    await this.sortDropdown.waitFor({ state: 'visible' });
    
    await this.sortDropdown.click();
    await this.sortDropdown.getByRole('button', { name: filterBy }).click();
  }

  async clickSortDirection(sortOrder: SortOrder) {
    const currentSortText = await this.srSortText.innerText();
    const oppositeSortText = sortOrder === 'ascending' ? 'descending' : 'ascending';

    if (currentSortText.includes(sortOrder)) {
      await this.btnSortDirection.click();
      return oppositeSortText;
    }
    return null;
  }

  async checkAlphaBarVisibility(filter: string) {
    return await this.alphaBar.isVisible({ timeout: PAGE_WAIT_TIME });
  }

  async clickAlphaBarLetterByPosition(pos: number) {
    await this.page.waitForLoadState('domcontentloaded', { timeout: PAGE_WAIT_TIME });

    const nthLetter = this.alphaBar.locator('#container ul > li').nth(pos);
    const letterSelected = this.alphaBar.locator('#container ul > li.selected');

    await nthLetter.click();

    return {
      letterText: await nthLetter.innerText(),
      selectedCount: await letterSelected.count(),
      expectedLetter: String.fromCharCode(65 + pos),
    };
  }
}
