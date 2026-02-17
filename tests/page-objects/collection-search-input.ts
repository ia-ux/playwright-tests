import { type Page, type Locator } from '@playwright/test';

import { CollectionPageSearchOption, SearchPageSearchOption } from '../models';

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
    await this.btnCollectionSearchInputGo.click();
    await this.page.locator('button#go-button.loading').waitFor({ state: 'hidden' });
  }

  async clickClearSearchInput() {
    await this.btnClearInput.click();
  }

  async clickSearchInputOption(cpOption?: CollectionPageSearchOption, spOption?: SearchPageSearchOption) {
    await this.page.locator('button#go-button.loading').waitFor({ state: 'hidden' });
    await this.collectionSearchInput.locator('#go-button').waitFor({ state: 'visible'});
    await this.formInputSearchPage.click({ force: true });
    // The search input on collection page has a different structure for the search options filter in search page
    if (cpOption) { 
      await this.page.getByLabel('Search Options').getByText(cpOption).click();
    } else if (spOption) {
      const tabManager = this.page.getByTestId('tab-manager-tabs-row');
      await tabManager.getByTestId(spOption).click();
    }
  }

}
