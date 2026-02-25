import { test, expect } from '../fixtures';

import { ResultsCategory, CollectionPageSearchOption } from '../models';

test('Home page displays all of its elements', async ({ homePage }) => {
  await test.step('Validate if page elements were loaded', async () => {
    // WBM widget is present
    await expect(homePage.waybackSearch).toBeVisible();

    // Search box is present
    await expect(homePage.searchInput).toBeVisible();

    // Archive news is present
    await expect(homePage.announcements).toBeVisible();

    // Mediatype icons present above search box
    await expect(homePage.mediaTypeIcons).toBeVisible();
    expect(await homePage.mediaTypeHeroIconBars.count()).toBe(9);

    // New to the Archive carousel is present
    await expect(homePage.onboarding).toBeVisible();
    expect(await homePage.onboardingCarousel.count()).toBe(8);

    // Top Collections section is present and populated
    await expect(homePage.infiniteScroller).toBeVisible();
    await expect(homePage.topCollections.first()).toBeVisible();
    expect(await homePage.topCollections.count()).toBeGreaterThan(10);

    // Terms of Service is present in the footer
    await expect(homePage.termsOfService).toBeVisible();
  });
});

test('Do simple metadata search', async ({ homePage }) => {
  const { collectionSearchInput, page } = homePage;
  const queryString = 'cats';

  await test.step(`Query for "cats" and validate that "cats" appears as the search term `, async () => {
    await collectionSearchInput.queryFor(queryString);

    await page.waitForURL(/search/);
    const urlPattern = new RegExp(`query=${queryString}`);
    expect(page.url()).toMatch(urlPattern);

    await expect(collectionSearchInput.formInputSearchPage).toBeVisible();
    const formInputValue = await collectionSearchInput.formInputSearchPage.inputValue();
    expect(formInputValue).toContain(queryString);
  });
});

test('Do simple full-text search', async ({ homePage }) => {
  const { collectionSearchInput, page, collectionBrowser } = homePage;
  const queryString = 'dogs';

  await test.step(`Select text contents in search options, query for "dogs" and validate that "dogs" appears as the search term`, async () => {
    await collectionSearchInput.selectSearchOption(CollectionPageSearchOption.TEXT, undefined);
    await homePage.collectionSearchInput.queryFor(queryString);

    await page.waitForURL(/search/);
    const urlPattern = new RegExp(`query=${queryString}`);
    expect(page.url()).toMatch(urlPattern);

    await expect(collectionSearchInput.formInputSearchPage).toBeVisible();
    const formInputValue = await collectionSearchInput.formInputSearchPage.inputValue();
    expect(formInputValue).toContain(queryString);

    const resultCategoryText = await collectionBrowser.resultsCategory.innerText();
    expect(resultCategoryText).toContain(ResultsCategory.FULLTEXT);
  });
});

test('Do simple TV news captions search', async ({ homePage }) => {
  const { collectionSearchInput, page, collectionBrowser } = homePage;
  const queryString = 'iguanas';

  await test.step(`Select TV in search options, query for "iguanas" and validate that "iguanas" appears as the search term`, async () => {
    await collectionSearchInput.selectSearchOption(CollectionPageSearchOption.TV_CAPTIONS, undefined);
    await homePage.collectionSearchInput.queryFor(queryString);

    await page.waitForURL(/search/);
    const urlPattern = new RegExp(`query=${queryString}`);
    expect(page.url()).toMatch(urlPattern);

    await expect(collectionSearchInput.formInputSearchPage).toBeVisible();
    const formInputValue = await collectionSearchInput.formInputSearchPage.inputValue();
    expect(formInputValue).toContain(queryString);

    const resultCategoryText = await collectionBrowser.resultsCategory.innerText();
    expect(resultCategoryText).toContain(ResultsCategory.TV_CAPTIONS);
  });
});

test('Do simple radio search', async ({ homePage }) => {
  const { collectionSearchInput, page, collectionBrowser } = homePage;
  const queryString = 'rabbits';

  await test.step(`Select radio in search options, query for "rabbits" and validate that "rabbits" appears as the search term`, async () => {
    await collectionSearchInput.selectSearchOption(CollectionPageSearchOption.RADIO_TRANSCRIPTS, undefined);
    await homePage.collectionSearchInput.queryFor(queryString);

    await page.waitForURL(/search/);
    const urlPattern = new RegExp(`query=${queryString}`);
    expect(page.url()).toMatch(urlPattern);

    await expect(collectionSearchInput.formInputSearchPage).toBeVisible();
    const formInputValue = await collectionSearchInput.formInputSearchPage.inputValue();
    expect(formInputValue).toContain(queryString);

    const resultCategoryText = await collectionBrowser.resultsCategory.innerText();
    expect(resultCategoryText).toContain(ResultsCategory.RADIO_TRANSCRIPTS);
  });
});

test('Redirect web search to Wayback machine page', async ({ homePage }) => {
  const { collectionSearchInput, page, collectionBrowser } = homePage;
  const queryString = 'parrots';

  await test.step(`Select TV in search options, query for "parrots" and validate that "parrots" appears as the search term`, async () => {
    await collectionSearchInput.selectSearchOption(CollectionPageSearchOption.WEB, undefined);
    await homePage.collectionSearchInput.queryFor(queryString);

    await page.waitForURL(/web/);
    const urlPattern = new RegExp(queryString);
    expect(page.url()).toMatch(urlPattern);

    expect(await page.title()).toContain('Wayback Machine');
    await expect(collectionBrowser.formInputWaybackPage).toBeVisible();
    expect(await collectionBrowser.formInputWaybackPage.inputValue()).toContain(queryString);
  });
});

test('Use Wayback widget - Redirect web search', async ({ homePage }) => {
  const { page, collectionBrowser } = homePage;
  const queryString = 'canaries';

  await test.step(`Search for "canaries" and validate that "canaries" appears as the search term`, async () => {
    await homePage.waybackSearchFor(queryString);

    await page.waitForURL(/web/);
    const urlPattern = new RegExp(queryString);
    expect(page.url()).toMatch(urlPattern);

    expect(await page.title()).toContain('Wayback Machine');
    await expect(collectionBrowser.formInputWaybackPage).toBeVisible();
    expect(await collectionBrowser.formInputWaybackPage.inputValue()).toContain(queryString);
  });
});

test('TopNav Functionality', async ({ homePage }) => {
  const { page, topNav } = homePage;

  await test.step(`check static top nav functionality`, async () => {
    await page.waitForLoadState('domcontentloaded');

    const mediaButtonsCount = await topNav.mediaMenuButtons.count();
    expect(mediaButtonsCount).toEqual(8);

    await topNav.clickMediaButton('web');
    await expect(topNav.infoBox).toBeVisible();
    await expect(topNav.infoBox.locator('wayback-search')).toBeVisible();
    const focusedClassWeb = await topNav.checkSubNavInfoBoxHasFocus('web');
    expect(focusedClassWeb).toEqual('has-focused');

    await topNav.clickMediaButton('texts');
    await expect(topNav.infoBox).toBeVisible();
    await expect(topNav.infoBox.locator('a:has-text("Open Library")')).toBeVisible();
    const focusedClassTexts = await topNav.checkSubNavInfoBoxHasFocus('texts');
    expect(focusedClassTexts).toEqual('has-focused');

    await topNav.clickMediaButton('video');
    await expect(topNav.infoBox).toBeVisible();
    await expect(topNav.infoBox.locator('a:has-text("TV News")')).toBeVisible();
    const focusedClassVideo = await topNav.checkSubNavInfoBoxHasFocus('video');
    expect(focusedClassVideo).toEqual('has-focused');

    await topNav.clickMediaButton('audio');
    await expect(topNav.infoBox).toBeVisible();
    await expect(topNav.infoBox.locator('a:has-text("Live Music Archive")')).toBeVisible();
    const focusedClassAudio = await topNav.checkSubNavInfoBoxHasFocus('audio');
    expect(focusedClassAudio).toEqual('has-focused');

    await topNav.clickMediaButton('software');
    await expect(topNav.infoBox).toBeVisible();
    await expect(topNav.infoBox.locator('a:has-text("Internet Arcade")')).toBeVisible();
    const focusedClassSoftware = await topNav.checkSubNavInfoBoxHasFocus('software');
    expect(focusedClassSoftware).toEqual('has-focused');

    await topNav.clickMediaButton('images');
    await expect(topNav.infoBox).toBeVisible();
    await expect(topNav.infoBox.locator('a:has-text("Metropolitan Museum")')).toBeVisible();
    const focusedClassImages = await topNav.checkSubNavInfoBoxHasFocus('images');
    expect(focusedClassImages).toEqual('has-focused');
  }); 
})

