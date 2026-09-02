import { type Page, type Locator } from '@playwright/test';

import { CollectionBrowser } from './collection-browser';
import { DropdownSearchBar } from './dropdown-search-bar';
import { TopNav } from './top-nav';

const WAYBACK_SUBMIT_ATTEMPTS = 4;
const WAYBACK_SUBMIT_TIMEOUT = 15000;

export class HomePage {
  readonly page: Page;

  readonly waybackSearch: Locator;
  readonly announcements: Locator;
  readonly mediaTypeIcons: Locator;
  readonly mediaTypeHeroIconBars: Locator;
  readonly onboarding: Locator;
  readonly onboardingCarousel: Locator;
  readonly infiniteScroller: Locator;
  readonly topCollections: Locator;
  readonly termsOfService: Locator;

  readonly collectionBrowser: CollectionBrowser;
  readonly dropdownSearchInput: DropdownSearchBar;
  readonly topNav: TopNav;

  public constructor(page: Page) {
    this.page = page;
    this.waybackSearch = this.page.locator('ia-wayback-search');
    this.announcements = this.page.locator(
      '#announcements > hero-block-announcements',
    );
    this.mediaTypeIcons = this.page.locator(
      '#icon-block-container > home-page-hero-block-icon-bar',
    );
    this.mediaTypeHeroIconBars = this.mediaTypeIcons.locator(
      '#mediacount-icon-container > a',
    );
    this.onboarding = this.page.locator('home-page-onboarding');
    this.onboardingCarousel = this.onboarding.locator('basic-carousel > a');
    this.infiniteScroller = this.page.locator('infinite-scroller');
    this.topCollections = this.infiniteScroller.locator(
      '#container > .cell-container',
    );
    this.termsOfService = this.page.locator('footer > app-footer');

    this.collectionBrowser = new CollectionBrowser(page);
    this.dropdownSearchInput = new DropdownSearchBar(page);
    this.topNav = new TopNav(page);
  }

  async waybackSearchFor(query: string) {
    await this.page.waitForLoadState('domcontentloaded');
    await this.waybackSearch.waitFor({ state: 'visible', timeout: 30000 });
    await this.termsOfService.waitFor({ state: 'visible', timeout: 30000 });

    const wbSearchInput = this.waybackSearch.locator('#url');
    await wbSearchInput.waitFor({ state: 'visible', timeout: 30000 });

    // <ia-wayback-search> is a lit component whose submit handler is bound during
    // hydration, which can land noticeably after the element becomes visible.
    // Submitting before then is silently swallowed — no navigation, no error — so
    // a single Enter that lands too early burns the full navigation timeout and
    // fails the test. Retry the submit instead, with a short wait per attempt.
    for (let attempt = 1; attempt <= WAYBACK_SUBMIT_ATTEMPTS; attempt++) {
      await wbSearchInput.fill(query);
      await wbSearchInput.press('Enter');
      try {
        await this.page.waitForURL(/web\.archive\.org/, {
          waitUntil: 'domcontentloaded',
          timeout: WAYBACK_SUBMIT_TIMEOUT,
        });
        return;
      } catch (err) {
        if (attempt === WAYBACK_SUBMIT_ATTEMPTS) {
          throw new Error(
            `Wayback search for "${query}" did not navigate to web.archive.org ` +
              `after ${WAYBACK_SUBMIT_ATTEMPTS} submit attempts`,
          );
        }
      }
    }
  }
}
