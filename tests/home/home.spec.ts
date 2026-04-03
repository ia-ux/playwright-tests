import { test, expect } from '../fixtures';

import { ResultsCategory, CollectionPageSearchOption } from '../models';

test('Home page displays all of its elements', async ({ homePage }) => {
  await test.step('Verify WBM widget and search box are visible', async () => {
    await expect(homePage.waybackSearch).toBeVisible();
    await expect(homePage.searchInput).toBeVisible();
  });

  await test.step('Verify announcements and media type icons are visible', async () => {
    await expect(homePage.announcements).toBeVisible();
    await expect(homePage.mediaTypeIcons).toBeVisible();
    expect(await homePage.mediaTypeHeroIconBars.count()).toBe(9);
  });

  await test.step('Verify onboarding carousel is visible with 8 items', async () => {
    await expect(homePage.onboarding).toBeVisible();
    expect(await homePage.onboardingCarousel.count()).toBe(8);
  });

  await test.step('Verify top collections section is populated', async () => {
    await expect(homePage.infiniteScroller).toBeVisible();
    await expect(homePage.topCollections.first()).toBeVisible();
    expect(await homePage.topCollections.count()).toBeGreaterThan(10);
  });

  await test.step('Verify terms of service is visible in the footer', async () => {
    await expect(homePage.termsOfService).toBeVisible();
  });
});

test('Do simple metadata search', async ({ homePage }) => {
  const { collectionSearchInput, page } = homePage;
  const queryString = 'cats';

  await test.step(`Search for "${queryString}"`, async () => {
    await collectionSearchInput.queryFor(queryString);
  });

  await test.step(`Verify URL and search input reflect the query`, async () => {
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

  await test.step(`Select text contents option and search for "${queryString}"`, async () => {
    await collectionSearchInput.selectSearchOption(CollectionPageSearchOption.TEXT, undefined);
    await homePage.collectionSearchInput.queryFor(queryString);
  });

  await test.step(`Verify URL, search input, and results category reflect full-text search`, async () => {
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

  await test.step(`Select TV captions option and search for "${queryString}"`, async () => {
    await collectionSearchInput.selectSearchOption(CollectionPageSearchOption.TV_CAPTIONS, undefined);
    await homePage.collectionSearchInput.queryFor(queryString);
  });

  await test.step(`Verify URL, search input, and results category reflect TV captions search`, async () => {
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

  await test.step(`Select radio transcripts option and search for "${queryString}"`, async () => {
    await collectionSearchInput.selectSearchOption(CollectionPageSearchOption.RADIO_TRANSCRIPTS, undefined);
    await homePage.collectionSearchInput.queryFor(queryString);
  });

  await test.step(`Verify URL, search input, and results category reflect radio search`, async () => {
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

  await test.step(`Select web option and search for "${queryString}"`, async () => {
    await collectionSearchInput.selectSearchOption(CollectionPageSearchOption.WEB, undefined);
    await homePage.collectionSearchInput.queryFor(queryString);
  });

  await test.step('Verify redirect to Wayback Machine with query preserved', async () => {
    await expect(page).toHaveURL(new RegExp(queryString));
    await expect(page).toHaveTitle(/Wayback Machine/);
    await expect(collectionBrowser.formInputWaybackPage).toBeVisible();
    await expect(collectionBrowser.formInputWaybackPage).toHaveValue(new RegExp(queryString));
  });
});

test('Use Wayback widget - Redirect web search', async ({ homePage }) => {
  const { page, collectionBrowser } = homePage;
  const queryString = 'canaries';

  await test.step(`Search for "${queryString}" using the Wayback widget`, async () => {
    await homePage.waybackSearchFor(queryString);
  });

  await test.step('Verify redirect to Wayback Machine with query preserved', async () => {
    await expect(page).toHaveURL(new RegExp(queryString));
    await expect(page).toHaveTitle(/Wayback Machine/);
    await expect(collectionBrowser.formInputWaybackPage).toBeVisible();
    await expect(collectionBrowser.formInputWaybackPage).toHaveValue(new RegExp(queryString));
  });
});

test('TopNav Functionality', async ({ homePage }) => {
  const { page, topNav } = homePage;

  await test.step('Verify 8 media type buttons are present', async () => {
    await page.waitForLoadState('domcontentloaded');
    const mediaButtonsCount = await topNav.mediaMenuButtons.count();
    expect(mediaButtonsCount).toEqual(8);
  });

  await test.step('Click "Web" button and verify Wayback search info box appears', async () => {
    await topNav.clickMediaButton('web');
    await expect(topNav.infoBox).toBeVisible();
    await expect(topNav.infoBox.locator('wayback-search')).toBeVisible();
    const focusedClass = await topNav.checkSubNavInfoBoxHasFocus('web');
    expect(focusedClass).toEqual('has-focused');
  });

  await test.step('Click "Texts" button and verify Open Library link appears', async () => {
    await topNav.clickMediaButton('texts');
    await expect(topNav.infoBox).toBeVisible();
    await expect(topNav.infoBox.locator('a:has-text("Open Library")')).toBeVisible();
    const focusedClass = await topNav.checkSubNavInfoBoxHasFocus('texts');
    expect(focusedClass).toEqual('has-focused');
  });

  await test.step('Click "Video" button and verify TV News link appears', async () => {
    await topNav.clickMediaButton('video');
    await expect(topNav.infoBox).toBeVisible();
    await expect(topNav.infoBox.locator('a:has-text("TV News")')).toBeVisible();
    const focusedClass = await topNav.checkSubNavInfoBoxHasFocus('video');
    expect(focusedClass).toEqual('has-focused');
  });

  await test.step('Click "Audio" button and verify Live Music Archive link appears', async () => {
    await topNav.clickMediaButton('audio');
    await expect(topNav.infoBox).toBeVisible();
    await expect(topNav.infoBox.locator('a:has-text("Live Music Archive")')).toBeVisible();
    const focusedClass = await topNav.checkSubNavInfoBoxHasFocus('audio');
    expect(focusedClass).toEqual('has-focused');
  });

  await test.step('Click "Software" button and verify Internet Arcade link appears', async () => {
    await topNav.clickMediaButton('software');
    await expect(topNav.infoBox).toBeVisible();
    await expect(topNav.infoBox.locator('a:has-text("Internet Arcade")')).toBeVisible();
    const focusedClass = await topNav.checkSubNavInfoBoxHasFocus('software');
    expect(focusedClass).toEqual('has-focused');
  });

  await test.step('Click "Images" button and verify Metropolitan Museum link appears', async () => {
    await topNav.clickMediaButton('images');
    await expect(topNav.infoBox).toBeVisible();
    await expect(topNav.infoBox.locator('a:has-text("Metropolitan Museum")')).toBeVisible();
    const focusedClass = await topNav.checkSubNavInfoBoxHasFocus('images');
    expect(focusedClass).toEqual('has-focused');
  });
});
