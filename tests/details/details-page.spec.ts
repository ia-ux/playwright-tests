import { test, expect } from '../fixtures';

import { identifier } from '../../config';

test('Basic display: Items display item details page', async ({ detailsPage }) => {
  await test.step('Navigate to default item details page', async () => {
    await detailsPage.gotoPage(identifier.details.default);
  });

  const elements = await detailsPage.assertPageElements();

  await test.step('Verify metadata elements are visible', async () => {
    expect(elements.metadataElements.leftIconVisible).toBeTruthy();
    expect(elements.metadataElements.itemTitleVisible).toBeTruthy();
    expect(elements.metadataElements.metadataDefinitionVisible).toBeTruthy();
    expect(elements.metadataElements.statsVisible).toBeTruthy();
    expect(elements.metadataElements.downloadVisible).toBeTruthy();
    expect(elements.metadataElements.collectionListVisible).toBeTruthy();
    expect(elements.metadataElements.uploadInfoVisible).toBeTruthy();
    expect(elements.metadataElements.reviewsVisible).toBeTruthy();
  });

  await test.step('Verify action buttons and terms of service are visible', async () => {
    expect(elements.actionButtons.favoriteVisible).toBeTruthy();
    expect(elements.actionButtons.shareVisible).toBeTruthy();
    expect(elements.actionButtons.flagVisible).toBeTruthy();
    expect(elements.termsOfService).toBeTruthy();
  });
});

test('Load theater: 3d viewer', async ({ detailsPage }) => {
  await test.step('Navigate to 3D viewer item page', async () => {
    await detailsPage.gotoPage(identifier.details.three_d_viewer);
  });

  await test.step('Verify 3D viewer is visible', async () => {
    const isVisible = await detailsPage.container3dDisplay();
    expect(isVisible).toBeTruthy();
  });
});

test(`Load theater: audio (image carousel / bookreader)`, async ({ detailsPage }) => {
  await test.step('Navigate to audio item with image carousel', async () => {
    await detailsPage.gotoPage(identifier.details.audio_image_carousel);
  });

  await test.step('Verify music theater and see-more CTA are visible', async () => {
    const result = await detailsPage.musicTheaterDisplay();
    expect(result.musicTheaterVisible).toBeTruthy();
    expect(result.seeMoreCtaVisible).toBeTruthy();
  });
});

test(`Load theater: audio single image`, async ({ detailsPage }) => {
  await test.step('Navigate to first audio item with single image', async () => {
    await detailsPage.gotoPage(identifier.details.audio_single_image_1);
  });

  await test.step('Verify music theater is visible and see-more CTA is hidden', async () => {
    const result = await detailsPage.musicTheaterDisplay();
    expect(result.musicTheaterVisible).toBeTruthy();
    expect(result.seeMoreCtaVisible).toBeFalsy();
  });

  await test.step('Navigate to second audio item with single image', async () => {
    await detailsPage.gotoPage(identifier.details.audio_single_image_2);
  });

  await test.step('Verify music theater is visible and see-more CTA is hidden', async () => {
    const result = await detailsPage.musicTheaterDisplay();
    expect(result.musicTheaterVisible).toBeTruthy();
    expect(result.seeMoreCtaVisible).toBeFalsy();
  });
});

test(`Load theater: bookreader`, async ({ detailsPage }) => {
  await test.step('Navigate to book page', async () => {
    await detailsPage.gotoPage(identifier.details.bookreader);
  });

  await test.step('Verify BookReader is visible', async () => {
    const isVisible = await detailsPage.bookreaderDisplay();
    expect(isVisible).toBeTruthy();
  });
});

test(`Load theater: data`, async ({ detailsPage }) => {
  await test.step('Navigate to data item page', async () => {
    await detailsPage.gotoPage(identifier.details.archive_data);
  });

  await test.step('Verify no-preview placeholder and message are visible', async () => {
    const result = await detailsPage.dataTheaterDisplay();
    expect(result.noPreviewVisible).toBeTruthy();
    expect(result.messageVisible).toBeTruthy();
  });
});

test(`Load theater: software emulation`, async ({ detailsPage }) => {
  await test.step('Navigate to software emulation item page', async () => {
    await detailsPage.gotoPage(identifier.details.software_emulation);
  });

  await test.step('Verify emulator is visible inside theater', async () => {
    const result = await detailsPage.softwareEmulationTheaterDisplay();
    expect(result.emulatorVisible).toBeTruthy();
    expect(result.theatreEmulatorVisible).toBeTruthy();
  });
});

test(`Load theater: image (carousel)`, async ({ detailsPage }) => {
  await test.step('Navigate to image carousel item page', async () => {
    await detailsPage.gotoPage(identifier.details.image_carousel);
  });

  await test.step('Verify carousel is visible with multiple images', async () => {
    const result = await detailsPage.imageCarouselMultipleImageDisplay();
    expect(result.carouselVisible).toBeTruthy();
    expect(result.carouselClass).toContain('carousel-inner multiple-images');
    expect(result.carouselItemsCount).toBeGreaterThan(1);
  });
});

test(`Load theater: image (single)`, async ({ detailsPage }) => {
  await test.step('Navigate to single image item page', async () => {
    await detailsPage.gotoPage(identifier.details.image_single);
  });

  await test.step('Verify carousel is visible with exactly one image', async () => {
    const result = await detailsPage.imageCarouselMultipleImageDisplay();
    expect(result.carouselVisible).toBeTruthy();
    expect(result.carouselClass).toContain('carousel-inner');
    expect(result.carouselItemsCount).toEqual(1);
  });
});

test.fixme(
  `Load theater: radio as priv'd user`,
  async ({ loginPage, detailsPage }) => {
    await test.step(`Login as priv'd user`, async () => {
      await loginPage.loginAs('privs');
    });

    await test.step(`Navigate to radio details page`, async () => {
      await detailsPage.gotoPage(identifier.details.radio_borrow);
    });

    await test.step(`Verify radio player and borrow program are available`, async () => {
      const playerVisible = await detailsPage.radioPlayerTheaterDisplay();
      expect(playerVisible).toBeTruthy();
      const borrowResult = await detailsPage.getRadioBorrowProgramState();
      expect(borrowResult.borrowButtonVisible).toBeTruthy();
      expect(borrowResult.radioBorrowButtonVisible).toBeTruthy();
      expect(borrowResult.borrowProgramTextVisible).toBeTruthy();
    });
  },
);

test.fixme(
  `Load theater: radio as regular patron user`,
  async ({ loginPage, detailsPage }) => {
    await test.step(`Login as patron user`, async () => {
      await loginPage.loginAs('patron');
    });

    await test.step(`Navigate to radio details page`, async () => {
      await detailsPage.gotoPage(identifier.details.radio_borrow);
    });

    await test.step(`Verify radio player is visible and borrow program is unavailable`, async () => {
      const playerVisible = await detailsPage.radioPlayerTheaterDisplay();
      expect(playerVisible).toBeTruthy();
      const borrowResult = await detailsPage.getRadioBorrowProgramState();
      expect(borrowResult.borrowButtonVisible).toBeFalsy();
      expect(borrowResult.radioBorrowButtonVisible).toBeFalsy();
      expect(borrowResult.borrowProgramTextVisible).toBeFalsy();
    });
  },
);

test.fixme(
  `Load theater: radio as guest/not logged in user`,
  async ({ detailsPage }) => {
    await test.step(`Navigate to radio details page`, async () => {
      await detailsPage.gotoPage(identifier.details.radio_borrow);
    });

    await test.step(`Verify radio player is visible and borrow program is unavailable for guests`, async () => {
      const playerVisible = await detailsPage.radioPlayerTheaterDisplay();
      expect(playerVisible).toBeTruthy();
      const borrowResult = await detailsPage.getRadioBorrowProgramState();
      expect(borrowResult.borrowButtonVisible).toBeFalsy();
      expect(borrowResult.radioBorrowButtonVisible).toBeFalsy();
      expect(borrowResult.borrowProgramTextVisible).toBeFalsy();
    });
  },
);

test.fixme(`Load theater: tv as priv'd user`, async ({ loginPage, detailsPage }) => {
  await test.step(`Login as priv'd user`, async () => {
    await loginPage.loginAs('privs');
  });

  await test.step(`Navigate to TV details page`, async () => {
    await detailsPage.gotoPage(identifier.details.tv_borrow);
  });

  await test.step(`Verify TV theater and borrow program are available`, async () => {
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
    await test.step(`Login as patron user`, async () => {
      await loginPage.loginAs('patron');
    });

    await test.step(`Navigate to TV details page`, async () => {
      await detailsPage.gotoPage(identifier.details.tv_borrow);
    });

    await test.step(`Verify TV theater is visible and borrow program is available`, async () => {
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

test(`Load theater: tv as guest/not logged in user`, async ({ detailsPage }) => {
  await test.step(`Navigate to TV details page`, async () => {
    await detailsPage.gotoPage(identifier.details.tv_borrow);
  });

  await test.step(`Verify TV theater and borrow program are visible for guest user`, async () => {
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
  await test.step('Navigate to video item page', async () => {
    await detailsPage.gotoPage(identifier.details.theater_video);
  });

  await test.step('Verify video player is visible', async () => {
    const isVisible = await detailsPage.videoPlayerTheaterDisplay();
    expect(isVisible).toBeTruthy();
  });
});

test(`Load theater: webamp`, async ({ detailsPage }) => {
  test.fixme(true, 'Webamp does not load in headless mode — run with --headed to verify');
  test.info().annotations.push({
    type: 'Test',
    description: 'This test fails in headless mode due to webamp not loading the webamp view for some reason.',
  });

  await test.step('Navigate to webamp item page', async () => {
    await detailsPage.gotoPage(identifier.details.webamp);
  });

  await test.step('Select Webamp from channel selector', async () => {
    await detailsPage.iaMusicTheater.selectChannelSelector('Webamp');
  });

  await test.step('Verify Webamp windows are visible', async () => {
    const result = await detailsPage.iaMusicTheater.webAmpDisplayFromChannelSelector(true);
    expect(result.theatreIaVisible).toBeTruthy();
    expect(result.jsWebampVisible).toBeTruthy();
    expect(result.mainWindowVisible).toBeTruthy();
    expect(result.playlistWindowVisible).toBeTruthy();
    expect(result.equalizerWindowVisible).toBeTruthy();
  });
});

test(`Load theater: webamp with skin`, async ({ detailsPage }) => {
  test.fixme(true, 'Webamp does not load in headless mode — run with --headed to verify');
  test.info().annotations.push({
    type: 'Test',
    description: 'This test fails in headless mode due to webamp not loading the webamp view for some reason.',
  });

  await test.step('Navigate to webamp skin page and activate skin', async () => {
    await detailsPage.gotoPage(identifier.details.webamp_with_skin);
    await detailsPage.activateWebAmpSkin();
  });

  await test.step('Navigate to webamp track page', async () => {
    await detailsPage.gotoPage(identifier.details.webamp);
  });

  await test.step('Verify Webamp loads with previously activated skin', async () => {
    const result = await detailsPage.iaMusicTheater.webAmpDisplayFromChannelSelector(false);
    expect(result.theatreIaVisible).toBeTruthy();
    expect(result.jsWebampVisible).toBeTruthy();
    expect(result.mainWindowVisible).toBeTruthy();
    expect(result.playlistWindowVisible).toBeTruthy();
    expect(result.equalizerWindowVisible).toBeTruthy();
  });
});

test(`Functionality: Image (carousel) - Navigate images`, async ({ detailsPage }) => {
  await test.step('Navigate to image carousel item page', async () => {
    await detailsPage.gotoPage(identifier.details.image_carousel);
  });

  await test.step('Navigate carousel forward and back, verify active slide changes', async () => {
    const result = await detailsPage.interactWithImageCarousel();
    expect(result.nextItemClass).toContain('active');
    expect(result.prevItemClass).toContain('active');
  });
});

test.fixme(
  `Functionality: Radio - Search transcript`,
  async ({ detailsPage }) => {
    await test.step('Navigate to radio item page', async () => {
      await detailsPage.gotoPage(identifier.details.radio_borrow);
    });

    await test.step('Search transcript and verify entry positions', async () => {
      const result = await detailsPage.searchRadioTranscriptAndVerifySearchEntryPositions('and');
      expect(result.searchInputVisible).toBeTruthy();
      expect(result.searchResultsVisible).toBeTruthy();
      expect(result.currentResult).toBe('1');
      expect(result.numberOfResults).toBe('127');
      expect(result.defaultEntryIndex).toBe(2);
      expect(result.nextEntryIndex).toBe(5);
      expect(result.prevEntryIndex).toBe(2);
    });
  },
);
