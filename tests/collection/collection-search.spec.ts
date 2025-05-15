import { test, expect } from '../fixtures';
import { SearchOption } from '../models';

test('Collection search metadata', async ({ collectionPage }) => {
  const { collectionFacets, collectionSearchInput, infiniteScroller } = collectionPage;
  await test.step(`Select "Search metadata"`, async () => {
    await collectionSearchInput.clickSearchInputOption(
      SearchOption.METADATA,
      'collection',
    );
  });

  await test.step(`Search for "radio" in the search input text field`, async () => {
    await collectionSearchInput.queryFor('radio');
  });

  await test.step(`Results are displayed in display area - validate first item displayed`, async () => {
    await expect(collectionFacets.resultsTotal).toBeVisible();
    await infiniteScroller.displaysFirstResult();
  });
});

test('Collection search text contents and clear filters', async ({
  collectionPage,
}) => {
  const { collectionFacets, collectionSearchInput, infiniteScroller } = collectionPage;
  await test.step(`Select "Search text contents"`, async () => {
    await collectionSearchInput.clickSearchInputOption(
      SearchOption.TEXT,
      'collection',
    );
  });

  await test.step(`Search for "dragnet" in the search input text field`, async () => {
    await collectionSearchInput.queryFor('dragnet');
  });

  await test.step(`Results are displayed in display area - validate first item displayed`, async () => {
    await expect(collectionFacets.resultsTotal).toBeVisible();
    await infiniteScroller.displaysFirstResult();
  });

  await test.step(`Click "X" button in search input and validate search input text is cleared`, async () => {
    const { collectionSearchInput } = collectionPage;
    await collectionSearchInput.clickClearSearchInput();
    await expect(collectionSearchInput.btnClearInput).not.toBeVisible();
    expect(await collectionSearchInput.formInputSearchPage.inputValue()).toBe('');
  });
});

test('No results page displays when no results', async ({ collectionPage }) => {
  await test.step(`Select "Search metadata"`, async () => {
    await collectionPage.collectionSearchInput.clickSearchInputOption(
      SearchOption.METADATA, 'collection',
    );
  });

  await test.step(`Search for "catsshfksahfkjhfkjsdhfkiewhkdsfahkjhfkjsda" and validate that the "No results" placeholder appears in place of the display area`, async () => {
    const {collectionBrowser } = collectionPage;
    await collectionPage.collectionSearchInput.queryFor(
      'catsshfksahfkjhfkjsdhfkiewhkdsfahkjhfkjsda',
    );
    await expect(collectionBrowser.emptyPlaceholder).toBeVisible();
    await expect(collectionBrowser.emptyPlaceholderTitleText).toBeVisible();
  });
});
