import { test, expect } from '../fixtures';
import { identifier } from '../../config';

const BLACK_WAVEFORM = 'https://av.archive.org/img/black.jpg';

// How far playback must advance before we pause and assert on the elapsed time.
const PLAYBACK_SECONDS = 5;

test('Load Grateful Dead Soundtrack page to check page elements', async ({
  musicPage,
}) => {
  await musicPage.gotoPage(identifier.details.music_theater_grateful_dead);

  await test.step(`Verify music theater and channel selector are visible`, async () => {
    await expect(musicPage.iaMusicTheater.musicTheater).toBeVisible();
    await expect(musicPage.iaMusicTheater.channelSelector).toBeVisible();
  });

  await test.step(`Verify channel selector has Player and Webamp options`, async () => {
    await expect(musicPage.iaMusicTheater.channelSelector).toContainText(
      'Webamp',
    );
  });

  await test.step(`Verify audio player and playlist are visible`, async () => {
    await expect(musicPage.iaMusicTheater.playAv).toBeVisible();
    await expect(musicPage.trackList).toBeVisible();
  });
});

test(`Special case: Audio item without image - with waveform`, async ({
  musicPage,
}) => {
  await test.step(`Load the page`, async () => {
    await musicPage.gotoPage(
      identifier.details.music_theater_no_image_with_waveform,
    );
  });

  await test.step(`Verify music theater and channel selector are visible`, async () => {
    await expect(musicPage.iaMusicTheater.musicTheater).toBeVisible();
    await expect(musicPage.iaMusicTheater.channelSelector).toBeVisible();
  });

  await test.step(`Verify channel selector has Player and Webamp options`, async () => {
    await expect(musicPage.iaMusicTheater.channelSelector).toContainText(
      'Webamp',
    );
  });

  await test.step(`Verify photo viewer, audio player, and playlist are visible`, async () => {
    await expect(musicPage.iaMusicTheater.iauxPhotoViewer).toBeVisible();
    await expect(musicPage.iaMusicTheater.playAv).toBeVisible();
    await expect(musicPage.trackList).toBeVisible();
  });

  await test.step(`Verify placeholder image is displayed for missing cover art`, async () => {
    await expect(musicPage.iaMusicTheater.iauxPhotoViewer).toHaveAttribute(
      'noimageavailable',
    );
    await expect(musicPage.iaMusicTheater.noImageLocator).toBeVisible();
    await expect(musicPage.bookReader.bookReaderShell).not.toBeVisible();
  });

  await test.step(`Verify waveform is displayed`, async () => {
    expect(await musicPage.waveformImage.getAttribute('src')).not.toBe(
      BLACK_WAVEFORM,
    );
  });
});

test(`Special case: Load a single track - no waveform`, async ({
  musicPage,
}) => {
  await test.step(`Load the page`, async () => {
    await musicPage.gotoPage(
      identifier.details.music_theater_single_track_no_waveform,
    );
  });

  await test.step(`Verify music theater and channel selector are visible`, async () => {
    await expect(musicPage.iaMusicTheater.musicTheater).toBeVisible();
    await expect(musicPage.iaMusicTheater.channelSelector).toBeVisible();
  });

  await test.step(`Verify channel selector has Player and Webamp options`, async () => {
    await expect(musicPage.iaMusicTheater.channelSelector).toContainText(
      'Webamp',
    );
  });

  await test.step(`Verify photo viewer, audio player, and playlist are visible`, async () => {
    await expect(musicPage.iaMusicTheater.iauxPhotoViewer).toBeVisible();
    await expect(musicPage.iaMusicTheater.playAv).toBeVisible();
    await expect(musicPage.trackList).toBeVisible();
  });

  await test.step(`Verify see-more CTA is shown (no placeholder for missing image)`, async () => {
    await expect(musicPage.iaMusicTheater.iauxPhotoViewer).not.toHaveAttribute(
      'noimageavailable',
    );
    await expect(musicPage.iaMusicTheater.seeMoreCta).toBeVisible();
    await expect(musicPage.bookReader.bookReaderShell).toBeVisible();
  });

  await test.step(`Verify waveform is not displayed`, async () => {
    expect(await musicPage.waveformImage.getAttribute('src')).toBe(
      BLACK_WAVEFORM,
    );
  });
});

test(`Play a Grateful Dead track`, async ({ musicPage }) => {
  await musicPage.gotoPage(identifier.details.music_theater_grateful_dead);

  await test.step(`Play music and verify it starts playing`, async () => {
    await musicPage.waitForPlayerReady();
    await musicPage.iaMusicTheater.musicPlayerPlayButton.click();
    await expect(musicPage.jwPlayerPlaying).toBeVisible({ timeout: 60000 });
    expect(await musicPage.getElapsedTimeValue()).toBe('00:00');
  });

  await test.step(`Let playback reach ${PLAYBACK_SECONDS}s then pause`, async () => {
    // Poll the player's own elapsed counter rather than sleeping a fixed
    // interval. Playback time does not advance in lockstep with wall time —
    // buffering makes it lag — so a fixed sleep paired with an exact-value
    // assertion is inherently flaky (it read 00:08 after a 10s sleep).
    await expect
      .poll(() => musicPage.getElapsedSeconds(), { timeout: 60000 })
      .toBeGreaterThanOrEqual(PLAYBACK_SECONDS);
    await musicPage.iaMusicTheater.musicPlayerPauseButton.click();
  });

  await test.step(`Verify music is paused and elapsed time held`, async () => {
    await expect(musicPage.jwPlayerPaused).toBeVisible();
    expect(await musicPage.getElapsedSeconds()).toBeGreaterThanOrEqual(
      PLAYBACK_SECONDS,
    );
  });
});

test(`Open and navigate liner notes`, async ({ musicPage }) => {
  await musicPage.gotoPage(
    identifier.details.music_theater_single_track_no_waveform,
  );

  await test.step(`Open liner notes and verify BookReader loads in 1up mode`, async () => {
    await musicPage.iaMusicTheater.seeMoreCta.click({ timeout: 10000 });
    await expect(musicPage.iaMusicTheater.iauxPhotoViewer).toHaveAttribute(
      'showallphotos',
    );
    expect(await musicPage.getBookReaderClass()).toContain('BRmode1up');
  });

  await test.step(`Switch to thumbnail view`, async () => {
    await musicPage.bookReader.brThumb.click();
    expect(await musicPage.getBookReaderClass()).toContain('BRmodeThumb');
  });

  await test.step(`Switch back to 1up view`, async () => {
    await musicPage.bookReader.brOnePage.click();
    expect(await musicPage.getBookReaderClass()).toContain('BRmode1up');
  });

  await test.step(`Enter fullscreen mode`, async () => {
    await musicPage.bookReader.brFullScreen.click();
    expect(await musicPage.getBookReaderClass()).toContain('fullscreenActive');
  });

  await test.step(`Exit fullscreen mode`, async () => {
    await musicPage.bookReader.brExitFullScreen.click();
    expect(await musicPage.getBookReaderClass()).not.toContain(
      'fullscreenActive',
    );
  });

  await test.step(`Close photo viewer and verify it closes`, async () => {
    await musicPage.closePhotoViewer.click();
    await expect(musicPage.iaMusicTheater.iauxPhotoViewer).not.toHaveAttribute(
      'showallphotos',
    );
  });
});
