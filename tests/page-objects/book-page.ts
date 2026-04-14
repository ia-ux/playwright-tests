import { type Page, Locator } from '@playwright/test';

import { BookReader } from './book-reader';

import { BookPageViewMode, BoxDimension } from '../models';
import { PAGE_WAIT_TIME } from '../utils';
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
    const { hash, href } = await this.page.evaluate(() => ({
      hash: window.location.hash,
      href: window.location.href,
    }));
    return hash ? hash.includes('#page/') : href.includes('/page/');
  }

  // Check URL mode parameter in # and path
  async isModeInUrl(mode: BookPageViewMode) {
    const { hash, href } = await this.page.evaluate(() => ({
      hash: window.location.hash,
      href: window.location.href,
    }));
    return hash ? hash.includes('/mode/' + mode) : href.includes('/mode/' + mode);
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

  /** Bounding box safe to call in fullscreen — skips #theatre-ia wait which may be hidden. */
  async getBRShellBoundingBox() {
    await this.brShell.waitFor({ state: 'visible' });
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
    await onLoadBrState.waitFor({ state: 'visible' });
    await onLoadBrState.locator('.BRpageloading').first().waitFor({ state: 'hidden', timeout: 60000 });
    return onLoadBrState.locator('img');
  }

  async getBRPageBoundingBoxDimension(dimension: BoxDimension) {
    await this.brPageVisible.waitFor({ state: 'visible' });
    const brPageBoundingBox = await this.brPageVisible.boundingBox();
    return brPageBoundingBox ? brPageBoundingBox[dimension] : undefined;
  }

  async getPageWidth() {
    return await this.page.evaluate(() => window.innerWidth);
  }

  async getPageHeight() {
    return await this.page.evaluate(() => window.innerHeight);
  }

  async clickZoomIn() {
    await this.bookReader.brZoomIn.click();
  }

  async clickZoomOut() {
    await this.bookReader.brZoomOut.click();
  }

  async clickFullScreen() {
    await this.bookReader.brFullScreen.click();
    await this.page.locator('#BookReader.fullscreenActive').waitFor({ state: 'attached' });
  }

  async clickExitFullScreen() {
    await this.bookReader.brExitFullScreen.click();
    await this.page.locator('#BookReader:not(.fullscreenActive)').waitFor({ state: 'attached' });
  }
}
