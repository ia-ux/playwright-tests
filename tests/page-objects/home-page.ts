import { type Page, Locator, expect } from '@playwright/test';

import { CollectionBrowser } from './collection-browser';
import { CollectionSearchInput } from './collection-search-input';
import { TopNav } from './top-nav';

export class HomePage {
  readonly page: Page;

  readonly waybackSearch: Locator;

  readonly collectionBrowser: CollectionBrowser;
  readonly collectionSearchInput: CollectionSearchInput;
  readonly topNav: TopNav;

  public constructor(page: Page) {
    this.page = page;
    this.waybackSearch = this.page.locator('ia-wayback-search');

    this.collectionBrowser = new CollectionBrowser(page);
    this.collectionSearchInput = new CollectionSearchInput(page);
    this.topNav = new TopNav(page);
  }

  async validatePageElements() {
    // WBM widget is present
    await expect(this.waybackSearch).toBeVisible();

    // Search box is present
    await expect(this.page.locator('collection-search-input')).toBeVisible();

    // Archive news is present
    await expect(
      this.page.locator('#announcements > hero-block-announcements'),
    ).toBeVisible();

    // Mediatype icons present above search box
    await expect(
      this.page.locator(
        '#icon-block-container > home-page-hero-block-icon-bar',
      ),
    ).toBeVisible();

    const mediatypeHeroIconBars = this.page
      .locator('home-page-hero-block-icon-bar')
      .locator('#mediacount-icon-container > a')
      .all();
    expect((await mediatypeHeroIconBars).length).toBe(9);

    // New to the Archive carousel is present
    const homePageOnBoarding = this.page.locator('home-page-onboarding');
    await expect(homePageOnBoarding).toBeVisible();
    const onboardingCarousel = this.page
      .locator('#onboarding-carousel')
      .locator('#onboarding-content > a')
      .all();
    expect((await onboardingCarousel).length).toBe(8);

    // Top Collections section is present and populated
    const headerTopCollections = this.page.getByRole('heading', { name: 'Top Collections' });
    await expect(headerTopCollections).toBeVisible();

    const infiniteScroller = this.page.locator('infinite-scroller');
    const containerItems = infiniteScroller.locator('#container > .cell-container');
    await containerItems.first().waitFor({ state: 'visible' });
    expect((await containerItems.all()).length).toBeGreaterThan(10);

    // Terms of Service footer is present
    await expect(this.page.locator('footer > app-footer')).toBeVisible();
  }

  async waybackSearchFor(query: string) {
    const wbSearchInput = this.page
      .locator('#wayback-search-container')
      .locator('#url');
    await wbSearchInput.fill(query);
    await wbSearchInput.press('Enter');
  }
}
