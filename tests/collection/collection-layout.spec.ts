import { test, expect } from '../fixtures';

import { LayoutViewModeLocator, SearchOption } from '../models';

test('Tile, List, and Compact layout buttons change layout', async ({
  collectionPage,
}) => {
  const { infiniteScroller } = collectionPage;
  await test.step('Display List View', async () => {
    await infiniteScroller.clickViewMode(LayoutViewModeLocator.LIST);
    await expect(
      infiniteScroller.displayStyleSelector.getByTestId('list-detail-button'),
    ).toHaveClass('active');
    await expect(collectionPage.infiniteScroller.infiniteScroller).toHaveClass(/list-detail/);
  });

  await test.step('Display List Compact View', async () => {
    await collectionPage.infiniteScroller.clickViewMode(LayoutViewModeLocator.COMPACT);
    await expect(
      infiniteScroller.displayStyleSelector.getByTestId('list-compact-button'),
    ).toHaveClass('active');
    await expect(infiniteScroller.infiniteScroller).toHaveClass(/list-compact/);
  });

  await test.step('Display Tile View', async () => {
    await infiniteScroller.clickViewMode(LayoutViewModeLocator.TILE);
    await expect(
      infiniteScroller.displayStyleSelector.getByTestId('grid-button'),
    ).toHaveClass('active');
    await expect(infiniteScroller.infiniteScroller).toHaveClass(/grid/);
  });
});

test.fixme('Tile hover pane appears', async ({ collectionPage }) => {
  await test.step('Hover first item tile and check for title text inside tile-hover-pane and item-tile', async () => {
    await collectionPage.infiniteScroller.hoverToFirstItem();
    await collectionPage.infiniteScroller.assertTileHoverPaneTitleIsSameWithItemTile();
  });
});

test(`Clicking on an item tile takes you to the item`, async ({ collectionPage }) => {
  await test.step('Click first item result and check if it directs to details page', async () => {
    await collectionPage.infiniteScroller.clickFirstResultAndCheckRedirectToDetailsPage();
  });
});

test(`Sort by All-time views in Tile view`, async ({ collectionPage }) => {
  const { collectionBrowser, infiniteScroller, sortBar } = collectionPage
  const sortOrder = 'descending';
  const oppositeSortText = 'ascending';
  await test.step('Switch to tile view mode', async () => {
    await infiniteScroller.clickViewMode(LayoutViewModeLocator.TILE);
  });

  await test.step(`Sort by All-time views - ${sortOrder} order`, async () => {
    await sortBar.applySortFilter('All-time views');
    await sortBar.clickSortDirection(sortOrder);
    await expect(sortBar.srSortText).toContainText(`Change to ${oppositeSortText} sort`);
  });

  await test.step('Check the first 10 results if sort filters were applied', async () => {
    await infiniteScroller.validateSortingResults('All-time views', sortOrder, 10);
    await collectionBrowser.validateURLParamsWithSortFilter('All-time views', sortOrder);
  });
});

test(`Sort by Date published in List view`, async ({ collectionPage }) => {
  const { collectionBrowser, infiniteScroller, sortBar } = collectionPage
  const sortOrder = 'ascending';
  const oppositeSortText = 'descending';
  await test.step('Switch to list view mode', async () => {
    await infiniteScroller.clickViewMode(LayoutViewModeLocator.LIST);
  });

  await test.step(`Sort by Date published - ${sortOrder} order`, async () => {
    await sortBar.applySortFilter('Date published');
    await sortBar.clickSortDirection(sortOrder);
    await expect(sortBar.srSortText).toContainText(`Change to ${oppositeSortText} sort`);
  });

  await test.step('Check the first 10 results if sort filters were applied', async () => {
    await infiniteScroller.validateSortingResults('Date published', sortOrder, 10);
    await collectionBrowser.validateURLParamsWithSortFilter('Date published', sortOrder);
  });
});

test(`Sort by Date archived (ascending) in Compact view`, async ({ collectionPage }) => {
  const { collectionBrowser, sortBar } = collectionPage
  const sortOrder = 'ascending';
  await test.step('Switch to compact view mode', async () => {
    await collectionPage.infiniteScroller.clickViewMode(LayoutViewModeLocator.COMPACT);
  });

  await test.step(`Sort by Date archived - ${sortOrder} order`, async () => {
    await sortBar.applySortFilter('Date archived');
    await sortBar.clickSortDirection(sortOrder);
  });

  await test.step('Check list column headers for sort filter', async () => {
    await collectionBrowser.validateCompactViewModeListLineDateHeaders('Date archived');
    await collectionBrowser.validateURLParamsWithSortFilter('Date archived', sortOrder);
  });
});

test.beforeEach(async ({ collectionPage }) => {
  test.info().annotations.push({
    type: 'Test',
    description: 'Do collection metadata search every each test',
  });

  await test.step(`Select "Search metadata" and do a metadata search for "radio"`, async () => {
    await collectionPage.collectionSearchInput.clickSearchInputOption(
      SearchOption.METADATA, 'collection',
    );
    await collectionPage.collectionSearchInput.queryFor('radio');
  });
});
