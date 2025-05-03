import { type Page, Locator, expect } from '@playwright/test';

import { BookPageViewMode } from '../models';
import { BookReader } from './book-reader';

const PAGE_FLIP_WAIT_TIME = 2000;

export class BookPage {
  readonly page: Page;

  readonly brShell: Locator;
  readonly brContainer: Locator;
  readonly brFooter: Locator;

  readonly bookReader: BookReader;

  public constructor(page: Page) {
    this.page = page;

    this.bookReader = new BookReader(this.page);

    this.brShell = this.bookReader.bookReaderShell;
    this.brContainer = this.bookReader.brContainer;
  }

  async goToPage(url: string) {
    await this.page.goto(url);
  }

  // Check URL page parameter in # and path
  async isPageInUrl() {
    const hash = await this.page.evaluate(() => window.location.hash);
    const href = await this.page.evaluate(() => window.location.href);
    if (hash) {
      return hash.indexOf('#page/') > -1;
    } else {
      return href.indexOf('/page/') > -1;
    }
  }

  // Check URL mode parameter in # and path
  async isModeInUrl(mode: BookPageViewMode) {
    const hash = await this.page.evaluate(() => window.location.hash);
    const href = await this.page.evaluate(() => window.location.href);
    if (hash) {
      return hash.indexOf('/mode/' + mode) > -1;
    } else {
      return href.indexOf('/mode/' + mode) > -1;
    }
  }

  async getPageHash() {
    return await this.page.evaluate(() => window.location.hash);
  }

  async getPageUrl() {
    return await this.page.evaluate(() => window.location.href);
  }

  async getBRShellPageBoundingBox() {
    await this.brShell.waitFor({ state: 'visible'});
    return await this.brShell.boundingBox();
  }

  async getBRContainerPageBoundingBox() {
    await this.brContainer.waitFor({ state: 'visible' });
    return await this.brContainer.boundingBox(); 
  }

  async flipToNextPage() {
    await this.bookReader.brFlipNext.waitFor({ state: 'visible' });
    await this.bookReader.brFlipNext.click();
    await this.page.waitForTimeout(PAGE_FLIP_WAIT_TIME);
  }

  async flipToPrevPage() {
    await this.bookReader.brFlipPrev.waitFor({ state: 'visible' });
    await this.bookReader.brFlipPrev.click();
    await this.page.waitForTimeout(PAGE_FLIP_WAIT_TIME);
  }

  async getPageImages() {
    const onLoadBrState = this.brContainer.nth(0);
    await onLoadBrState.waitFor({ state: 'attached' });
    return onLoadBrState.locator('img');
  }
  
}
