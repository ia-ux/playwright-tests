import { type Page, type Locator } from '@playwright/test';

import { SortBar } from './sort-bar';

import {
  DateMetadataLabel,
  SortOrder,
  SortFilter,
  ViewFacetMetadata,
  LayoutViewModeLocator,
} from '../models';

import { datesSorted, viewsSorted, parseViewCount } from '../utils';
import { CollectionSearchInput } from './collection-search-input';

export class InfiniteScroller {
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
  readonly collectionSearchInput: CollectionSearchInput;

  public constructor(page: Page) {
    this.page = page;

    this.collectionSearchInput = new CollectionSearchInput(page);
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
    this.listDisplayMode = this.displayStyleSelector.getByTestId('list-detail-button');
    this.compactDisplayMode = this.displayStyleSelector.getByTestId('list-compact-button')
  }

  async clickViewMode(viewModeLocator: LayoutViewModeLocator) {
    await this.displayStyleSelectorOptions.locator(viewModeLocator).click();
  }

  async waitForFirstItemTile() {
    const loadingTile = this.firstItemTile.locator('collection-browser-loading-tile');
    await loadingTile.waitFor({ state: 'hidden' });
    await this.firstItemTile.locator('#container.hoverable').waitFor({ state: 'attached' });
    await this.firstItemTile.locator('image-block').waitFor({ state: 'visible' });
  }

  async hoverToFirstItem() {
    const tileHoverPane = this.firstItemTile.locator('tile-hover-pane');
    await this.waitForFirstItemTile();
    await this.firstItemTile.hover({ position: { x: 10, y: 20 }, timeout: 5000 });
    await this.firstItemTile.dispatchEvent('mouseover', { timeout: 5000 });
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
    await this.firstItemTile.click();
  }

  async firstItemTileHrefPattern(): Promise<RegExp> {
    const itemLink = await this.firstItemTile
      .locator('a')
      .first()
      .getAttribute('href');
    return new RegExp(`${itemLink}`);
  }

  // TODO: per sort filter and sort order + view mode???
  async validateSortingResults(
    filter: SortFilter,
    order: SortOrder,
    displayItemCount: Number,
  ) {
    // This test is only applicable in tile view mode for "views" filters
    if (filter === 'Weekly views' || filter === 'All-time views') {
      const tileStatsViews = await this.getTileStatsViewCountTitles(
        displayItemCount,
      );
      const isAllViews = tileStatsViews.every(stat =>
        stat.includes(filter.toLowerCase()),
      );

      const arrViewCount: number[] = tileStatsViews.map(stat => parseViewCount(stat));
      const isSortedCorrectly = viewsSorted(order, arrViewCount);

      return isAllViews && isSortedCorrectly;
    }

    // This test is only applicable in list view mode for "Date" filters
    if (
      filter === 'Date published' ||
      filter === 'Date archived' ||
      filter === 'Date added' ||
      filter === 'Date reviewed'
    ) {
      const dateMetadataLabels = await this.getDateMetadataLabels(
        displayItemCount,
      );
      // Parse date sort filter to check list of date labels from page item results
      // => Published, Archived, Added, Reviewed
      const checkFilterText = filter
        .split('Date ')[1]
        .replace(/^./, str => str.toUpperCase());
      const isDateFilter = dateMetadataLabels.every(
        date => date.filter === checkFilterText,
      );
      const isSortedCorrectly = datesSorted(order, dateMetadataLabels);

      return isDateFilter && isSortedCorrectly;
    }
  }

  async validateIncludedFacetedResults(
    viewFacetMetadata: ViewFacetMetadata,
    facetLabels: string[],
    toInclude: boolean,
    displayItemCount: Number,
  ) {
    const facetedResults = await this.getFacetedResultsByViewFacetGroup(
      viewFacetMetadata,
      displayItemCount,
    );
    if (facetedResults) {
      const isAllFacettedCorrectly = facetLabels.some(label => {
        return toInclude
          ? facetedResults.includes(label)
          : !facetedResults.includes(label);
      });
      return isAllFacettedCorrectly;
    }
    return false;
  }

  // Getters
  async getTileStatsViewCountTitles(
    displayItemCount: Number,
  ): Promise<string[]> {
    const arrTileStatsTitle: string[] = [];
    const allItems = await this.getAllInfiniteScrollerArticleItems();

    let index = 0;
    while (index !== displayItemCount) {
      const itemTileCount = await allItems[index]
        .locator('a > item-tile')
        .count();

      if (itemTileCount === 1) {
        // Get view count from tile-stats row
        const tileStatsTitle = await allItems[index]
          .locator('#stats-row > li:nth-child(2)')
          .getAttribute('title');
        if (tileStatsTitle) arrTileStatsTitle.push(tileStatsTitle);
      }

      index++;
    }

    return arrTileStatsTitle;
  }

  async getDateMetadataLabels(
    displayItemCount: Number,
  ): Promise<DateMetadataLabel[]> {
    const arrDateLine: DateMetadataLabel[] = [];
    const allItems = await this.getAllInfiniteScrollerArticleItems();

    let index = 0;
    while (index !== displayItemCount) {
      // Load items and get tileStats views based on displayItemCount
      // There can be 2 date metadata in a row if filter is either Date archived, Date reviewed, or Date added
      // eg. Published: Nov 15, 2023 - Archived: Jan 19, 2024
      // We always want the last one since it will correspond to the current "sort by" field
      const dateSpanLabel = await allItems[index]
        .locator('#dates-line > div.metadata')
        .last()
        .innerText();

      if (dateSpanLabel) {
        // Need to split date filter and date format value: Published: 2150 or Published: Nov 15, 2023
        // Ideal format: { filter: 'Published', date: '2150' }
        const strSplitColonSpace = dateSpanLabel.split(': ');
        const objDateLine = {
          filter: strSplitColonSpace[0],
          date: strSplitColonSpace[1],
        };
        arrDateLine.push(objDateLine);
      }

      index++;
    }
    return arrDateLine;
  }

  async getItemTileIconTitle(item: Locator, arrItem: string[]) {
    const tileIconTitle = await this.getTileIconTitleAttr(item);
    if (tileIconTitle) arrItem.push(tileIconTitle);
  }

  async getCollectionItemTileTitle(item: Locator, arrItem: string[]) {
    await item.locator('tile-dispatcher').waitFor({ state: 'visible' });
    await item.locator('a').waitFor({ state: 'visible' });
    const collectionTileCount = await item
      .locator('a > collection-tile')
      .count();
    const itemTileCount = await item.locator('a > item-tile').count();
    if (collectionTileCount === 1 && itemTileCount === 0) {
      arrItem.push('collection');
    } else if (collectionTileCount === 0 && itemTileCount === 1) {
      const tileIconTitle = await this.getTileIconTitleAttr(item);
      if (tileIconTitle) arrItem.push(tileIconTitle);
    }
  }

  async getDateMetadataText(item: Locator, arrItem: DateMetadataLabel[]) {
    await item.locator('#container').waitFor({ state: 'visible' });
    const dateSpanLabel = await item
      .locator('#dates-line > div.metadata')
      .last()
      .innerText();
    if (dateSpanLabel) {
      // Need to split date filter and date format value: Published: 2150 or Published: Nov 15, 2023
      // Ideal format: { filter: 'Published', date: '2150' }
      const strSplitColonSpace = dateSpanLabel.split(': ');
      const objDateLine = {
        filter: strSplitColonSpace[0],
        date: strSplitColonSpace[1],
      };
      arrItem.push(objDateLine);
    }
  }

  async getTileIconTitleAttr(item: Locator) {
    await this.page.waitForTimeout(1000);
    await item.locator('tile-stats').waitFor({ state: 'visible' });
    // Get mediatype-icon title attr from tile-stats row element
    return await item
      .locator('#stats-row > li:nth-child(1) > tile-mediatype-icon > #icon')
      .getAttribute('title');
  }

  async getAllInfiniteScrollerArticleItems() {
    const container = this.infiniteScroller.locator('section#container');
    await container.waitFor({ state: 'visible' });
    return await container.locator('article').all();
  }

  async getFacetedResultsByViewFacetGroup(
    viewFacetMetadata: ViewFacetMetadata,
    displayItemCount: Number,
  ): Promise<string[] | null> {
    let arrIdentifiers: string[];
    const arrTitles: string[] = [];
    const arrDates: DateMetadataLabel[] = [];
    const allItems = await this.getAllInfiniteScrollerArticleItems();

    let index = 0;
    while (index !== displayItemCount) {
      switch (viewFacetMetadata) {
        case 'tile-collection-icon-title':
          await this.getCollectionItemTileTitle(allItems[index], arrTitles);
          break;

        case 'tile-icon-title':
          await this.getItemTileIconTitle(allItems[index], arrTitles);
          break;

        case 'list-date':
          await this.getDateMetadataText(allItems[index], arrDates);
          break;

        default: // something else ---- test is broken
          break;
      }

      index++;
    }

    arrIdentifiers =
      arrDates.length !== 0 ? arrDates.map(label => label.date) : arrTitles;

    return arrIdentifiers;
  }

}
