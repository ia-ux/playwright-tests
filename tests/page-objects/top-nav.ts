import { type Page, type Locator, expect } from '@playwright/test';

export class TopNav {
  readonly page: Page;

  readonly iaTopNav: Locator;
  readonly mediaMenuButtons: Locator;
  
  private navHome: Locator;
  
  private mediaSlider: Locator;
  private infoBox: Locator;

  private mediaTypeTexts = ['web', 'texts', 'video', 'audio', 'software', 'images'];

  public constructor(page: Page) {
    this.page = page;

    this.iaTopNav = this.page.locator('ia-topnav');
    this.mediaMenuButtons = this.iaTopNav.locator('media-menu');

    this.navHome = this.iaTopNav.locator('primary-nav nav > div.branding');

    this.mediaSlider = this.page.locator('media-slider');
    this.infoBox = this.mediaSlider.locator('.information-menu').locator('.info-box');
  }

  async clickMediaButtons() {
    const mediaButtons = await this.iaTopNav.locator('media-menu').locator('media-button').all();
    expect(mediaButtons.length).toEqual(8);

    for (let [i, text] of this.mediaTypeTexts.entries()) {
      const elemAttr = await mediaButtons[i].getAttribute('data-mediatype');
      expect(elemAttr).toEqual(text);
    }

    await this.clickMediaButton('web');
    await expect(this.infoBox.locator('wayback-search')).toBeVisible();

    await this.clickMediaButton('texts');
    await expect(this.infoBox.locator('a:has-text("Open Library")')).toBeVisible();

    await this.clickMediaButton('video');
    await expect(this.infoBox.locator('a:has-text("TV News")')).toBeVisible();

    await this.clickMediaButton('audio');
    await expect(this.infoBox.locator('a:has-text("Live Music Archive")')).toBeVisible();

    await this.clickMediaButton('software');
    await expect(this.infoBox.locator('a:has-text("Internet Arcade")')).toBeVisible();

    await this.clickMediaButton('images');
    await expect(this.infoBox.locator('a:has-text("Metropolitan Museum")')).toBeVisible();

    await this.clickMediaButton('web');
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