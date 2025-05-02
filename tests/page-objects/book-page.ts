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
    this.brFooter = this.bookReader.brFooter;
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

  async assertBookPageChange(isPublic: boolean) {
    // Flip to next page 2 times, so we can go previous if at front cover
    await this.flipToNextPage();
    await this.flipToNextPage();

    // Check if we're not showing the same image in both leaves (pages)
    const onLoadBrState = this.brContainer.nth(0);
    await onLoadBrState.waitFor({ state: 'attached' });
    const initialImages = onLoadBrState.locator('img');
    const origImg1Src = await initialImages.nth(0).getAttribute('src');
    const origImg2Src = await initialImages.nth(-1).getAttribute('src');

    await this.flipToPrevPage();

    const nextBrState = this.brContainer.nth(0);
    await nextBrState.waitFor({ state: 'attached' });
    const prevImages = nextBrState.locator('img');
    const prevImg1Src = await prevImages.nth(0).getAttribute('src');
    const prevImg2Src = await prevImages.nth(-1).getAttribute('src');

    // we aren't showing the same image in both leaves
    expect(origImg1Src).not.toEqual(origImg2Src);

    // Check if the new pages are different from the original pages
    expect(prevImg1Src).not.toEqual(origImg1Src);
    expect(prevImg1Src).not.toEqual(origImg2Src);
    // If the book is public, check if the second new page is different from the first new page
    // But if the book is print-disabled, check if the second new page is the same as the first new page
    if (isPublic) {
      expect(prevImg2Src).not.toEqual(origImg1Src);
    } else {
      console.log('initialImages: ', initialImages);
      console.log('prevImages: ', prevImages);
      console.log('origImg1Src: ', origImg1Src);
      expect(prevImg2Src).toEqual(origImg1Src); 
    }
    
    // Check if the new pages are different from each other
    expect(prevImg2Src).not.toEqual(origImg2Src);
    expect(prevImg1Src).not.toEqual(prevImg2Src);
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

}
