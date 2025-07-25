import { test, expect } from '../fixtures';

import { SearchOption } from '../models';

test('Home page displays all of its elements', async ({ homePage }) => {
  await test.step('Validate Wayback Machine widget is present', async () => {
    await expect(homePage.waybackSearch).toBeVisible();
  });
  
  await test.step('Validate search box is present', async () => {
    await expect(homePage.searchInput).toBeVisible();
  });

  await test.step('Validate Archive news is present', async () => {
    await expect(homePage.announcements).toBeVisible();
  });

  await test.step('Validate media type icons are present', async () => {
    await expect(homePage.mediaTypeIcons).toBeVisible();
    await homePage.mediaTypeIcons.first().waitFor({ state: 'visible' });
    expect((await homePage.mediaTypeHeroIconBars.all()).length).toBe(9);
  });

  await test.step('Validate New to the Archive carousel is present', async () => {
    await expect(homePage.onboarding).toBeVisible();
    await homePage.onboardingCarousel.first().waitFor({ state: 'visible' });
    expect((await homePage.onboardingCarousel.all()).length).toBe(8);
  });
  
  await test.step('Validate Top Collections section is present and populated', async () => {
    await expect(homePage.infiniteScroller).toBeVisible();
    await homePage.topCollections.first().waitFor({ state: 'visible' });
    expect((await homePage.topCollections.all()).length).toBeGreaterThan(10);
  });

  await test.step('Validate Terms of Service link is present', async () => {
    await expect(homePage.termsOfService).toBeVisible();
  });
});

test('Do simple metadata search', async ({ homePage }) => {
  await test.step(`Query for "cats" and validate that "cats" appears as the search term `, async () => {
    await homePage.collectionSearchInput.queryFor('cats');
    await homePage.page.waitForURL(/search\?query=cats/);
    expect (await homePage.collectionSearchInput.formInputSearchPage.inputValue()).toBe('cats');
  });
});

test('Do simple full-text search', async ({ homePage }) => {
  await test.step(`Select text contents in search options, query for "dogs" and validate that "dogs" appears as the search term`, async () => {
    await homePage.collectionSearchInput.clickSearchInputOption(SearchOption.TEXT, 'search');
    await homePage.collectionSearchInput.queryFor('dogs');
    await homePage.page.waitForURL(/search\?query=dogs/);
    expect (await homePage.collectionSearchInput.formInputSearchPage.inputValue()).toBe('dogs');
  });
});

test('Do simple TV search', async ({ homePage, detailsPage }) => {
  await test.step(`Select TV in search options, query for "iguanas" and validate that "iguanas" appears as the search term`, async () => {
    await homePage.collectionSearchInput.clickSearchInputOption(SearchOption.TV, 'search');
    await homePage.collectionSearchInput.queryFor('iguanas');

    const detailsPage = homePage.detailsPage;
    // Note: The page is redirected to TV search page
    await homePage.page.waitForURL(/tv\?q=iguanas/);
    expect(await detailsPage.page.title()).toContain('Internet Archive TV NEWS');
    await expect(detailsPage.tvNewsArchive).toBeVisible();
    await expect(detailsPage.tvSearchTitle).toBeVisible();
    await expect(detailsPage.formInputTVPage).toBeVisible();
    expect(await detailsPage.formInputTVPage.inputValue()).toContain('iguanas');
  });
});

test('Do simple radio search', async ({ homePage, detailsPage }) => {
  await test.step(`Select radio in search options, query for "rabbits" and validate that "rabbits" appears as the search term`, async () => {
    await homePage.collectionSearchInput.clickSearchInputOption(SearchOption.RADIO, 'search');
    await homePage.collectionSearchInput.queryFor('rabbits');
    
     // Note: The page is redirected to old search page
    await detailsPage.page.waitForURL(/sin=RADIO/);
    await expect(detailsPage.formInputRadioPage).toBeVisible();
    expect(await detailsPage.formInputRadioPage.inputValue()).toContain('rabbits');
  });
});

test('Redirect web search to Wayback machine page', async ({ homePage, detailsPage }) => {
  await test.step(`Select TV in search options, query for "parrots" and validate that "parrots" appears as the search term`, async () => {
    await homePage.collectionSearchInput.clickSearchInputOption(SearchOption.WEB, 'search');
    await homePage.collectionSearchInput.queryFor('parrots');
    
    // Note: The page is redirected to Wayback Machine search page
    await detailsPage.page.waitForURL(/web/);
    expect(await detailsPage.page.title()).toContain('Wayback Machine');
    await expect(detailsPage.formInputWaybackPage).toBeVisible();
    expect(await detailsPage.formInputWaybackPage.inputValue()).toContain('parrots');
  });
});

test('Use Wayback widget - Redirect web search', async ({ homePage, detailsPage }) => {
  await test.step(`Search for "canaries" and validate that "canaries" appears as the search term`, async () => {
    await homePage.waybackSearchFor('canaries');

    // Note: The page is redirected to Wayback Machine search page
    await detailsPage.page.waitForURL(/web/);
    expect(await detailsPage.page.title()).toContain('Wayback Machine');
    await expect(detailsPage.formInputWaybackPage).toBeVisible();
    expect(await detailsPage.formInputWaybackPage.inputValue()).toContain('canaries');
  });
});

test('TopNav Functionality', async ({ homePage }) => {
  await test.step(`check static top nav functionality`, async () => {
    const { topNav } = homePage;
    await expect(topNav.iaTopNav).toBeVisible();
    await expect(topNav.navHome).toBeVisible();
    await expect(topNav.mediaMenu).toBeVisible();

    const _mediaMenuButtons = await topNav.mediaMenuButtons.all();
    expect(_mediaMenuButtons.length).toEqual(8);

    for (let [i, text] of topNav.mediaTypeTexts.entries()) {
      const elemAttr = await _mediaMenuButtons[i].getAttribute('data-mediatype');
      expect(elemAttr).toEqual(text);
    }

    await topNav.clickMediaButton('web');
    await expect(topNav.infoBox.locator('wayback-search')).toBeVisible();

    await topNav.clickMediaButton('texts');
    await expect(topNav.infoBox.locator('a:has-text("Open Library")')).toBeVisible();

    await topNav.clickMediaButton('video');
    await expect(topNav.infoBox.locator('a:has-text("TV News")')).toBeVisible();

    await topNav.clickMediaButton('audio');
    await expect(topNav.infoBox.locator('a:has-text("Live Music Archive")')).toBeVisible();

    await topNav.clickMediaButton('software');
    await expect(topNav.infoBox.locator('a:has-text("Internet Arcade")')).toBeVisible();

    await topNav.clickMediaButton('images');
    await expect(topNav.infoBox.locator('a:has-text("Metropolitan Museum")')).toBeVisible();
  }); 
})