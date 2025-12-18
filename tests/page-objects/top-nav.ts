import { type Page, type Locator, expect } from '@playwright/test';

export class TopNav {
  readonly mediaTypeTexts = ['web', 'texts', 'video', 'audio', 'software', 'images'];

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
    this.mediaMenuButtons = this.mediaMenu.locator('.menu-group').locator('media-button');

    this.mediaSlider = this.page.locator('media-slider');
    this.infoBox = this.mediaSlider.locator('.information-menu').locator('.info-box');
  }

  async getMediaSliderState() {
    return await this.mediaSlider.getAttribute('tabindex');;
  }

  async checkSubNavInfoBoxHasFocus (mediaType: string) {
    const subNav = await this.infoBox.locator('media-subnav').all();

    await expect(this.infoBox).toBeVisible();
    expect(subNav.length).toEqual(7);

    for (const nav of subNav) {
      const navMenuText = await nav.getAttribute('menu');
      if(navMenuText === mediaType) {
        expect(await nav.getAttribute('class')).toEqual('has-focused')
      }
    }
  }

  async clickMediaButton (mediaType: string) {
    const mediaButton = this.iaTopNav.getByRole('link', { name: `${mediaType} icon` });
    await mediaButton.click();

    const mediaSliderTabIndex = await this.getMediaSliderState();
    if (mediaSliderTabIndex === '1') { // infoBox is open
      await expect(this.infoBox).toBeVisible();
      await this.checkSubNavInfoBoxHasFocus(mediaType); 
    } else {
      await expect(this.infoBox).not.toBeVisible();
    }
  }
}