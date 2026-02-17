import { type Page, type Locator } from '@playwright/test';

import { SortOrder, SortFilter, SortFilterURL } from '../models';

export class CollectionBrowser {
  readonly page: Page;
  readonly emptyPlaceholder: Locator;
  readonly emptyPlaceholderTitleText: Locator;
  readonly formInputWaybackPage: Locator;
  readonly tileCompactListHeaderDate: Locator;
  readonly resultSection: Locator;
  readonly resultsCategory: Locator;

  public constructor(page: Page) {
    this.page = page;

    this.emptyPlaceholder = page.locator('empty-placeholder');
    this.emptyPlaceholderTitleText = page.locator('.search-empty-message');

    this.formInputWaybackPage = page.locator(
      'input.rbt-input-main.form-control.rbt-input',
    );

    this.tileCompactListHeaderDate = page.locator(
      'tile-list-compact-header #list-line-header #date'
    )

    this.resultSection = page.locator('section#results > h2.results-section-heading');
    this.resultsCategory = page.locator('span.results-category');
  }

  getCompactModeLineDateFilterText(filter: SortFilter) {
    return filter.split('Date ')[1].replace(/^./, (str: string) => str.toUpperCase());
  }

  getURLParamsWithSortFilter(filter: SortFilter, order: SortOrder) {
    const sortFilterURL =
      order === 'descending'
        ? `-${SortFilterURL[filter]}`
        : SortFilterURL[filter];
    return new RegExp(`sort=${sortFilterURL}`);
  }
}
