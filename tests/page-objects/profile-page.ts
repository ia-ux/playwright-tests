import { type Page, type Locator } from '@playwright/test';

import { CollectionFacets } from './collection-facets';
import { InfiniteScroller } from './infinite-scroller';
import { SearchPage } from './search-page';
import { SortBar } from './sort-bar';

export class ProfilePage {
  readonly page: Page;

  readonly profileHeader: Locator;
  readonly thumbnailFrame: Locator;
  readonly pageSummary: Locator;
  readonly actionBar: Locator;
  readonly pageTabs: Locator;
  readonly activeTab: Locator;
  readonly postsHeading: Locator;

  readonly collectionFacets: CollectionFacets;
  readonly infiniteScroller: InfiniteScroller;
  readonly searchPage: SearchPage;
  readonly sortBar: SortBar;

  public constructor(page: Page) {
    this.page = page;

    this.profileHeader = page.locator('#profile-header');
    this.thumbnailFrame = page.locator('#top-matter > div.thumbnail-frame');
    this.pageSummary = page.locator('#user-summary-container');
    this.actionBar = page.locator('action-bar');
    this.pageTabs = page.locator(
      '#page-container > tab-manager > div.tab-manager-container > nav.tabs-row > ul',
    );
    this.activeTab = this.pageTabs.locator('li.tab.active');
    this.postsHeading = page.locator('div[slot="posts"] user-forum-posts h2');

    this.collectionFacets = new CollectionFacets(this.page);
    this.infiniteScroller = new InfiniteScroller(this.page);
    this.searchPage = new SearchPage(this.page);
    this.sortBar = new SortBar(this.page);
  }

  async visit(userid: string) {
    await this.page.goto(`/details/@${userid}?ab_config=EagerFacets:On`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('load', { timeout: 5000 });
  }

  async clickProfileTab(name: string) {
    await this.pageTabs.getByRole('link', { name }).click();
  }

  getTabById(tabId: string): Locator {
    return this.pageTabs.locator(`a[data-tab-id="${tabId}"]`);
  }

  getTabSlot(tabName: string): Locator {
    return this.page.locator(`div[slot="${tabName}"]`);
  }

  getTabResultCount(tabName: string): Locator {
    return this.page.locator(`div[slot="${tabName}"] collection-browser #results-total`);
  }
}
