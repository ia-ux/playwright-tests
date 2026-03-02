import { type Page, type Locator } from '@playwright/test';

import { CollectionPageSearchOption, SearchPageSearchOption } from '../models';

export class CollectionSearchInput {
  readonly page: Page;

  readonly collectionSearchInput: Locator;
  readonly btnCollectionSearchInputGo: Locator;
  readonly btnCollectionSearchInputCollapser: Locator;
  readonly btnClearInput: Locator;
  readonly formInputSearchPage: Locator;
  readonly loadingButton: Locator;
  readonly searchOptionsLabel: Locator;
  readonly tabManager: Locator;

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
    this.loadingButton = page.locator('button#go-button.loading');
    this.searchOptionsLabel = page.getByLabel('Search Options');
    this.tabManager = page.getByTestId('tab-manager-tabs-row');
  }

  async queryFor(query: string) {
    await this.formInputSearchPage.fill(query);
    await this.btnCollectionSearchInputGo.click();
    await this.loadingButton.waitFor({ state: 'hidden' });
  }

  async clickClearSearchInput() {
    await this.btnClearInput.click();
  }

  private async waitForSearchInputReady() {
    await this.loadingButton.waitFor({ state: 'hidden' });
    await this.btnCollectionSearchInputGo.waitFor({ state: 'visible' });
  }

  private async selectCollectionPageOption(option: CollectionPageSearchOption) {
    await this.searchOptionsLabel.getByText(option).click();
  }

  private async selectSearchPageOption(option: SearchPageSearchOption) {
    await this.tabManager.getByTestId(option).click();
  }

  async selectSearchOption(cpOption?: CollectionPageSearchOption, spOption?: SearchPageSearchOption) {
    await this.waitForSearchInputReady();
    await this.formInputSearchPage.click({ force: true });

    if (cpOption) {
      await this.selectCollectionPageOption(cpOption);
    } else if (spOption) {
      await this.selectSearchPageOption(spOption);
    }
  }

}
