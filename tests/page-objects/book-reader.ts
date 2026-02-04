import { type Page, Locator, expect } from '@playwright/test';

export class BookReader {
  readonly page: Page;

  readonly bookReaderShell: Locator;
  readonly brContainer: Locator;

  readonly brLeft: Locator;
  readonly brRight: Locator;
  readonly brFlipNext: Locator;
  readonly brFlipPrev: Locator;

  readonly brZoomIn: Locator;
  readonly brZoomOut: Locator;

  readonly brOnePage: Locator;
  readonly brTwoPage: Locator;
  readonly brThumb: Locator;
  readonly brFullScreen: Locator;
  readonly brReadAloud: Locator;

  readonly brOneUpView: Locator;
  readonly brTwoUpView: Locator;

  public constructor(page: Page) {
    this.page = page;

    this.bookReaderShell = this.page.locator('#BookReader');
    this.brContainer = this.bookReaderShell.locator('.BRcontainer');

    this.brFlipPrev = this.bookReaderShell.getByRole('button', { name: 'Flip left' });
    this.brFlipNext = this.bookReaderShell.getByRole('button', { name: 'Flip right' });
    this.brOnePage = this.bookReaderShell.getByRole('button', { name: 'One-page view' });
    this.brTwoPage = this.bookReaderShell.getByRole('button', { name: 'Two-page view' });
    this.brThumb = this.bookReaderShell.getByRole('button', { name: 'Thumbnail view' });
    this.brReadAloud = this.bookReaderShell.getByRole('button', { name: 'Read this book aloud' });
    this.brZoomIn = this.bookReaderShell.getByRole('button', { name: 'Zoom in' });
    this.brZoomOut = this.bookReaderShell.getByRole('button', { name: 'Zoom out' });
    this.brFullScreen = this.bookReaderShell.getByRole('button', { name: 'Go fullscreen' });

    this.brOneUpView = this.brContainer.locator('br-mode-1up');
    this.brTwoUpView = this.brContainer.locator('br-mode-2up');
  }

  async getBrContainerPageLoadedCount() {
    return (await this.brContainer.locator('.BRpagecontainer').all()).length;
  }

  async getVisiblePageCount() {
    return (await this.brContainer.locator('.BRpage-visible').all()).length;
  }

  async clickOneUpMode() {
    await this.brOnePage.click();
    await this.brOneUpView.waitFor({ state: 'visible' });
    await this.brContainer.locator('.BRpageloading').first().waitFor({ state: 'hidden' });
  }

  async clickTwoUpMode(){
    await this.brTwoPage.click();
    await this.brTwoUpView.waitFor({ state: 'visible' });
    await this.brContainer.locator('.BRpageloading').first().waitFor({ state: 'hidden' });
  }

  async clickThumbnailMode(){
    await this.brThumb.click();
    await this.brOneUpView.waitFor({ state: 'hidden' });
    await this.brTwoUpView.waitFor({ state: 'hidden' });
    await this.brContainer.locator('.BRpageloading').first().waitFor({ state: 'hidden' });
  }
}
