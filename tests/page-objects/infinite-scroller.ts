import { type Page, type Locator } from '@playwright/test';

import { SortBar } from './sort-bar';

import {
  DateMetadataLabel,
  SortOrder,
  SortFilter,
  ViewFacetMetadata,
  LayoutViewModeLocator,
} from '../models';

import {
  datesSorted,
  viewsSorted,
  parseViewCount,
  PAGE_WAIT_TIME,
} from '../utils';

export class InfiniteScroller {
  private static readonly SELECTORS = {
    CONTAINER: '#container',
    STATS_ROW: '#stats-row > li:nth-child(2)',
    DATES_LINE: '#dates-line > div.metadata',
    TILE_STATS: 'tile-stats',
    TILE_ICON: '#stats-row > li:nth-child(1) > tile-mediatype-icon > #icon',
    HOVERABLE: '#container.hoverable',
    IMAGE_BLOCK: 'image-block',
    TITLE: '#title > h3',
    ARTICLE: 'article',
  };

  readonly page: Page;
  readonly infiniteScroller: Locator;
  readonly infiniteScrollerSectionContainer: Locator;
  readonly displayStyleSelector: Locator;
  readonly displayStyleSelectorOptions: Locator;
  readonly firstItemTile: Locator;
  readonly gridDisplayMode: Locator;
  readonly listDisplayMode: Locator;
  readonly compactDisplayMode: Locator;

  readonly sortBar: SortBar;

  public constructor(page: Page) {
    this.page = page;

    this.sortBar = new SortBar(page);

    this.infiniteScroller = page.locator('infinite-scroller');
    this.infiniteScrollerSectionContainer =
      this.infiniteScroller.locator('#container');
    const sortBarSection = this.sortBar.sortFilterBar;
    this.displayStyleSelector = sortBarSection.locator(
      'div#display-style-selector',
    );
    this.displayStyleSelectorOptions =
      this.displayStyleSelector.locator('ul > li');
    this.firstItemTile = this.infiniteScrollerSectionContainer
      .locator('article')
      .first();

    this.gridDisplayMode = this.displayStyleSelector.getByTestId('grid-button');
    this.listDisplayMode =
      this.displayStyleSelector.getByTestId('list-detail-button');
    this.compactDisplayMode = this.displayStyleSelector.getByTestId(
      'list-compact-button',
    );
  }

  async clickViewMode(viewModeLocator: LayoutViewModeLocator) {
    const modeButton =
      this.displayStyleSelectorOptions.locator(viewModeLocator);
    await modeButton.waitFor({ state: 'visible' });
    await modeButton.click();
  }

  async waitForFirstItemTile() {
    const loadingTile = this.firstItemTile.locator(
      'collection-browser-loading-tile',
    );
    await loadingTile.waitFor({ state: 'hidden' });
    await this.firstItemTile
      .locator(InfiniteScroller.SELECTORS.HOVERABLE)
      .waitFor({ state: 'attached' });
    await this.firstItemTile
      .locator(InfiniteScroller.SELECTORS.IMAGE_BLOCK)
      .waitFor({ state: 'visible' });
  }

  async hoverToFirstItem() {
    const tileHoverPane = this.firstItemTile.locator('tile-hover-pane');
    await this.waitForFirstItemTile();
    await this.firstItemTile.hover({
      position: { x: 10, y: 20 },
      timeout: PAGE_WAIT_TIME,
    });
    await this.firstItemTile.dispatchEvent('mouseover', {
      timeout: PAGE_WAIT_TIME,
    });
    await tileHoverPane.waitFor({ state: 'attached' });
  }

  async firstTileTitleMatchesHoverPaneTitle() {
    const textFirstItemTile = await this.firstItemTile
      .locator('#title > h3')
      .first()
      .innerText();
    const textTileHoverPane = await this.firstItemTile
      .locator('tile-hover-pane #title > a')
      .innerText();
    return textFirstItemTile === textTileHoverPane;
  }

  async clickFirstItemTile() {
    await this.firstItemTile.click({ force: true });
  }

  async firstItemTileHrefPattern(): Promise<RegExp> {
    const itemLink = await this.firstItemTile
      .getByRole('link')
      .getAttribute('href');
    return new RegExp(`${itemLink}`);
  }

  async validateSortingResults(
    filter: SortFilter,
    order: SortOrder,
    displayItemCount: number,
  ) {
    // Validate view count sorting (tile view mode)
    if (filter === 'Weekly views' || filter === 'All-time views') {
      return this.validateViewSorting(filter, order, displayItemCount);
    }

    // Validate date sorting (list view mode)
    const dateFilters = [
      'Date published',
      'Date archived',
      'Date added',
      'Date reviewed',
    ];
    if (filter.includes('Date') && dateFilters.includes(filter)) {
      return this.validateDateSorting(filter, order, displayItemCount);
    }

    return false;
  }

  private async validateViewSorting(
    filter: SortFilter,
    order: SortOrder,
    displayItemCount: number,
  ): Promise<boolean> {
    const tileStatsViews = await this.getTileStatsViewCountTitles(
      displayItemCount,
    );
    const isAllViews = tileStatsViews.every(stat =>
      stat.includes(filter.toLowerCase()),
    );
    const arrViewCount: number[] = tileStatsViews.map(stat =>
      parseViewCount(stat),
    );
    const isSortedCorrectly = viewsSorted(order, arrViewCount);
    return isAllViews && isSortedCorrectly;
  }

  private async validateDateSorting(
    filter: SortFilter,
    order: SortOrder,
    displayItemCount: number,
  ): Promise<boolean> {
    const dateMetadataLabels = await this.getDateMetadataLabels(
      displayItemCount,
    );
    const dateSuffix = filter.split('Date ')[1];
    const checkFilterText =
      dateSuffix?.replace(/^./, str => str.toUpperCase()) ?? filter;
    const isDateFilter = dateMetadataLabels.every(
      date => date.filter === checkFilterText,
    );
    const isSortedCorrectly = datesSorted(order, dateMetadataLabels);
    return isDateFilter && isSortedCorrectly;
  }

  async validateIncludedFacetedResults(
    viewFacetMetadata: ViewFacetMetadata,
    facetLabels: string[],
    toInclude: boolean,
    displayItemCount: number,
  ) {
    const facetedResults = await this.getFacetedResultsByViewFacetGroup(
      viewFacetMetadata,
      displayItemCount,
    );
    if (facetedResults) {
      const isAllFacetedCorrectly = facetLabels.every(label => {
        return toInclude
          ? facetedResults.includes(label)
          : !facetedResults.includes(label);
      });
      return isAllFacetedCorrectly;
    }
    return false;
  }

  // Getters
  async getTileStatsViewCountTitles(
    displayItemCount: number,
  ): Promise<string[]> {
    const allItems = await this.getAllInfiniteScrollerArticleItems();
    const itemsToCheck = allItems.slice(0, displayItemCount);

    const titles: string[] = [];
    for (const item of itemsToCheck) {
      const itemTileCount = await item.locator('a > item-tile').count();
      if (itemTileCount === 1) {
        const tileStatsTitle = await item
          .locator(InfiniteScroller.SELECTORS.STATS_ROW)
          .getAttribute('title');
        if (tileStatsTitle) titles.push(tileStatsTitle);
      }
    }
    return titles;
  }

  async getDateMetadataLabels(
    displayItemCount: number,
  ): Promise<DateMetadataLabel[]> {
    const allItems = await this.getAllInfiniteScrollerArticleItems();
    const itemsToCheck = allItems.slice(0, displayItemCount);

    const dateLabels: DateMetadataLabel[] = [];
    for (const item of itemsToCheck) {
      const dateSpanLabel = await item
        .locator(InfiniteScroller.SELECTORS.DATES_LINE)
        .last()
        .innerText();

      if (dateSpanLabel) {
        const [filter, date] = dateSpanLabel.split(': ');
        dateLabels.push({ filter, date });
      }
    }
    return dateLabels;
  }

  async getItemTileIconTitle(item: Locator, arrItem: string[]) {
    const tileIconTitle = await this.getTileIconTitleAttr(item);
    if (tileIconTitle) arrItem.push(tileIconTitle);
  }

  async getCollectionItemTileTitle(item: Locator, arrItem: string[]) {
    await item.scrollIntoViewIfNeeded();
    const tileDispatcher = item.locator('tile-dispatcher');
    await tileDispatcher.waitFor({ state: 'visible', timeout: 60000 });
    await tileDispatcher
      .locator('a.tile-link')
      .waitFor({ state: 'visible', timeout: 60000 });
    const collectionTileCount = await tileDispatcher
      .locator('collection-tile')
      .count();
    const itemTileCount = await tileDispatcher.locator('item-tile').count();
    if (collectionTileCount === 1 && itemTileCount === 0) {
      arrItem.push('collection');
    } else if (collectionTileCount === 0 && itemTileCount === 1) {
      const tileIconTitle = await this.getTileIconTitleAttr(item);
      if (tileIconTitle) arrItem.push(tileIconTitle);
    }
  }

  async getDateMetadataText(item: Locator, arrItem: DateMetadataLabel[]) {
    await item.scrollIntoViewIfNeeded();
    await item
      .locator(InfiniteScroller.SELECTORS.CONTAINER)
      .waitFor({ state: 'visible', timeout: 60000 });
    const dateSpanLabel = await item
      .locator(InfiniteScroller.SELECTORS.DATES_LINE)
      .last()
      .innerText();
    if (dateSpanLabel) {
      const [filter, date] = dateSpanLabel.split(': ');
      arrItem.push({ filter, date });
    }
  }

  async getTileIconTitleAttr(item: Locator) {
    await item.scrollIntoViewIfNeeded();
    const tileStats = item.locator(InfiniteScroller.SELECTORS.TILE_STATS);
    try {
      await tileStats.waitFor({ state: 'attached', timeout: 10000 });
    } catch {
      return null;
    }
    return item
      .locator(InfiniteScroller.SELECTORS.TILE_ICON)
      .getAttribute('title');
  }

  async getAllInfiniteScrollerArticleItems() {
    const container = this.infiniteScroller.locator(
      `section${InfiniteScroller.SELECTORS.CONTAINER}`,
    );
    await container.waitFor({ state: 'visible', timeout: 60000 });
    return container.locator(InfiniteScroller.SELECTORS.ARTICLE).all();
  }

  async validateTitlesStartWithLetter(
    letter: string,
    displayItemCount: number,
  ): Promise<boolean> {
    await this.waitForResultsReady();
    const allItems = await this.getAllInfiniteScrollerArticleItems();
    const itemsToCheck = allItems.slice(0, displayItemCount);

    for (const item of itemsToCheck) {
      const titleEl = item.locator(InfiniteScroller.SELECTORS.TITLE);
      if ((await titleEl.count()) > 0) {
        const rawTitle = (await titleEl.first().innerText()).trim();
        // Strip leading non-letter characters (e.g. "!", "\"", digits) before checking,
        // since archive.org groups titles by first meaningful letter
        const title = rawTitle.replace(/^[^a-zA-Z]*/, '');
        if (!title.toUpperCase().startsWith(letter.toUpperCase())) {
          return false;
        }
      }
    }
    return true;
  }

  private async waitForResultsReady() {
    const loadingTile = this.firstItemTile.locator(
      'collection-browser-loading-tile',
    );
    await loadingTile.waitFor({ state: 'hidden' });
    await this.firstItemTile.waitFor({ state: 'visible' });
  }

  async getFacetedResultsByViewFacetGroup(
    viewFacetMetadata: ViewFacetMetadata,
    displayItemCount: number,
  ): Promise<string[] | null> {
    await this.waitForResultsReady();
    const allItems = await this.getAllInfiniteScrollerArticleItems();
    const itemsToCheck = allItems.slice(0, displayItemCount);

    const arrTitles: string[] = [];
    const arrDates: DateMetadataLabel[] = [];

    for (const item of itemsToCheck) {
      switch (viewFacetMetadata) {
        case 'tile-collection-icon-title':
          await this.getCollectionItemTileTitle(item, arrTitles);
          break;
        case 'tile-icon-title':
          await this.getItemTileIconTitle(item, arrTitles);
          break;
        case 'list-date':
          await this.getDateMetadataText(item, arrDates);
          break;
        default:
          break;
      }
    }

    return arrDates.length !== 0
      ? arrDates.map(label => label.date)
      : arrTitles;
  }
}
