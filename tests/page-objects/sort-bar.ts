import { type Page, type Locator, expect } from '@playwright/test';

import { SortOrder } from '../models';

export class SortBar {
  readonly page: Page;
  readonly sortFilterBar: Locator;
  readonly desktopSortSelector: Locator;
  readonly btnSortDirection: Locator;
  readonly alphaBar: Locator;
  readonly srSortText: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.alphaBar = page.locator('alpha-bar');
    this.sortFilterBar = page.locator('sort-filter-bar section#sort-bar');
    this.desktopSortSelector = this.sortFilterBar.locator('ul#desktop-sort-selector');
    this.btnSortDirection = this.sortFilterBar.locator('.sort-direction-icon');
    this.srSortText = this.sortFilterBar.locator(
      'button.sort-direction-selector span.sr-only',
    );
  }

  async buttonClick(sortName: string) {
    await this.desktopSortSelector.getByRole('button', { name: sortName }).click();
  }

  async caratDropdownClick(dropDownLocator: Locator) {
    try {
      await dropDownLocator.click({ force: true, clickCount: 2 });
      // Note: this is a workaround to wait for the dropdown options to be visible before clicking on the dropdown.
      // The sort-bar component is being set back to Relevance (default) after clicking on the dropdown, 
      // so we can wait for that text to be set before clicking on the dropdown again to open the dropdown options.
      const selectedOption = this.desktopSortSelector.locator('li .selected');
      const selectedOptionText = await selectedOption.innerText();
      console.log(`selected option: ${selectedOptionText}`);
      if (selectedOptionText === 'Relevance') {
        await dropDownLocator.click({ force: true, clickCount: 2 });
      } else {
        console.log('Selected option is not Relevance, dropdown options should be visible now');
      }
    } catch (e) {
      console.warn('Relevance option was not visible initially, clicking on the dropdown without waiting for it to be visible might cause flaky test');
    }
  }

  async textClick(name: string) {
    await this.desktopSortSelector.getByText(name).first().click();
  }

  async applySortFilter(filter: string) {
    const flatSortTextList = ['Relevance', 'Title', 'Creator'];

    if (!flatSortTextList.includes(filter)) {
      const _toggleOption = filter.includes('views')
        ? await this.desktopSortSelector.locator('li #views-dropdown').innerText()
        : await this.desktopSortSelector.locator('li #date-dropdown').innerText();
      
      const dropdownLocator = filter.includes('views') 
        ? this.desktopSortSelector.locator('li #views-dropdown') 
        : this.desktopSortSelector.locator('li #date-dropdown');

      // If the filter we want to apply is already visible as a toggle option, click it, 
      // otherwise open the dropdown and click the option there
      if (filter === _toggleOption) {
        await this.textClick(filter);
      } else {
        await this.caratDropdownClick(dropdownLocator);
        await this.buttonClick(filter);
      }
    } else {
      await this.buttonClick(filter);
    }
  }

  async clickSortDirection(sortOrder: SortOrder) {
    // TODO: might still need to find better way to check sort order
    const currentSortText = await this.srSortText.innerText();
    const oppositeSortText = sortOrder === 'ascending' ? 'descending' : 'ascending';

    if (currentSortText.includes(sortOrder)) {
      await this.btnSortDirection.click();
      await expect(this.srSortText).toContainText(
        `Change to ${oppositeSortText} sort`,
      );
    }
  }

  async checkAlphaBarVisibility(filter: string) {
    if (!['Title', 'Creator'].includes(filter)) {
      await expect(this.alphaBar).not.toBeVisible({ timeout: 60000 });
    } else {
      await expect(this.alphaBar).toBeVisible({ timeout: 60000 });
    }
  }

  async clickAlphaBarLetterByPosition(pos: number) {
    await this.page.waitForLoadState('load', { timeout: 60000 });

    const alphabet = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
    const nthLetter = this.alphaBar.locator('#container ul > li').nth(pos);
    const letterSelected = this.alphaBar.locator('#container ul > li.selected');

    await nthLetter.click();

    // Note: assertion .toEqual has deep equality error in webkit
    expect(await nthLetter.innerText()).toContain(alphabet[pos]);
    expect(await letterSelected.count()).toEqual(1);
  }

  async clearAlphaBarFilter() {
    const letterSelected = this.alphaBar.locator('#container ul > li.selected');
    expect(await letterSelected.count()).toEqual(0);
  }

  async alphaSortBarNotVisibile() {
    await expect(this.alphaBar).not.toBeVisible({ timeout: 60000 });
  }
}