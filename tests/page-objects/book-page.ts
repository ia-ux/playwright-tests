import { type Page, type Locator } from '@playwright/test';

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
    this.brPageVisible = this.brShell.locator(
      '.BRpagecontainer.BRpage-visible',
    );
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
    return hash
      ? hash.includes('/mode/' + mode)
      : href.includes('/mode/' + mode);
  }

  async getPageHash() {
    return this.page.evaluate(() => window.location.hash);
  }

  async getPageUrl() {
    return this.page.evaluate(() => window.location.href);
  }

  async getBRShellPageBoundingBox() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.locator('#theatre-ia').waitFor({ state: 'visible' });
    await this.brShell.waitFor({ state: 'visible' });
    await this.brPageVisible.waitFor({ state: 'visible' });
    return this.brShell.boundingBox();
  }

  /** Bounding box safe to call in fullscreen — skips #theatre-ia wait which may be hidden. */
  async getBRShellBoundingBox() {
    await this.brShell.waitFor({ state: 'visible' });
    return this.brShell.boundingBox();
  }

  async getBRContainerPageBoundingBox() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.locator('#theatre-ia').waitFor({ state: 'visible' });
    await this.brContainer.waitFor({ state: 'visible' });
    await this.brPageVisible.waitFor({ state: 'visible' });
    return this.brContainer.boundingBox();
  }

  async flipToNextPage() {
    await this.bookReader.brFlipNext.waitFor({ state: 'visible' });
    await this.bookReader.brFlipNext.click();
    await this.waitForFlipComplete();
  }

  async flipToPrevPage() {
    await this.bookReader.brFlipPrev.waitFor({ state: 'visible' });
    await this.bookReader.brFlipPrev.click();
    await this.waitForFlipComplete();
  }

  private async waitForFlipComplete() {
    // Wait for the flip animation to finish.
    // In 2up mode both L and R pages carry .BRpage-exiting at once, which triggers Playwright's
    // strict-mode violation on locator.waitFor. Use waitForFunction to poll the DOM directly.
    await this.page.waitForFunction(
      () => !document.querySelector('#BookReader .BRcontainer .BRpage-exiting'),
      { timeout: PAGE_WAIT_TIME },
    );
    // Protected books keep .BRpageloading permanently — skip that wait for those pages.
    // For public books, wait for images to finish loading.
    await this.brContainer
      .locator('.BRpageloading:not(.protected)')
      .first()
      .waitFor({ state: 'hidden', timeout: PAGE_WAIT_TIME });
  }

  async getPageImages() {
    const onLoadBrState = this.brContainer.nth(0);
    await onLoadBrState.waitFor({ state: 'visible' });
    // Protected books keep .BRpageloading permanently — only wait for non-protected loading pages.
    await onLoadBrState
      .locator('.BRpageloading:not(.protected)')
      .first()
      .waitFor({ state: 'hidden', timeout: 60000 });
    return onLoadBrState.locator('img');
  }

  async getBRPageBoundingBoxDimension(dimension: BoxDimension) {
    await this.brPageVisible.waitFor({ state: 'visible' });
    const brPageBoundingBox = await this.brPageVisible.boundingBox();
    return brPageBoundingBox ? brPageBoundingBox[dimension] : undefined;
  }

  async getPageWidth() {
    return this.page.evaluate(() => window.innerWidth);
  }

  async getPageHeight() {
    return this.page.evaluate(() => window.innerHeight);
  }

  async clickZoomIn() {
    await this.bookReader.brZoomIn.click();
  }

  async clickZoomOut() {
    await this.bookReader.brZoomOut.click();
  }

  async clickFullScreen() {
    await this.bookReader.brFullScreen.click();
    await this.page
      .locator('#BookReader.fullscreenActive')
      .waitFor({ state: 'attached' });
  }

  async clickExitFullScreen() {
    await this.bookReader.brExitFullScreen.click();
    await this.page
      .locator('#BookReader:not(.fullscreenActive)')
      .waitFor({ state: 'attached' });
  }
}
