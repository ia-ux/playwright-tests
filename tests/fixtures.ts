import { test as base } from '@playwright/test';

import { CollectionPage } from './page-objects/collection-page';
import { MusicPage } from './page-objects/music-page';
import { SearchPage } from './page-objects/search-page';
import { HomePage } from './page-objects/home-page';
import { ProfilePage } from './page-objects/profile-page';
import { BookPage } from './page-objects/book-page';
import { DetailsPage } from './page-objects/details-page';
import { LendingBarAutoRenew } from './page-objects/lending-bar-auto-renew';
import { LoginPage } from './page-objects/login-page';

import { testBeforeEachConfig } from '../config';

type PageFixtures = {
  lendingBarAutoRenew: LendingBarAutoRenew;
  detailsPage: DetailsPage;
  patronDetailsPage: DetailsPage;
  adminDetailsPage: DetailsPage;
  bookPage: BookPage;
  homePage: HomePage;
  musicPage: MusicPage;
  collectionPage: CollectionPage;
  searchPage: SearchPage;
  profilePage: ProfilePage;
  loginPage: LoginPage;
  profilePageUploads: ProfilePage;
};

export const test = base.extend<PageFixtures>({
  lendingBarAutoRenew: async ({ page }, use) => {
    const lendingBarAutoRenew = new LendingBarAutoRenew(page);
    await page.route(/(analytics|fonts)/, route => route.abort());
    await use(lendingBarAutoRenew);
    await page.close().catch(() => {});
  },
  patronDetailsPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: '.auth/patron.json',
    });
    const page = await context.newPage();
    const detailsPage = new DetailsPage(page);
    await page.route(
      /(analytics|fonts|googletag|doubleclick|adservice)/,
      route => route.abort(),
    );
    await use(detailsPage);
    await context.close().catch(() => {});
  },
  adminDetailsPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: '.auth/admin.json',
    });
    const page = await context.newPage();
    const detailsPage = new DetailsPage(page);
    await page.route(
      /(analytics|fonts|googletag|doubleclick|adservice)/,
      route => route.abort(),
    );
    await use(detailsPage);
    await context.close().catch(() => {});
  },
  detailsPage: async ({ page }, use) => {
    const detailsPage = new DetailsPage(page);
    await page.route(
      /(analytics|fonts|googletag|doubleclick|adservice)/,
      route => route.abort(),
    );
    await use(detailsPage);
    await page.close().catch(() => {});
  },
  bookPage: async ({ page }, use) => {
    const bookPage = new BookPage(page);
    await page.route(/(analytics|fonts)/, route => route.abort());
    await use(bookPage);
    await page.close().catch(() => {});
  },
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await page.route(/(analytics|fonts)/, route => route.abort());
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await use(homePage);
    await page.close().catch(() => {});
  },
  musicPage: async ({ page }, use) => {
    const musicPage = new MusicPage(page);
    await page.route(/(analytics|fonts)/, route => route.abort());
    await use(musicPage);
    await page.close().catch(() => {});
  },
  collectionPage: async ({ page }, use) => {
    const collectionPage = new CollectionPage(page);
    await page.route(/(analytics|fonts)/, route => route.abort());
    await collectionPage.visit('oldtimeradio');
    await use(collectionPage);
    await page.close().catch(() => {});
  },
  searchPage: async ({ page }, use) => {
    const searchPage = new SearchPage(page);
    await page.route(/(analytics|fonts)/, route => route.abort());
    await searchPage.visit();
    await use(searchPage);
    await page.close().catch(() => {});
  },
  profilePage: async ({ page }, use) => {
    const profilePage = new ProfilePage(page);
    await page.route(/(analytics|fonts)/, route => route.abort());
    await profilePage.visit('brewster');
    await use(profilePage);
    await page.close().catch(() => {});
  },
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await page.route(/(analytics|fonts)/, route => route.abort());
    await use(loginPage);
    await page.close().catch(() => {});
  },
  profilePageUploads: async ({ page }, use) => {
    const profilePage = new ProfilePage(page);
    await page.route(/(analytics|fonts)/, route => route.abort());
    await profilePage.visit('brewster/uploads');
    await use(profilePage);
    await page.close().catch(() => {});
  },
});

test.beforeEach(async ({ request, context }) => {
  if (process.env.IS_REVIEW_APP === 'true') {
    await testBeforeEachConfig(context);
  }

  // add config to check what_host node the test is connecting at
  // update the .env file to enable/disable it
  if (process.env.WHAT_HOST === 'true') {
    const whathost = await request.get('/services/whathost.php');
    console.log('whathost: ', await whathost.text());
  }
});

export { expect } from '@playwright/test';
