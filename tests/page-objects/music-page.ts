import { type Page, type Locator } from '@playwright/test';

import { BookReader } from './book-reader';
import { DetailsPage } from './details-page';
import { IAMusicTheater } from './music-theater';

export class MusicPage {
  readonly page: Page;

  readonly channelSelectorRows: Locator;
  readonly trackList: Locator;
  readonly waveformImage: Locator;
  readonly jwPlayerPlaying: Locator;
  readonly jwPlayerPaused: Locator;
  readonly elapsedTimer: Locator;
  readonly closePhotoViewer: Locator;

  readonly bookReader: BookReader;
  readonly detailsPage: DetailsPage;
  readonly iaMusicTheater: IAMusicTheater;

  public constructor(page: Page) {
    this.page = page;

    this.bookReader = new BookReader(page);
    this.detailsPage = new DetailsPage(page);
    this.iaMusicTheater = new IAMusicTheater(page);

    this.channelSelectorRows = this.iaMusicTheater.channelSelector
      .locator('#radio')
      .getByRole('listitem');
    this.trackList = this.iaMusicTheater.playAv.locator('div.playlist > div.track-list');
    this.waveformImage = this.iaMusicTheater.playAv.locator('#waveformer-wrap > img');
    this.jwPlayerPlaying = page.locator('.jwplayer.jw-reset.jw-state-playing');
    this.jwPlayerPaused = page.locator('.jwplayer.jw-reset.jw-state-paused');
    this.elapsedTimer = page.locator('.jwplayer').locator(
      'div.jw-icon.jw-icon-inline.jw-text.jw-reset.jw-text-elapsed',
    );
    this.closePhotoViewer = this.iaMusicTheater.iauxPhotoViewer.locator('#close-photo-viewer');
  }

  async gotoPage(uri: string) {
    await this.page.goto(`/details/${uri}`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForURL(`/details/${uri}`);
    await this.page.waitForLoadState('domcontentloaded');
  }


  async getBookReaderClass() {
    return await this.bookReader.bookReaderShell.getAttribute('class');
  }

  async getElapsedTimeValue() {
    return await this.elapsedTimer.innerText();
  }
}
