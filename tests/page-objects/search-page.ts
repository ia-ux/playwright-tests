import { type Page, type Locator } from '@playwright/test';

import { CollectionBrowser } from './collection-browser';
import { CollectionFacets } from './collection-facets';
import { DropdownSearchBar } from './dropdown-search-bar';
import { InfiniteScroller } from './infinite-scroller';
import { SortBar } from './sort-bar';
import { SearchPageSearchOption } from '../models';

export class SearchPage {
  readonly page: Page;

  readonly collectionBrowser: CollectionBrowser;
  readonly collectionFacets: CollectionFacets;
  readonly dropdownSearchInput: DropdownSearchBar;
  readonly infiniteScroller: InfiniteScroller;
  readonly sortBar: SortBar;
  readonly tabManager: Locator;

  public constructor(page: Page) {
    this.page = page;

    this.collectionBrowser = new CollectionBrowser(this.page);
    this.collectionFacets = new CollectionFacets(this.page);
    this.dropdownSearchInput = new DropdownSearchBar(this.page);
    this.infiniteScroller = new InfiniteScroller(this.page);
    this.sortBar = new SortBar(this.page);
    this.tabManager = page.getByTestId('tab-manager-tabs-row');
  }

  async visit() {
    await this.page.goto('/search', { waitUntil: 'domcontentloaded' });
  }

  async goBackToSearchPage() {
    await this.visit();
  }

  async selectTab(option: SearchPageSearchOption) {
    await this.tabManager.getByTestId(option).click();
  }
}
