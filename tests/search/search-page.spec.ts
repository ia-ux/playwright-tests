import { test, expect } from '../../tests/fixtures';

import { ResultsCategory, SearchPageSearchOption } from '../../tests/models';

test(`"Begin searching" page displays prior to searching`, async ({ searchPage }) => {
  await test.step(`Check if the empty page placeholder is displayed`, async () => {
    await expect(searchPage.collectionBrowser.emptyPlaceholder).toBeVisible();
  });
});

test('Do simple metadata search', async ({ searchPage }) => {
  await test.step(`Select search option for metadata search and search for cats`, async () => {
    await searchPage.collectionSearchInput.queryFor('cats');
  });

  await test.step(`Searching and search result count should be displayed`, async () => {
    expect(await searchPage.collectionBrowser.resultSection.isVisible());
  });
});

test('Do simple text contents search', async ({ searchPage }) => {
  const { collectionBrowser, collectionSearchInput, page } = searchPage;
  await test.step(`Select search option for text search and search for dogs`, async () => {
    await collectionSearchInput.queryFor('dogs');
    await collectionSearchInput.clickSearchInputOption(undefined, SearchPageSearchOption.TEXTS);
  });

  await test.step(`Searching and search result count should be displayed`, async () => {
    expect(await collectionBrowser.resultSection.isVisible());
    const resultCategoryText = await collectionBrowser.resultsCategory.innerText();
    expect(resultCategoryText).toContain(ResultsCategory.TEXTS);
    const urlPattern = new RegExp(`tab=${SearchPageSearchOption.TEXTS}`);
    expect(page.url()).toMatch(urlPattern);
  });
});

test('Do simple TV search', async ({ searchPage }) => {
  const { collectionBrowser, collectionSearchInput, page } = searchPage;
  const queryString = 'iguanas';
  await test.step(`Select search option for text search and search for iguanas`, async () => {
    await collectionSearchInput.queryFor(queryString);
    await collectionSearchInput.clickSearchInputOption(undefined, SearchPageSearchOption.TV);
  });

  await test.step(`Check TV results are displayed`, async () => {
    expect(await collectionBrowser.resultSection.isVisible());
    const resultCategoryText = await collectionBrowser.resultsCategory.innerText();
    expect(resultCategoryText).toContain(ResultsCategory.TV);
    const urlPattern = new RegExp(`tab=${SearchPageSearchOption.TV}`);
    expect(page.url()).toMatch(urlPattern);
  });
});

test('Do simple radio search', async ({ searchPage }) => {
  const { collectionBrowser, collectionSearchInput, page } = searchPage;
  const queryString = 'rabbits';
  await test.step(`Select search option for text search and search for rabbits`, async () => {
    await collectionSearchInput.queryFor(queryString);
    await collectionSearchInput.clickSearchInputOption(undefined, SearchPageSearchOption.RADIO);
  });

  await test.step(`Check Radio results are displayed`, async () => {
    expect(await collectionBrowser.resultSection.isVisible());
    const resultCategoryText = await collectionBrowser.resultsCategory.innerText();
    expect(resultCategoryText).toContain(ResultsCategory.RADIO);
    const urlPattern = new RegExp(`tab=${SearchPageSearchOption.RADIO}`);
    expect(page.url()).toMatch(urlPattern);
  });
});

test('Do simple web search', async ({ searchPage }) => {
  const { collectionBrowser, collectionSearchInput, page } = searchPage;
  const queryString = 'parrots';
  await test.step(`Select search option for text search and search for parrots`, async () => {
    await collectionSearchInput.queryFor(queryString);
    await collectionSearchInput.clickSearchInputOption(undefined, SearchPageSearchOption.WEB);
  });

  await test.step(`Check Wayback search page is displayed`, async () => {
    // Note: The page is redirected to Wayback Machine search page
    await page.waitForURL(/web/);
    expect(await page.title()).toContain('Wayback Machine');
    await expect(collectionBrowser.formInputWaybackPage).toBeVisible();
    expect(await collectionBrowser.formInputWaybackPage.inputValue()).toContain(queryString);
  });
});

test('No results page displays when no results', async ({ searchPage }) => {
  await test.step(`Search for a query that we expect will return no results at all and validate the empty page placeholder is displayed`, async () => {
    await searchPage.collectionSearchInput.queryFor(
      'catsshfksahfkjhfkjsdhfkiewhkdsfahkjhfkjsda',
    );
    await expect(searchPage.collectionBrowser.emptyPlaceholderTitleText).toBeVisible();
  });
});
