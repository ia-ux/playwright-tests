import { type Page, type Locator, expect } from '@playwright/test';
import { ChannelSelector } from '../models';

export class IAMusicTheater {
  readonly page: Page;

  readonly musicTheater: Locator;
  readonly channelSelector: Locator;
  readonly iauxPhotoViewer: Locator;
  readonly playAv: Locator;
  readonly seeMoreCta: Locator;

  readonly musicPlayerPlayButton: Locator;
  readonly musicPlayerPauseButton: Locator;

  readonly theatreIa: Locator;
  readonly jsWebamp: Locator;
  readonly mainWindow: Locator;
  readonly playlistWindow: Locator;
  readonly equalizerWindow: Locator;

  public constructor(page: Page) {
    this.page = page;

    const iauxMusicTheater = this.page.locator('ia-music-theater');
    this.musicTheater = iauxMusicTheater.locator('#music-theater');
    this.channelSelector = this.musicTheater.locator('channel-selector');

    this.iauxPhotoViewer = this.musicTheater.locator('iaux-photo-viewer');
    this.playAv = this.page.locator('play-av');
    this.seeMoreCta = this.iauxPhotoViewer.locator('#see-more-cta');

    this.musicPlayerPlayButton = this.page.getByRole('button', {
      name: 'Play',
      exact: true,
    });

    this.musicPlayerPauseButton = this.page.getByRole('button', {
      name: 'Pause',
      exact: true,
    });

    this.theatreIa = this.page.locator('#theatre-ia');
    this.jsWebamp = this.page.locator('#js-webamp');
    this.mainWindow = this.page.locator('#main-window');
    this.playlistWindow = this.page.locator('#playlist-window');
    this.equalizerWindow = this.page.locator('#equalizer-window');
  }

  async placeholderImageDisplay(noPlaceholder: boolean) {
    if (noPlaceholder) {
      await expect(this.iauxPhotoViewer).toHaveAttribute('noimageavailable');
      await expect(
        this.iauxPhotoViewer.locator('iamusic-noimage'),
      ).toBeVisible();
    } else {
      await expect(this.iauxPhotoViewer).not.toHaveAttribute(
        'noimageavailable',
      );
      await expect(this.seeMoreCta).toBeVisible();
    }
  }

  async selectChannelSelector(channel: ChannelSelector) {
    const channelSelectorRow = await this.channelSelector
      .locator('#radio')
      .getByRole('listitem');
    const channelSelectorRowCount = await this.channelSelector
      .locator('#radio')
      .getByRole('listitem')
      .count();

    // just Player | Webamp
    if (channelSelectorRowCount === 2) {
      if (channel === 'Player') await channelSelectorRow.nth(0).click();
      if (channel === 'Webamp') await channelSelectorRow.nth(1).click();
    }

    await this.page.waitForLoadState('domcontentloaded');
  }

  async webAmpDisplayFromChannelSelector(fromChannelSelector: boolean) {
    // Wait for multiple load states to ensure everything is ready in headless mode
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');

    if (fromChannelSelector) {
      const urlPatternCheck = new RegExp(`webamp=default`);
      await this.page.waitForURL(urlPatternCheck);
    }

    // Wait for webamp container to be attached and visible
    await this.theatreIa.waitFor({ state: 'attached' });
    await this.theatreIa.waitFor({ state: 'visible', timeout: 10000 });

    // Wait for webamp iframes/elements to be ready
    await this.jsWebamp.waitFor({ state: 'attached' });
    await this.jsWebamp.waitFor({ state: 'visible', timeout: 10000 });

    // Check playlist and equalizer windows
    await this.mainWindow.waitFor({ state: 'attached' });
    await this.mainWindow.waitFor({ state: 'visible', timeout: 10000 });

    await this.playlistWindow.waitFor({ state: 'attached' });
    await this.playlistWindow.waitFor({ state: 'visible', timeout: 10000 });

    await this.equalizerWindow.waitFor({ state: 'attached' });
    await this.equalizerWindow.waitFor({ state: 'visible', timeout: 10000 });

    return {
      theatreIaVisible: await this.theatreIa.isVisible(),
      jsWebampVisible: await this.jsWebamp.isVisible(),
      mainWindowVisible: await this.mainWindow.isVisible(),
      playlistWindowVisible: await this.playlistWindow.isVisible(),
      equalizerWindowVisible: await this.equalizerWindow.isVisible(),
    };
  }

  // TODO
  async verifyWebampSkin() {}
}
