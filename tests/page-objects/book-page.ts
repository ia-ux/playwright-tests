import { type Page, Locator } from '@playwright/test';

import { BookPageViewMode } from '../models';
import { BookReader } from './book-reader';

const PAGE_WAIT_TIME = 1500;

export class BookPage {
  readonly page: Page;

  readonly brShell: Locator;
  readonly brContainer: Locator;
  readonly brPageVisible: Locator;

  readonly bookReader: BookReader;

  public constructor(page: Page) {
    this.page = page;

    this.bookReader = new BookReader(this.page);

    this.brShell = this.bookReader.bookReaderShell;
    this.brContainer = this.bookReader.brContainer;
    this.brPageVisible = this.brShell.locator('.BRpagecontainer.BRpage-visible');
  }

  async goToPage(url: string) {
    await this.page.goto(url, { waitUntil: 'commit' });
    await this.page.waitForLoadState('domcontentloaded');
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
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.locator('#theatre-ia').waitFor({ state: 'visible'});
    await this.brShell.waitFor({ state: 'visible'});
    await this.brPageVisible.waitFor({ state: 'visible' });
    return await this.brShell.boundingBox();
  }

  async getBRContainerPageBoundingBox() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.locator('#theatre-ia').waitFor({ state: 'visible' });
    await this.brContainer.waitFor({ state: 'visible' });
    await this.brPageVisible.waitFor({ state: 'visible' });
    return await this.brContainer.boundingBox(); 
  }

  async flipToNextPage() {
    await this.bookReader.brFlipNext.waitFor({ state: 'visible' });
    await this.bookReader.brFlipNext.click();
    await this.page.waitForTimeout(PAGE_WAIT_TIME);
  }

  async flipToPrevPage() {
    await this.bookReader.brFlipPrev.waitFor({ state: 'visible' });
    await this.bookReader.brFlipPrev.click();
    await this.page.waitForTimeout(PAGE_WAIT_TIME);
  }

  async getPageImages() {
    const onLoadBrState = this.brContainer.nth(0);
    await onLoadBrState.waitFor({ state: 'attached' });
    return onLoadBrState.locator('img');
  }

  async getBRPageBoundingBoxDimension(dimension: string) {
    await this.brPageVisible.waitFor({ state: 'visible' });
    const brPageBoundingBox = await this.brPageVisible.boundingBox();
    return brPageBoundingBox?.[dimension];
  }

  async getPageWidth() {
    return await this.page.evaluate(() => window.innerWidth);
  }

  async clickZoomIn() {
    await this.bookReader.brZoomIn.click();
    await this.page.waitForTimeout(PAGE_WAIT_TIME);
  }

  async clickZoomOut() {
    await this.bookReader.brZoomOut.click();
    await this.page.waitForTimeout(PAGE_WAIT_TIME);
  }

  async clickFullScreen() {
    await this.bookReader.brFullScreen.click();
    await this.page.waitForTimeout(PAGE_WAIT_TIME);
  }
}
