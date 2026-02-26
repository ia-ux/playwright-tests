import { test, expect } from '../fixtures';

import { identifier } from '../../config';

test('Basic display: Items display item details page', async ({
  detailsPage,
}) => {
  await detailsPage.gotoPage(identifier.details.default);
  const elements = await detailsPage.assertPageElements();
  expect(elements.metadataElements.leftIconVisible).toBeTruthy();
  expect(elements.metadataElements.itemTitleVisible).toBeTruthy();
  expect(elements.metadataElements.metadataDefinitionVisible).toBeTruthy();
  expect(elements.metadataElements.statsVisible).toBeTruthy();
  expect(elements.metadataElements.downloadVisible).toBeTruthy();
  expect(elements.metadataElements.collectionListVisible).toBeTruthy();
  expect(elements.metadataElements.uploadInfoVisible).toBeTruthy();
  expect(elements.metadataElements.reviewsVisible).toBeTruthy();
  expect(elements.actionButtons.favoriteVisible).toBeTruthy();
  expect(elements.actionButtons.shareVisible).toBeTruthy();
  expect(elements.actionButtons.flagVisible).toBeTruthy();
  expect(elements.termsOfService).toBeTruthy();
});

test('Load theater: 3d viewer', async ({ detailsPage }) => {
  await detailsPage.gotoPage(identifier.details.three_d_viewer);
  const isVisible = await detailsPage.container3dDisplay();
  expect(isVisible).toBeTruthy();
});

test(`Load theater: audio (image carousel / bookreader)`, async ({
  detailsPage,
}) => {
  await detailsPage.gotoPage(identifier.details.audio_image_carousel);
  const result = await detailsPage.musicTheaterDisplayWithCoverArt();
  expect(result.musicTheaterVisible).toBeTruthy();
  expect(result.seeMoreCtaVisible).toBeTruthy();
});

test(`Load theater: audio single image`, async ({ detailsPage }) => {
  await test.step('Load a page with single image', async () => {
    await detailsPage.gotoPage(identifier.details.audio_single_image_1);
    const result = await detailsPage.musicTheaterDisplaySingleImage();
    expect(result.musicTheaterVisible).toBeTruthy();
    expect(result.seeMoreCtaVisible).toBeFalsy();
  });

  await test.step('Load another page with single image', async () => {
    await detailsPage.gotoPage(identifier.details.audio_single_image_2);
    const result = await detailsPage.musicTheaterDisplaySingleImage();
    expect(result.musicTheaterVisible).toBeTruthy();
    expect(result.seeMoreCtaVisible).toBeFalsy();
  });
});

test.fixme(`Load theater: bookreader`, async ({ detailsPage }) => {
  await test.step('Load a book page', async () => {
    await detailsPage.gotoPage(identifier.details.bookreader);
    const isVisible = await detailsPage.bookreaderDisplay();
    expect(isVisible).toBeTruthy();
  });
});

test(`Load theater: data`, async ({ detailsPage }) => {
  await detailsPage.gotoPage(identifier.details.archive_data);
  const result = await detailsPage.dataTheaterDisplay();
  expect(result.noPreviewVisible).toBeTruthy();
  expect(result.messageVisible).toBeTruthy();
});

test(`Load theater: software emulation`, async ({ detailsPage }) => {
  await detailsPage.gotoPage(identifier.details.software_emulation);
  const result = await detailsPage.softwareEmulationTheaterDisplay();
  expect(result.emulatorVisible).toBeTruthy();
  expect(result.theatreEmulatorVisible).toBeTruthy();
});

test(`Load theater: image (carousel)`, async ({ detailsPage }) => {
  await detailsPage.gotoPage(identifier.details.image_carousel);
  const result = await detailsPage.imageCarouselMultipleImageDisplay(true);
  expect(result.carouselVisible).toBeTruthy();
  expect(result.carouselClass).toContain('carousel-inner multiple-images');
  expect(result.carouselItemsCount).toBeGreaterThan(1);
});

test(`Load theater: image (single)`, async ({ detailsPage }) => {
  await detailsPage.gotoPage(identifier.details.image_single);
  const result = await detailsPage.imageCarouselMultipleImageDisplay(false);
  expect(result.carouselVisible).toBeTruthy();
  expect(result.carouselClass).toContain('carousel-inner');
  expect(result.carouselItemsCount).toEqual(1);
});

test.fixme(
  `Load theater: radio as priv'd user`,
  async ({ loginPage, detailsPage }) => {
    await test.step(`Do login as priv'd user`, async () => {
      await loginPage.loginAs('privs');
    });
    await test.step(`Go to radio details page and verify priv'd user borrow program`, async () => {
      await detailsPage.gotoPage(identifier.details.radio_borrow);
      const playerVisible = await detailsPage.radioPlayerTheaterDisplay();
      expect(playerVisible).toBeTruthy();
      const borrowResult = await detailsPage.verifyRadioBorrowProgramAvailable();
      expect(borrowResult.borrowButtonVisible).toBeTruthy();
      expect(borrowResult.radioBorrowButtonVisible).toBeTruthy();
      expect(borrowResult.borrowProgramTextVisible).toBeTruthy();
    });
  },
);

test.fixme(
  `Load theater: radio as regular patron user`,
  async ({ loginPage, detailsPage }) => {
    await test.step(`Do login as regular patron user`, async () => {
      await loginPage.loginAs('patron');
    });
    await test.step(`Go to radio details page and verify priv'd user borrow program`, async () => {
      await detailsPage.gotoPage(identifier.details.radio_borrow);
      const playerVisible = await detailsPage.radioPlayerTheaterDisplay();
      expect(playerVisible).toBeTruthy();
      const borrowResult = await detailsPage.verifyRadioBorrowProgramUnavailable();
      expect(borrowResult.borrowButtonVisible).toBeFalsy();
      expect(borrowResult.radioBorrowButtonVisible).toBeFalsy();
      expect(borrowResult.borrowProgramTextVisible).toBeFalsy();
    });
  },
);

test.fixme(
  `Load theater: radio as guest/not logged in user`,
  async ({ detailsPage }) => {
    await test.step(`Go to radio details page and verify priv'd user borrow program`, async () => {
      await detailsPage.gotoPage(identifier.details.radio_borrow);
      const playerVisible = await detailsPage.radioPlayerTheaterDisplay();
      expect(playerVisible).toBeTruthy();
      const borrowResult = await detailsPage.verifyRadioBorrowProgramUnavailable();
      expect(borrowResult.borrowButtonVisible).toBeFalsy();
      expect(borrowResult.radioBorrowButtonVisible).toBeFalsy();
      expect(borrowResult.borrowProgramTextVisible).toBeFalsy();
    });
  },
);

test.fixme(`Load theater: tv as priv'd user`, async ({ loginPage, detailsPage }) => {
  await test.step(`Do login as priv'd user`, async () => {
    await loginPage.loginAs('privs');
  });
  await test.step(`Go to tv details page and verify priv'd user borrow program`, async () => {
    await detailsPage.gotoPage(identifier.details.tv_borrow);
    const theaterResult = await detailsPage.tvTheaterDisplay();
    expect(theaterResult.tvBannerVisible).toBeTruthy();
    expect(theaterResult.colsVisible).toBeTruthy();
    const borrowResult = await detailsPage.verifyTVBorrowProgramAvailable();
    expect(borrowResult.borrowButtonVisible).toBeTruthy();
    expect(borrowResult.tvBorrowVisible).toBeTruthy();
    expect(borrowResult.borrowProgramTextVisible).toBeTruthy();
  });
});

test.fixme(
  `Load theater: tv as patron user`,
  async ({ loginPage, detailsPage }) => {
    await test.step(`Do login as patron user`, async () => {
      await loginPage.loginAs('patron');
    });
    await test.step(`Go to tv details page and verify priv'd user borrow program`, async () => {
      await detailsPage.gotoPage(identifier.details.tv_borrow);
      const theaterResult = await detailsPage.tvTheaterDisplay();
      expect(theaterResult.tvBannerVisible).toBeTruthy();
      expect(theaterResult.colsVisible).toBeTruthy();
      const borrowResult = await detailsPage.verifyTVBorrowProgramAvailable();
      expect(borrowResult.borrowButtonVisible).toBeTruthy();
      expect(borrowResult.tvBorrowVisible).toBeTruthy();
      expect(borrowResult.borrowProgramTextVisible).toBeTruthy();
    });
  },
);

test(`Load theater: tv as guest/not logged in user`, async ({
  detailsPage,
}) => {
  await test.step(`Go to tv details page and verify priv'd user borrow program`, async () => {
    await detailsPage.gotoPage(identifier.details.tv_borrow);
    const theaterResult = await detailsPage.tvTheaterDisplay();
    expect(theaterResult.tvBannerVisible).toBeTruthy();
    expect(theaterResult.colsVisible).toBeTruthy();
    const borrowResult = await detailsPage.verifyTVBorrowProgramAvailable();
    expect(borrowResult.borrowButtonVisible).toBeTruthy();
    expect(borrowResult.tvBorrowVisible).toBeTruthy();
    expect(borrowResult.borrowProgramTextVisible).toBeTruthy();
  });
});

test(`Load theater: video`, async ({ detailsPage }) => {
  await detailsPage.gotoPage(identifier.details.theater_video);
  const isVisible = await detailsPage.videoPlayerTheaterDisplay();
  expect(isVisible).toBeTruthy();
});

test.fixme(`Load theater: webamp`, async ({ detailsPage }) => {
  await detailsPage.gotoPage(identifier.details.webamp);
  await detailsPage.iaMusicTheater.selectChannelSelector('Webamp');
  await detailsPage.iaMusicTheater.webAmpDisplayFromChannelSelector(true);
});

test.fixme(`Load theater: webamp with skin`, async ({ detailsPage }) => {
  await test.step('Load webAmp skin - llama feature', async () => {
    // goto a webamp skin page
    await detailsPage.gotoPage(identifier.details.webamp_with_skin);
    // activate webamp skin - llama
    await detailsPage.activateWebAmpSkin();
  });

  await test.step('Check webamp displayed directly after webamp skin activated', async () => {
    // then go to a track page to check if it loads the webamp view is loaded
    await detailsPage.gotoPage(identifier.details.webamp);
    await detailsPage.iaMusicTheater.webAmpDisplayFromChannelSelector(false);
  });
});

test(`Functionality: Image (carousel) - Navigate images`, async ({
  detailsPage,
}) => {
  await detailsPage.gotoPage(identifier.details.image_carousel);
  const result = await detailsPage.interactWithImageCarousel();
  expect(result.nextItemClass).toContain('active');
  expect(result.prevItemClass).toContain('active');
});

test.fixme(
  `Functionality: Radio - Search transcript`,
  async ({ detailsPage }) => {
    await detailsPage.gotoPage(identifier.details.radio_borrow);
    const result = await detailsPage.searchRadioTranscriptAndVerifySearchEntryPositions('and');
    expect(result.searchInputVisible).toBeTruthy();
    expect(result.searchResultsVisible).toBeTruthy();
    expect(result.currentResult).toBe('1');
    expect(result.numberOfResults).toBe('127');
    expect(result.defaultEntryIndex).toBe(2);
    expect(result.nextEntryIndex).toBe(5);
    expect(result.prevEntryIndex).toBe(2);
  },
);
