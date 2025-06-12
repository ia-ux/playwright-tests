import { type Page, type Locator, expect } from '@playwright/test';

import { SearchOption } from '../models';

export class CollectionSearchInput {
  readonly page: Page;

  readonly collectionSearchInput: Locator;
  readonly btnCollectionSearchInputGo: Locator;
  readonly btnCollectionSearchInputCollapser: Locator;
  readonly btnClearInput: Locator;
  readonly formInputSearchPage: Locator;

  public constructor(page: Page) {
    this.page = page;

    this.collectionSearchInput = this.page.locator('collection-search-input');
    this.formInputSearchPage = page.locator(
      'collection-search-input #text-input',
    );
    this.btnCollectionSearchInputGo = page.locator(
      'collection-search-input #go-button',
    );
    this.btnCollectionSearchInputCollapser = page.locator(
      'collection-search-input #button-collapser',
    );
    this.btnClearInput = page.locator('collection-search-input #clear-button');
  }

  async queryFor(query: string) {
    await this.formInputSearchPage.fill(query);
    await this.formInputSearchPage.press('Enter');
  }

  async validateSearchInput(query: string) {
    expect(await this.formInputSearchPage.inputValue()).toBe(query);
  }

  async clickClearSearchInput() {
    await this.btnClearInput.click();
  }

  async clickSearchInputOption(option: SearchOption, type: string) {
    // If this strategy works, `type` can be removed.
    const inputComponent = this.collectionSearchInput;
    await expect(inputComponent).toBeVisible();

    const searchInput = inputComponent.locator('#text-input');
    await searchInput.waitFor({ state: 'visible' });

    // Webkit doesn't seem to work without `force: true`, but that causes problems
    // for the other browsers. How can this work with one strategy?
    if (this.page.context().browser()?.browserType().name() === 'webkit') {
      await searchInput.click({ force: true });
    } else {
      await searchInput.click();
    }

    const searchOptions = inputComponent.locator('#search_options');
    await expect(searchOptions).toBeVisible();
    await expect(searchOptions).toHaveAttribute('aria-expanded', 'true');

    const optionSpan = inputComponent.locator(
      `label:has(input[type="radio"][name="sin"][value="${option}"]) span`
    );
    await optionSpan.waitFor({ state: 'visible' });
    await optionSpan.click();

    const radio = inputComponent.locator(
      `input[type="radio"][name="sin"][value="${option}"]`
    );
    await expect(radio).toBeChecked();
  }

  async validateClearSearchInput() {
    await expect(this.btnClearInput).not.toBeVisible();
    expect(await this.formInputSearchPage.inputValue()).toBe('');
  }
}
