import { type Page, type Locator } from '@playwright/test';

import { HomePageSearchOption } from '../models';

export class DropdownSearchBar {
  readonly page: Page;

  readonly searchInput: Locator;
  readonly formInputSearchPage: Locator;
  readonly searchButton: Locator;
  readonly categoryToggle: Locator;

  public constructor(page: Page) {
    this.page = page;

    const root = page.locator('dropdown-search-bar').first();
    this.searchInput = root.getByRole('textbox', {
      name: 'Search the Archive. Filters and Advanced Search available below.',
    });
    // formInputSearchPage is the same input, used post-navigation to verify query value
    this.formInputSearchPage = this.searchInput;
    this.categoryToggle = root.getByRole('button', { name: /Toggle options/ });
    this.searchButton = root.getByRole('button', {
      name: 'Search',
      exact: true,
    });
  }

  async queryFor(query: string) {
    await this.searchInput.fill(query);
    await this.searchButton.click();
  }

  async selectSearchOption(option: HomePageSearchOption) {
    await this.categoryToggle.click();
    await this.page
      .getByRole('menuitem', { name: option, exact: true })
      .click();
  }
}
