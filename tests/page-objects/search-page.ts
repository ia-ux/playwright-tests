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

  /**
   * Run a search and wait until results actually exist.
   *
   * The search page updates in place, so the 'domcontentloaded' inside
   * `queryFor` resolves almost instantly and says nothing about whether the
   * query has run. Callers that go straight on to facets were racing the search
   * itself and burning their whole facet timeout waiting for groups that had
   * not been built yet.
   *
   * Use this rather than `dropdownSearchInput.queryFor` whenever the test needs
   * results on the page. Searches that deliberately return nothing, or that
   * redirect off to the Wayback Machine, should keep using `queryFor` directly.
   */
  async searchFor(query: string) {
    await this.dropdownSearchInput.queryFor(query);
    await this.page.waitForURL(/[?&]query=/, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await this.infiniteScroller.firstItemTile.waitFor({
      state: 'visible',
      timeout: 60000,
    });
  }

  async goBackToSearchPage() {
    await this.visit();
  }

  async selectTab(option: SearchPageSearchOption) {
    await this.tabManager.getByTestId(option).click();
  }
}
