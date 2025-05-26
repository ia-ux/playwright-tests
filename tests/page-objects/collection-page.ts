import { type Page, type Locator } from '@playwright/test';

import { CollectionBrowser } from './collection-browser';
import { CollectionFacets } from './collection-facets';
import { CollectionSearchInput } from './collection-search-input';
import { InfiniteScroller } from './infinite-scroller';
import { SortBar } from './sort-bar';

export class CollectionPage {
  readonly page: Page;

  readonly pageHeader: Locator;
  readonly pageSummary: Locator;
  readonly pageTabs: Locator;
  readonly topMatterFrame: Locator;
  readonly actionBar: Locator;
  readonly aboutPageActivity: Locator;
  readonly aboutPageCollectionInfo: Locator;
  readonly forumContainer: Locator;
  readonly newPostButton: Locator;
  readonly rssButton: Locator;
  readonly cbContainer: Locator;

  readonly collectionBrowser: CollectionBrowser;
  readonly collectionFacets: CollectionFacets;
  readonly collectionSearchInput: CollectionSearchInput;
  readonly infiniteScroller: InfiniteScroller;
  readonly sortBar: SortBar;

  public constructor(page: Page) {
    this.page = page;

    this.pageHeader = page.locator('#page-header');
    this.pageSummary = page.locator('#title-summary-container');
    this.pageTabs = page.locator(
      '#page-container > tab-manager > div.tab-manager-container > nav.tabs-row > ul',
    );
    this.topMatterFrame = page.locator('#top-matter > div.thumbnail-frame');
    this.actionBar = page.locator('action-bar');

    this.aboutPageActivity = page.getByRole('heading', { name: 'Activity' });
    this.aboutPageCollectionInfo = page.getByRole('heading', { name: 'Collection Info' });

    this.forumContainer = page.locator('ia-forum #forum-container');
    this.newPostButton = this.forumContainer.getByRole('link', {name: 'New Post'});
    this.rssButton = this.forumContainer.getByRole('link', { name: 'RSS' });

    this.cbContainer = page.locator('#collection-browser-container');

    this.collectionBrowser = new CollectionBrowser(this.page);
    this.collectionFacets = new CollectionFacets(this.page);
    this.collectionSearchInput = new CollectionSearchInput(this.page);
    this.infiniteScroller = new InfiniteScroller(this.page);
    this.sortBar = new SortBar(this.page);
  }

  async visit(collection: string) {
    await this.page.goto(`/details/${collection}?ab_config=EagerFacets:On`);
  }

  async clickCollectionTab(tabName: string) {
    const elem = this.page.locator('div.tab-manager-container > nav > ul > li');
    await elem.filter({ hasText: tabName }).click();
  }

  async clickMoreBtnFromSummary() {
    await this.pageHeader.waitFor({ state: 'visible' });
    await this.pageSummary.getByTestId('collection-page-more-link-btn').click();
  }

  getPageActiveTabText() {
    return this.pageTabs.locator('li.tab.active').innerText();
  }

}
