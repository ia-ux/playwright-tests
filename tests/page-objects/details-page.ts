import { type Page, type Locator } from '@playwright/test';

import { BookReader } from './book-reader';
import { LendingBar } from './lending-bar';
import { IAMusicTheater } from './music-theater';

export class DetailsPage {
  readonly page: Page;

  readonly iaTheater: Locator;
  readonly iaCarousel: Locator;

  readonly tvNewsArchive: Locator;
  readonly tvSearchTitle: Locator;

  readonly formInputRadioPage: Locator;
  readonly formInputTVPage: Locator;
  readonly formInputWaybackPage: Locator;

  readonly bookReader: BookReader;
  readonly lendingBar: LendingBar;
  readonly iaMusicTheater: IAMusicTheater;

  public constructor(page: Page) {
    this.page = page;

    this.iaTheater = this.page.locator('#theatre-ia');
    this.iaCarousel = this.iaTheater.locator('#ia-carousel');

    this.tvNewsArchive = this.page.getByRole('link', {
      name: 'TV News Archive',
      exact: true,
    });
    this.tvSearchTitle = this.page.getByRole('heading', { name: 'Search' });

    this.formInputRadioPage = page.locator('input#text-input');
    this.formInputTVPage = page.locator(
      '#searchform > div > div:nth-child(1) > input.js-search-bar',
    );
    this.formInputWaybackPage = page.locator(
      'input.rbt-input-main.form-control.rbt-input',
    );

    this.bookReader = new BookReader(page);
    this.lendingBar = new LendingBar(page);
    this.iaMusicTheater = new IAMusicTheater(page);
  }

  async gotoPage(uri: string) {
    await this.page.goto(`/details/${uri}`, { waitUntil: 'domcontentloaded' });
  }

  async assertPageElements() {
    return {
      metadataElements: await this.verifyPageMetadataElements(),
      actionButtons: await this.verifyPageActionButtons(),
      termsOfService: await this.page.locator('.terms-of-service').isVisible(),
    };
  }

  async verifyPageMetadataElements() {
    const divInfoTopDetails = this.page
      .locator('div.container.info-top')
      .locator('div.thats-left.item-details-metadata');

    const leftIconVisible = await divInfoTopDetails
      .locator('.left-icon')
      .isVisible();
    const itemTitleVisible = await divInfoTopDetails
      .locator('.item-title')
      .isVisible();
    const metadataDefinitionVisible = await divInfoTopDetails
      .locator('.metadata-definition')
      .isVisible();

    const divItemDetails = this.page
      .locator(
        '#maincontent > div.container.container-ia.width-max.relative-row-wrap',
      )
      .last();

    const statsVisible = await divItemDetails
      .locator('.boxy.item-stats-summary')
      .isVisible();
    const downloadVisible = await divItemDetails
      .locator('.boxy.item-download-options')
      .isVisible();
    const collectionListVisible = await divItemDetails
      .locator('.boxy.white-bg.collection-list')
      .isVisible();
    const uploadInfoVisible = await divItemDetails
      .locator('.boxy.white-bg.item-upload-info')
      .isVisible();
    const reviewsVisible = await divItemDetails.locator('#reviews').isVisible();

    return {
      leftIconVisible,
      itemTitleVisible,
      metadataDefinitionVisible,
      statsVisible,
      downloadVisible,
      collectionListVisible,
      uploadInfoVisible,
      reviewsVisible,
    };
  }

  async verifyPageActionButtons() {
    const favoriteVisible = await this.page
      .locator('div.topinblock.favorite-btn')
      .isVisible();
    const shareVisible = await this.page
      .locator('div.topinblock.share-button')
      .isVisible();
    const flagVisible = await this.page
      .locator('div.topinblock.flag-button')
      .isVisible();

    return { favoriteVisible, shareVisible, flagVisible };
  }

  async container3dDisplay() {
    const locator = this.page.locator('#container3D');
    await locator.waitFor({ state: 'visible' });
    return locator.isVisible();
  }

  async bookreaderDisplay() {
    await this.bookReader.bookReaderShell.waitFor({ state: 'visible' });
    return true;
  }

  async musicTheaterDisplay() {
    await this.iaMusicTheater.iauxPhotoViewer.waitFor({ state: 'visible' });
    return {
      musicTheaterVisible: await this.iaMusicTheater.musicTheater.isVisible(),
      seeMoreCtaVisible: await this.iaMusicTheater.seeMoreCta.isVisible(),
    };
  }

  async dataTheaterDisplay() {
    return {
      noPreviewVisible: await this.iaTheater.locator('.no-preview').isVisible(),
      messageVisible: await this.iaTheater
        .getByText('There Is No Preview Available')
        .isVisible(),
    };
  }

  async imageCarouselMultipleImageDisplay() {
    const carouselLocator = this.iaTheater.locator('#ia-carousel');
    await carouselLocator.waitFor({ state: 'visible' });
    const carouselVisible = await carouselLocator.isVisible();

    const innerCarousel = this.iaTheater.locator('#ia-carousel > div');
    const innerCarouselItem = this.iaTheater.locator(
      '#ia-carousel > div > div.item',
    );

    const carouselClass = await innerCarousel.getAttribute('class');
    const carouselItemsCount = (await innerCarouselItem.all()).length;

    return {
      carouselVisible,
      carouselClass,
      carouselItemsCount,
    };
  }

  async radioPlayerTheaterDisplay() {
    const locator = this.iaTheater.locator('radio-player');
    await locator.waitFor({ state: 'visible' });
    return locator.isVisible();
  }

  async tvTheaterDisplay() {
    return {
      tvBannerVisible: await this.page.locator('#tvbanner').isVisible(),
      colsVisible: await this.page.locator('#cols').isVisible(),
    };
  }

  async getRadioBorrowProgramState() {
    return {
      borrowButtonVisible: await this.page
        .locator('div.topinblock.borrow-program-btn')
        .isVisible(),
      radioBorrowButtonVisible: await this.page
        .locator('#radio-borrow-button')
        .isVisible(),
      borrowProgramTextVisible: await this.page
        .locator('span:has-text("Borrow Program")')
        .isVisible(),
    };
  }

  async verifyTVBorrowProgramAvailable() {
    return {
      borrowButtonVisible: await this.page
        .locator('div.topinblock.borrow-dvd-btn')
        .isVisible(),
      tvBorrowVisible: await this.page.locator('#tvborrow').isVisible(),
      borrowProgramTextVisible: await this.page
        .locator('span:has-text("Borrow Program")')
        .isVisible(),
    };
  }

  async videoPlayerTheaterDisplay() {
    const locator = this.iaTheater.locator('#jw6');
    await locator.waitFor({ state: 'visible' });
    return locator.isVisible();
  }

  async softwareEmulationTheaterDisplay() {
    await this.page.locator('#emulate').waitFor({ state: 'visible' });
    return {
      emulatorVisible: await this.page.locator('#emulate').isVisible(),
      theatreEmulatorVisible: await this.iaTheater
        .locator('#emulate')
        .isVisible(),
    };
  }

  async interactWithImageCarousel() {
    const leftArrowControl = this.iaCarousel.locator('a.left.carousel-control');
    const rightArrowControl = this.iaCarousel.locator(
      'a.right.carousel-control',
    );
    const carouselItems = this.iaCarousel.locator(
      'div.carousel-inner > div.item',
    );

    // load next image
    await rightArrowControl.click();
    await this.page.waitForFunction(
      () =>
        document
          .querySelectorAll('#ia-carousel > div > div.item')[1]
          ?.classList.contains('active'),
    );
    const nextItemClass = await carouselItems.nth(1).getAttribute('class');

    // load prev image
    await leftArrowControl.click();
    await this.page.waitForFunction(
      () =>
        document
          .querySelectorAll('#ia-carousel > div > div.item')[0]
          ?.classList.contains('active'),
    );
    const prevItemClass = await carouselItems.first().getAttribute('class');

    return {
      nextItemClass,
      prevItemClass,
    };
  }

  async activateWebAmpSkin() {
    await this.iaTheater.locator('.js-webamp-use_skin_for_audio_items').click();
  }

  async searchRadioTranscriptAndVerifySearchEntryPositions(str: string) {
    const expandableSearchBar = this.page.locator('expandable-search-bar');
    await expandableSearchBar.waitFor({ state: 'visible' });
    const searchInputVisible = await expandableSearchBar
      .locator('#search-input')
      .isVisible();

    const searchResultsSwitcher = this.page.locator('search-results-switcher');
    const currentResultLocator = searchResultsSwitcher.locator(
      'div > span.results-range #current-result',
    );
    const prevButton = searchResultsSwitcher.locator('#previous-button');
    const nextButton = searchResultsSwitcher.locator('#next-button');

    await expandableSearchBar.locator('#search-input').fill(str);
    await expandableSearchBar.locator('#search-input').press('Enter');
    await searchResultsSwitcher.waitFor({ state: 'visible' });

    const searchResultsVisible = await searchResultsSwitcher.isVisible();
    const currentResult = await currentResultLocator.innerText();
    const numberOfResults = await searchResultsSwitcher
      .locator('div > span.results-range #number-of-results')
      .innerText();

    const defaultEntryIndex = await this.searchResultEntryIndex();

    const beforeNext = await currentResultLocator.innerText();
    await nextButton.click();
    await this.page.waitForFunction(
      before =>
        document.querySelector('search-results-switcher #current-result')
          ?.textContent !== before,
      beforeNext,
    );
    const nextEntryIndex = await this.searchResultEntryIndex();

    const beforePrev = await currentResultLocator.innerText();
    await prevButton.click();
    await this.page.waitForFunction(
      before =>
        document.querySelector('search-results-switcher #current-result')
          ?.textContent !== before,
      beforePrev,
    );
    const prevEntryIndex = await this.searchResultEntryIndex();

    return {
      searchInputVisible,
      searchResultsVisible,
      currentResult,
      numberOfResults,
      defaultEntryIndex,
      nextEntryIndex,
      prevEntryIndex,
    };
  }

  async searchResultEntryIndex(): Promise<number> {
    const transcriptView = this.page.locator('transcript-view');
    const entries = await transcriptView.locator('transcript-entry').all();
    const limit = Math.min(entries.length, 10);

    for (let index = 0; index < limit; index++) {
      const searchResult = await entries[index].getAttribute('issearchresult');
      const selected = await entries[index].getAttribute('isselected');
      if (searchResult !== null && selected !== null) {
        return index;
      }
    }

    return 0;
  }
}
