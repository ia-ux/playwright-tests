import { type Page, type Locator } from '@playwright/test';

import { BookReader } from './book-reader';
import { IAMusicTheater } from './music-theater';

export class MusicPage {
  readonly page: Page;

  readonly channelSelectorRows: Locator;
  readonly trackList: Locator;
  readonly waveformImage: Locator;
  readonly jwPlayerPlaying: Locator;
  readonly jwPlayerPaused: Locator;
  readonly jwPlayerIdle: Locator;
  readonly elapsedTimer: Locator;
  readonly closePhotoViewer: Locator;

  readonly bookReader: BookReader;
  readonly iaMusicTheater: IAMusicTheater;

  public constructor(page: Page) {
    this.page = page;

    this.bookReader = new BookReader(page);
    this.iaMusicTheater = new IAMusicTheater(page);

    this.channelSelectorRows = this.iaMusicTheater.channelSelector
      .locator('#radio')
      .getByRole('listitem');
    this.trackList = this.iaMusicTheater.playAv.locator(
      'div.playlist > div.track-list',
    );
    this.waveformImage = this.iaMusicTheater.playAv.locator(
      '#waveformer-wrap > img',
    );
    this.jwPlayerPlaying = page.locator('.jwplayer.jw-reset.jw-state-playing');
    this.jwPlayerPaused = page.locator('.jwplayer.jw-reset.jw-state-paused');
    this.jwPlayerIdle = page.locator('.jwplayer.jw-reset.jw-state-idle');
    this.elapsedTimer = page
      .locator('.jwplayer')
      .locator('div.jw-icon.jw-icon-inline.jw-text.jw-reset.jw-text-elapsed');
    this.closePhotoViewer = this.iaMusicTheater.iauxPhotoViewer.locator(
      '#close-photo-viewer',
    );
  }

  async gotoPage(uri: string) {
    await this.page.goto(`/details/${uri}`, { waitUntil: 'domcontentloaded' });
  }

  async waitForPlayerReady() {
    // Play button is only rendered once JW player is initialized and ready
    await this.iaMusicTheater.musicPlayerPlayButton.waitFor({
      state: 'visible',
      timeout: 60000,
    });
    // Wait for JW Player to reach idle state — media config loaded, ready to play
    await this.jwPlayerIdle.waitFor({ state: 'visible', timeout: 60000 });
    // Allow JW Player to complete initial audio pre-fetch requests so
    // the buffer is warm before play is clicked
    await this.page
      .waitForLoadState('networkidle', { timeout: 15000 })
      .catch(() => {});
  }

  async getBookReaderClass() {
    return this.bookReader.bookReaderShell.getAttribute('class');
  }

  async getElapsedTimeValue() {
    return this.elapsedTimer.innerText();
  }
}
