import { type Page, Locator } from '@playwright/test';

import { CollectionBrowser } from './collection-browser';
import { CollectionSearchInput } from './collection-search-input';
import { TopNav } from './top-nav';

export class HomePage {
  readonly page: Page;

  readonly waybackSearch: Locator;
  readonly searchInput: Locator;
  readonly announcements: Locator;
  readonly mediaTypeIcons: Locator;
  readonly mediaTypeHeroIconBars: Locator;
  readonly onboarding: Locator;
  readonly onboardingCarousel: Locator;
  readonly infiniteScroller: Locator;
  readonly topCollections: Locator;
  readonly termsOfService: Locator;

  readonly collectionBrowser: CollectionBrowser;
  readonly collectionSearchInput: CollectionSearchInput;
  readonly topNav: TopNav;

  public constructor(page: Page) {
    this.page = page;
    this.waybackSearch = this.page.locator('ia-wayback-search');
    this.searchInput = this.page.locator('collection-search-input');
    this.announcements = this.page.locator('#announcements > hero-block-announcements');
    this.mediaTypeIcons = this.page.locator('#icon-block-container > home-page-hero-block-icon-bar'); 
    this.mediaTypeHeroIconBars = this.mediaTypeIcons.locator('#mediacount-icon-container > a');
    this.onboarding = this.page.locator('home-page-onboarding');
    this.onboardingCarousel = this.onboarding.locator('basic-carousel > a');
    this.infiniteScroller = this.page.locator('infinite-scroller');
    this.topCollections = this.infiniteScroller.locator('#container > .cell-container');
    this.termsOfService = this.page.locator('footer > app-footer');

    this.collectionBrowser = new CollectionBrowser(page);
    this.collectionSearchInput = new CollectionSearchInput(page);
    this.topNav = new TopNav(page);
  }

  async waybackSearchFor(query: string) {
    await this.page.waitForLoadState('domcontentloaded');
    await this.waybackSearch.waitFor({ state: 'visible' });
    await this.termsOfService.waitFor({ state: 'visible' });

    const wbSearchInput = this.waybackSearch.locator('#url');
    await wbSearchInput.fill(query);
    await Promise.all([
      this.page.waitForURL(/web\.archive\.org/),
      wbSearchInput.press('Enter'),
    ]);
  }
}
