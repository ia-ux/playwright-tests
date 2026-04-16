import { type Page, type Locator } from '@playwright/test';

export class TopNav {
  readonly mediaTypeTexts = [
    'web',
    'texts',
    'video',
    'audio',
    'software',
    'images',
  ];

  readonly page: Page;

  readonly iaTopNav: Locator;
  readonly mediaMenu: Locator;
  readonly mediaMenuButtons: Locator;
  readonly navHome: Locator;
  readonly mediaSlider: Locator;
  readonly infoBox: Locator;

  public constructor(page: Page) {
    this.page = page;

    this.iaTopNav = this.page.locator('ia-topnav');
    this.navHome = this.iaTopNav.locator('primary-nav nav > div.branding');
    this.mediaMenu = this.iaTopNav.locator('media-menu');
    this.mediaMenuButtons = this.mediaMenu
      .locator('.menu-group')
      .locator('media-button');

    this.mediaSlider = this.page.locator('media-slider');
    this.infoBox = this.mediaSlider
      .locator('.information-menu')
      .locator('.info-box');
  }

  async getMediaSliderState() {
    return await this.mediaSlider.getAttribute('tabindex');
  }

  async isInfoBoxVisible() {
    return await this.infoBox.isVisible();
  }

  async checkSubNavInfoBoxHasFocus(mediaType: string) {
    const subNav = await this.infoBox.locator('media-subnav').all();

    for (const nav of subNav) {
      const navMenuText = await nav.getAttribute('menu');
      if (navMenuText === mediaType) {
        return await nav.getAttribute('class');
      }
    }
  }

  async clickMediaButton(mediaType: string) {
    const mediaButton = this.iaTopNav.getByRole('link', {
      name: `${mediaType} icon`,
    });
    await mediaButton.click();
  }
}
