import { test, expect } from '../fixtures';

import { LayoutViewModeLocator } from '../models';


test.beforeEach(async ({ searchPage }) => {
  test.info().annotations.push({
    type: 'Test',
    description: 'Perform search query before each test',
  });

  await test.step(`Select "Search metadata" and do a metadata search for "cats"`, async () => {
    await searchPage.collectionSearchInput.queryFor('cats');
  });
});

test('Tile, List, and Compact layout buttons change layout', async ({ searchPage }) => {
  const { infiniteScroller } = searchPage;
  await test.step('Display List View', async () => {
    await infiniteScroller.clickViewMode(LayoutViewModeLocator.LIST);
    await expect(infiniteScroller.listDisplayMode).toHaveClass('active');
    await expect(infiniteScroller.infiniteScroller).toHaveClass('list-detail');
  });

  await test.step('Display List Compact View', async () => {
    await infiniteScroller.clickViewMode(LayoutViewModeLocator.COMPACT);
    await expect(infiniteScroller.compactDisplayMode).toHaveClass('active');
    await expect(infiniteScroller.infiniteScroller).toHaveClass('list-compact');
  });

  await test.step('Display Tile View', async () => {
    await infiniteScroller.clickViewMode(LayoutViewModeLocator.TILE);
    await expect(infiniteScroller.gridDisplayMode).toHaveClass('active');
    await expect(infiniteScroller.infiniteScroller).toHaveClass('grid');
  });
});

test('Tile hover pane appears', async ({ searchPage }) => {
  test.slow();
  const { infiniteScroller } = searchPage;
  await test.step('Hover first item tile and check for title text inside tile-hover-pane and item-tile', async () => {
    await infiniteScroller.hoverToFirstItem();
    const isSameText = await infiniteScroller.firstTileTitleMatchesHoverPaneTitle();
    expect(isSameText).toBeTruthy();
  });
});

test(`Clicking on an item tile takes you to the item`, async ({ searchPage }) => {
  test.slow();
  const { infiniteScroller, page } = searchPage;
  await test.step('Click first item result and check if it directs to details page', async () => {
    expect(await infiniteScroller.firstItemTile.count()).toBe(1);
    const urlPattern = await infiniteScroller.firstItemTileHrefPattern();
    await infiniteScroller.clickFirstItemTile();
    await expect(page).toHaveURL(urlPattern);
  });
});

test('Sort by All-time views in Tile view', async ({ searchPage }) => {
  const { collectionBrowser, infiniteScroller, sortBar } = searchPage;
  const sortOrder = 'descending';
  const oppositeSortText = 'ascending';
  const sortFilter = 'All-time views';

  await test.step('Switch to tile view mode', async () => {
    await searchPage.infiniteScroller.clickViewMode(LayoutViewModeLocator.TILE);
  });

  await test.step(`Sort by ${sortFilter} - ${sortOrder} order`, async () => {
    await searchPage.sortBar.applySortFilter(sortFilter);
    await searchPage.sortBar.clickSortDirection(sortOrder);
    await expect(sortBar.srSortText).toContainText(`Change to ${oppositeSortText} sort`);
  });

  await test.step('Check the first 10 results if sort filters were applied', async () => {
    const isSortedCorrectly = await infiniteScroller.validateSortingResults(sortFilter, sortOrder, 10);
    expect(isSortedCorrectly).toBeTruthy();
    const urlPattern = collectionBrowser.getURLParamsWithSortFilter(sortFilter, sortOrder);
    await expect(collectionBrowser.page).toHaveURL(urlPattern);
  });
});

test(`Sort by Date published in List view`, async ({ searchPage }) => {
  test.slow();
  const { collectionBrowser, infiniteScroller, sortBar } = searchPage;
  const sortOrder = 'ascending';
  const oppositeSortText = 'descending';
  const sortFilter = 'Date published';

  await test.step('Switch to list view mode', async () => {
    await infiniteScroller.clickViewMode(LayoutViewModeLocator.LIST);
  });

  await test.step(`Sort by ${sortFilter} - ${sortOrder} order`, async () => {
    await sortBar.applySortFilter(sortFilter);
    await sortBar.clickSortDirection(sortOrder);
    await expect(sortBar.srSortText).toContainText(`Change to ${oppositeSortText} sort`);
  });

  await test.step('Check the first 10 results if sort filters were applied', async () => {
    const isSortedCorrectly = await infiniteScroller.validateSortingResults(sortFilter, sortOrder, 5);
    expect(isSortedCorrectly).toBeTruthy();
  });

  await test.step('Check for url params with sort filter date published', async () => {
    const urlPattern = collectionBrowser.getURLParamsWithSortFilter(sortFilter, sortOrder);
    await expect(collectionBrowser.page).toHaveURL(urlPattern);
  });
});

test(`Sort by Date archived (ascending) in Compact view`, async ({ searchPage }) => {
  const { collectionBrowser, sortBar } = searchPage;
  const sortOrder = 'ascending';
  const sortFilter = 'Date archived';

  await test.step('Switch to compact view mode', async () => {
    await searchPage.infiniteScroller.clickViewMode(LayoutViewModeLocator.COMPACT);
  });

  await test.step(`Sort by ${sortFilter} - ${sortOrder} order`, async () => {
    await sortBar.applySortFilter(sortFilter);
    await sortBar.clickSortDirection(sortOrder);
  });

  await test.step(`Check list column headers for sort filter "${sortFilter}"`, async () => {
    const filterText = collectionBrowser.getCompactModeLineDateFilterText(sortFilter);
    expect(await collectionBrowser.tileCompactListHeaderDate.innerText()).toContain(filterText);
  });

  await test.step(`Check URL parameter as ${sortFilter} ${sortOrder}`, async () => {
    const urlPattern = collectionBrowser.getURLParamsWithSortFilter(sortFilter, sortOrder);
    await expect(collectionBrowser.page).toHaveURL(urlPattern);
  })
});
