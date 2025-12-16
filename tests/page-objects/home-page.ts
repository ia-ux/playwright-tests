import { type Page, Locator, expect } from '@playwright/test';

import { CollectionBrowser } from './collection-browser';
import { CollectionSearchInput } from './collection-search-input';
import { TopNav } from './top-nav';
import { DetailsPage } from './details-page';

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
  readonly detailsPage: DetailsPage;
  readonly topNav: TopNav;

  public constructor(page: Page) {
    this.page = page;
    this.waybackSearch = this.page.locator('ia-wayback-search');
    this.searchInput = this.page.locator('collection-search-input');
    this.announcements = this.page.locator('#announcements > hero-block-announcements');
    this.mediaTypeIcons = this.page.locator('#icon-block-container > home-page-hero-block-icon-bar'); 
    this.mediaTypeHeroIconBars = this.mediaTypeIcons.locator('#mediacount-icon-container > a');
    this.onboarding = this.page.locator('home-page-onboarding');
    this.onboardingCarousel = this.page.locator('#onboarding-carousel').locator('#onboarding-content > a');
    this.infiniteScroller = this.page.locator('infinite-scroller');
    this.topCollections = this.infiniteScroller.locator('#container > .cell-container');
    this.termsOfService = this.page.locator('footer > app-footer');

    this.collectionBrowser = new CollectionBrowser(page);
    this.collectionSearchInput = new CollectionSearchInput(page);
    this.topNav = new TopNav(page);
    this.detailsPage = new DetailsPage(page);
  }

  async waybackSearchFor(query: string) {
    const wbSearchInput = this.page
      .locator('#wayback-search-container')
      .locator('#url');
    await wbSearchInput.fill(query);
    await wbSearchInput.press('Enter');
  }
}
