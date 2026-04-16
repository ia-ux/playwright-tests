// This is a parameterized test so we can test different books in 1 test
// more details here: https://playwright.dev/docs/test-parameterize
import { test, expect } from '../fixtures';

import { identifier } from '../../config';

const testBooks = [
  {
    bookIdentifier: identifier.books.default,
    isPublic: true,
  },
  {
    bookIdentifier: identifier.books.with_dot_sample,
    isPublic: false,
  },
];

testBooks.forEach(({ bookIdentifier, isPublic }) => {
  test.describe(`BookReader Tests [${bookIdentifier}]`, () => {
    test.beforeEach(async ({ bookPage }) => {
      await bookPage.goToPage(bookIdentifier);
    });

    test(`Canonical URL has no initial parameters - ${bookIdentifier}`, async ({
      bookPage,
    }) => {
      await test.step('Get initial URL state', async () => {
        const pageHash = await bookPage.getPageHash();
        const pageUrl = await bookPage.getPageUrl();

        expect(pageHash).toEqual('');
        expect(pageUrl).not.toContain('#page/');
        expect(pageUrl).not.toContain('/page/');
        expect(pageUrl).not.toContain('/mode/');
      });
    });

    test.describe('Book navigations', () => {
      test(`On load, pages fit fully inside of the BookReader™ - ${bookIdentifier}`, async ({
        bookPage,
      }) => {
        let brShellBox: Awaited<
          ReturnType<typeof bookPage.getBRShellPageBoundingBox>
        >;
        let brContainerBox: Awaited<
          ReturnType<typeof bookPage.getBRContainerPageBoundingBox>
        >;

        await test.step('Get bounding boxes for shell and container', async () => {
          brShellBox = await bookPage.getBRShellPageBoundingBox();
          brContainerBox = await bookPage.getBRContainerPageBoundingBox();
        });

        await test.step('Verify pages are not cropped vertically or horizontally', async () => {
          expect(brContainerBox?.height).toBeLessThanOrEqual(
            Number(brShellBox?.height),
          );
          expect(brContainerBox?.width).toBeLessThanOrEqual(
            Number(brShellBox?.width),
          );
        });
      });

      test(`Nav menu displays properly - ${bookIdentifier}`, async ({
        bookPage,
      }) => {
        await test.step('Wait for BookReader page to be visible', async () => {
          await bookPage.brPageVisible.waitFor({ state: 'visible' });
        });

        await test.step('Verify flip navigation buttons are visible', async () => {
          await expect(bookPage.bookReader.brFlipPrev).toBeVisible();
          await expect(bookPage.bookReader.brFlipNext).toBeVisible();
        });

        await test.step('Verify zoom buttons are visible', async () => {
          await expect(bookPage.bookReader.brZoomIn).toBeVisible();
          await expect(bookPage.bookReader.brZoomOut).toBeVisible();
        });

        await test.step('Verify view mode buttons are visible', async () => {
          await expect(bookPage.bookReader.brOnePage).toBeVisible();
          await expect(bookPage.bookReader.brTwoPage).toBeVisible();
          await expect(bookPage.bookReader.brThumb).toBeVisible();
          await expect(bookPage.bookReader.brFullScreen).toBeVisible();
        });

        await test.step('Verify Read Aloud visibility based on book access', async () => {
          if (isPublic) {
            await expect(bookPage.bookReader.brReadAloud).toBeVisible();
          } else {
            await expect(bookPage.bookReader.brReadAloud).not.toBeVisible();
          }
        });
      });

      test(`2up mode - Clicking "Previous page" changes the page - ${bookIdentifier}`, async ({
        bookPage,
      }) => {
        let origImg1Src: string | null;
        let origImg2Src: string | null;

        await test.step('Flip forward twice to allow going back from cover', async () => {
          await bookPage.flipToNextPage();
          await bookPage.flipToNextPage();
        });

        await test.step('Capture current page image sources', async () => {
          const brPages = await bookPage.brPageVisible.all();
          expect(brPages.length).toBeGreaterThanOrEqual(1);

          if (isPublic) {
            const initialImages = await bookPage.getPageImages();
            origImg1Src = await initialImages.nth(0).getAttribute('src');
            origImg2Src = await initialImages.nth(-1).getAttribute('src');
          }
        });

        await test.step('Flip to previous page', async () => {
          await bookPage.flipToPrevPage();
        });

        await test.step('Verify pages changed after flipping back', async () => {
          const brPages = await bookPage.brPageVisible.all();
          expect(brPages.length).toBeGreaterThanOrEqual(2);

          // Protected books show the same placeholder image for all pages — skip image comparison
          if (isPublic) {
            const prevImages = await bookPage.getPageImages();
            const prevImg1Src = await prevImages.nth(0).getAttribute('src');
            const prevImg2Src = await prevImages.nth(-1).getAttribute('src');

            // Both leaves on the same spread should be different images
            expect(origImg1Src).not.toEqual(origImg2Src);

            // New left page differs from original left and right pages
            expect(prevImg1Src).not.toEqual(origImg1Src);
            expect(prevImg1Src).not.toEqual(origImg2Src);

            // New right page also differs from original pages and new left page
            expect(prevImg2Src).not.toEqual(origImg1Src);
            expect(prevImg2Src).not.toEqual(origImg2Src);
            expect(prevImg1Src).not.toEqual(prevImg2Src);
          }
        });
      });

      test(`Clicking "page flip buttons" updates URL location - ${bookIdentifier}`, async ({
        bookPage,
      }) => {
        await test.step('Flip to next page and verify URL contains page and 2up mode', async () => {
          await bookPage.flipToNextPage();
          expect(await bookPage.isPageInUrl()).toEqual(true);
          expect(await bookPage.isModeInUrl('2up')).toEqual(true);
        });

        await test.step('Flip back to first page and verify 2up mode is kept', async () => {
          await bookPage.flipToPrevPage();
          // BookReader retains a page param after any navigation, so only verify mode is preserved
          expect(await bookPage.isModeInUrl('2up')).toEqual(true);
        });
      });

      test(`Clicking "1 page view" brings up 1 page at a time - ${bookIdentifier}`, async ({
        bookPage,
      }) => {
        await test.step('Navigate to next page then switch to 1-up mode', async () => {
          await bookPage.flipToNextPage();
          await bookPage.bookReader.clickOneUpMode();
        });

        await test.step('Verify only 1 page is visible', async () => {
          const count = await bookPage.bookReader.getVisiblePageCount();
          expect(count).toEqual(1);
        });
      });

      test(`Clicking "2 page view" brings up 2 pages at a time - ${bookIdentifier}`, async ({
        bookPage,
      }) => {
        await test.step('Navigate to next page then switch to 2-up mode', async () => {
          await bookPage.flipToNextPage();
          await bookPage.bookReader.clickTwoUpMode();
        });

        await test.step('Verify 2 pages are visible', async () => {
          const count = await bookPage.bookReader.getVisiblePageCount();
          expect(count).toEqual(2);
        });
      });

      test(`Clicking "thumbnail view" brings up all of the page thumbnails - ${bookIdentifier}`, async ({
        bookPage,
      }) => {
        await test.step('Switch to thumbnail mode', async () => {
          await bookPage.bookReader.clickThumbnailMode();
        });

        await test.step('Verify at least 3 page thumbnails are loaded', async () => {
          const count =
            await bookPage.bookReader.getBrContainerPageLoadedCount();
          expect(count).toBeGreaterThanOrEqual(3);
        });
      });

      test(`Clicking "zoom out" makes book smaller - ${bookIdentifier}`, async ({
        bookPage,
      }) => {
        let initialBookHeight: number | undefined;
        let initialBookWidth: number | undefined;

        await test.step('Capture initial book dimensions', async () => {
          initialBookHeight = await bookPage.getBRPageBoundingBoxDimension(
            'height',
          );
          initialBookWidth = await bookPage.getBRPageBoundingBoxDimension(
            'width',
          );
        });

        await test.step('Click zoom out', async () => {
          await bookPage.clickZoomOut();
        });

        await test.step('Verify book dimensions decreased', async () => {
          const zoomedOutHeight = await bookPage.getBRPageBoundingBoxDimension(
            'height',
          );
          const zoomedOutWidth = await bookPage.getBRPageBoundingBoxDimension(
            'width',
          );
          expect(zoomedOutHeight).toBeLessThan(Number(initialBookHeight));
          expect(zoomedOutWidth).toBeLessThan(Number(initialBookWidth));
        });
      });

      test(`Clicking "zoom in" makes book larger - ${bookIdentifier}`, async ({
        bookPage,
      }) => {
        let initialBookHeight: number | undefined;
        let initialBookWidth: number | undefined;

        await test.step('Capture initial book dimensions', async () => {
          initialBookHeight = await bookPage.getBRPageBoundingBoxDimension(
            'height',
          );
          initialBookWidth = await bookPage.getBRPageBoundingBoxDimension(
            'width',
          );
        });

        await test.step('Click zoom in', async () => {
          await bookPage.clickZoomIn();
        });

        await test.step('Verify book dimensions increased', async () => {
          const zoomedInHeight = await bookPage.getBRPageBoundingBoxDimension(
            'height',
          );
          const zoomedInWidth = await bookPage.getBRPageBoundingBoxDimension(
            'width',
          );
          expect(zoomedInHeight).toBeGreaterThan(Number(initialBookHeight));
          expect(zoomedInWidth).toBeGreaterThan(Number(initialBookWidth));
        });
      });

      test(`Clicking "full screen button" and BookReader fills browser window - ${bookIdentifier}`, async ({
        bookPage,
      }) => {
        let windowHeight: number;
        let initialShellHeight: number;
        let brShellBox: Awaited<
          ReturnType<typeof bookPage.getBRShellBoundingBox>
        >;

        await test.step('Capture initial in-page shell height', async () => {
          windowHeight = await bookPage.getPageHeight();
          brShellBox = await bookPage.getBRShellBoundingBox();
          initialShellHeight = brShellBox?.height ?? 0;
          expect(initialShellHeight).toBeLessThan(windowHeight);
        });

        await test.step('Enter full screen and verify BookReader shell expands', async () => {
          await bookPage.clickFullScreen();
          brShellBox = await bookPage.getBRShellBoundingBox();
          // Non-public books may retain a borrow bar, so assert the shell grew
          // rather than requiring an exact match to window height.
          expect(brShellBox?.height).toBeGreaterThan(initialShellHeight);
        });

        await test.step('Exit full screen and verify BookReader shell returns to in-page height', async () => {
          await bookPage.clickExitFullScreen();
          brShellBox = await bookPage.getBRShellBoundingBox();
          expect(brShellBox?.height).toBeLessThan(windowHeight);
        });
      });
    });
  });
});
