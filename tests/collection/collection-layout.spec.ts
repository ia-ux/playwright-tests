import { test, expect } from '../fixtures';

import { LayoutViewModeLocator, CollectionPageSearchOption } from '../models';

test.beforeEach(async ({ collectionPage }) => {
  const { collectionSearchInput } = collectionPage;
  test.info().annotations.push({
    type: 'Test',
    description: 'Perform collection metadata search before each test',
  });

  await test.step(`Select "Search metadata" and do a metadata search for "radio"`, async () => {
    await collectionSearchInput.selectSearchOption(
      CollectionPageSearchOption.METADATA,
    );
    await collectionSearchInput.queryFor('radio');
  });
});

test('Tile, List, and Compact layout buttons change layout', async ({
  collectionPage,
}) => {
  const { infiniteScroller } = collectionPage;
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

test('Tile hover pane appears', async ({ collectionPage }) => {
  test.slow();
  const { infiniteScroller } = collectionPage;
  await test.step('Hover first item tile and check for title text inside tile-hover-pane and item-tile', async () => {
    await infiniteScroller.hoverToFirstItem();
    const isSameText =
      await infiniteScroller.firstTileTitleMatchesHoverPaneTitle();
    expect(isSameText).toBeTruthy();
  });
});

test(`Clicking on an item tile takes you to the item`, async ({
  collectionPage,
}) => {
  const { infiniteScroller, page } = collectionPage;
  await test.step('Click first item result and check if it directs to details page', async () => {
    expect(await infiniteScroller.firstItemTile.count()).toBe(1);
    const urlPattern = await infiniteScroller.firstItemTileHrefPattern();
    await infiniteScroller.clickFirstItemTile();
    await expect(page).toHaveURL(urlPattern);
  });
});

test(`Sort by All-time views in Tile view`, async ({ collectionPage }) => {
  const { collectionBrowser, infiniteScroller, sortBar } = collectionPage;
  const sortOrder = 'descending';
  const oppositeSortText = 'ascending';
  const sortFilter = 'All-time views';

  await test.step('Switch to tile view mode', async () => {
    await infiniteScroller.clickViewMode(LayoutViewModeLocator.TILE);
  });

  await test.step(`Sort by ${sortFilter} - ${sortOrder} order`, async () => {
    await sortBar.applySortFilter(sortFilter);
    await sortBar.clickSortDirection(sortOrder);
    await expect(sortBar.srSortText).toContainText(
      `Change to ${oppositeSortText} sort`,
    );
  });

  await test.step('Check the first 10 results if sort filters were applied', async () => {
    const isSortedCorrectly = await infiniteScroller.validateSortingResults(
      sortFilter,
      sortOrder,
      10,
    );
    expect(isSortedCorrectly).toBeTruthy();
    const urlPattern = collectionBrowser.getURLParamsWithSortFilter(
      sortFilter,
      sortOrder,
    );
    await expect(collectionBrowser.page).toHaveURL(urlPattern);
  });
});

test(`Sort by Date published in List view`, async ({ collectionPage }) => {
  const { collectionBrowser, infiniteScroller, sortBar } = collectionPage;
  const sortOrder = 'ascending';
  const sortFilter = 'Date published';

  await test.step('Switch to list view mode', async () => {
    await infiniteScroller.clickViewMode(LayoutViewModeLocator.LIST);
  });

  await test.step(`Sort by ${sortFilter} - ${sortOrder} order`, async () => {
    await sortBar.applySortFilter(sortFilter);
    const expectedText = await sortBar.clickSortDirection(sortOrder);
    if (expectedText) {
      await expect(sortBar.srSortText).toContainText(
        `Change to ${expectedText} sort`,
      );
    }
  });

  await test.step('Check the first 10 results if sort filters were applied', async () => {
    const isSortedCorrectly = await infiniteScroller.validateSortingResults(
      sortFilter,
      sortOrder,
      10,
    );
    expect(isSortedCorrectly).toBeTruthy();
  });

  await test.step('Check for url params with sort filter date published', async () => {
    const urlPattern = collectionBrowser.getURLParamsWithSortFilter(
      sortFilter,
      sortOrder,
    );
    await expect(collectionBrowser.page).toHaveURL(urlPattern);
  });
});

test(`Sort by Date archived (ascending) in Compact view`, async ({
  collectionPage,
}) => {
  const { collectionBrowser, sortBar } = collectionPage;
  const sortOrder = 'ascending';
  const sortFilter = 'Date archived';

  await test.step('Switch to compact view mode', async () => {
    await collectionPage.infiniteScroller.clickViewMode(
      LayoutViewModeLocator.COMPACT,
    );
  });

  await test.step(`Sort by ${sortFilter} - ${sortOrder} order`, async () => {
    await sortBar.applySortFilter(sortFilter);
    await sortBar.clickSortDirection(sortOrder);
  });

  await test.step(`Check list column headers for sort filter "${sortFilter}"`, async () => {
    const filterText =
      collectionBrowser.getCompactModeLineDateFilterText(sortFilter);
    expect(
      await collectionBrowser.tileCompactListHeaderDate.innerText(),
    ).toContain(filterText);
  });

  await test.step(`Check URL parameter as ${sortFilter} ${sortOrder}`, async () => {
    const urlPattern = collectionBrowser.getURLParamsWithSortFilter(
      sortFilter,
      sortOrder,
    );
    await expect(collectionBrowser.page).toHaveURL(urlPattern);
  });
});
