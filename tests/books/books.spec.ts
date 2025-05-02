// This is a parameterized test so we can test different books in 1 test
// more details here: https://playwright.dev/docs/test-parameterize
import { test, expect } from '../fixtures';

import { identifier } from '../../config';

const testBooks = [
  { 
    bookIdentifier: identifier.books.default,
    isPublic: true 
  },
  { 
    bookIdentifier: identifier.books.with_dot_sample,
    isPublic: false
  } 
]

testBooks.forEach(({ bookIdentifier, isPublic }) => {
  test.describe('BookReader Tests', () => {
    test.beforeEach(async ({ bookPage }) => {
      await bookPage.goToPage(bookIdentifier);
    });

    test.skip(`Canonical URL has no initial parameters - ${bookIdentifier}`, async ({ bookPage }) => {
      const pageHash = await bookPage.getPageHash();
      const pageUrl = await bookPage.getPageUrl();

      // Initial URL has no params and has no page/ mode/
      expect(pageHash).toEqual('');
      expect(pageUrl).not.toEqual('#page/');
      expect(pageUrl).not.toContain('/page/');
      expect(pageUrl).not.toContain('/mode/');
    });
    
    test.describe('Book navigations', () => {
      test.skip(`On load, pages fit fully inside of the BookReader™ - ${bookIdentifier}`, async ({ bookPage }) => {
        const brShellBox = await bookPage.getBRShellPageBoundingBox();
        const brContainerBox = await bookPage.getBRContainerPageBoundingBox();
        // images do not get cropped vertically
        expect(brContainerBox?.height).toBeLessThanOrEqual(Number(brShellBox?.height));
        // images do not get cropped horizontally
        expect(brContainerBox?.width).toBeLessThanOrEqual(Number(brShellBox?.width));
      });
      
      test.skip(`Nav menu displays properly - ${bookIdentifier}`, async ({ bookPage }) => {
        // book flipping elements
        await expect(bookPage.bookReader.brFlipPrev).toBeVisible();
        await expect(bookPage.bookReader.brFlipNext).toBeVisible();
        // zoom elements
        await expect(bookPage.bookReader.brZoomIn).toBeVisible();
        await expect(bookPage.bookReader.brZoomOut).toBeVisible();
        // view modes
        await expect(bookPage.bookReader.brOnePage).toBeVisible();
        await expect(bookPage.bookReader.brTwoPage).toBeVisible();
        await expect(bookPage.bookReader.brThumb).toBeVisible();
        await expect(bookPage.bookReader.brFullScreen).toBeVisible();

        if (isPublic) {
          await expect(bookPage.bookReader.brReadAloud).toBeVisible();
        } else {
          await expect(bookPage.bookReader.brReadAloud).not.toBeVisible();
        }
      });
  
      test.skip(`2up mode - Clicking "Previous page" changes the page - ${bookIdentifier}`, async ({ bookPage }) => {
        // TODO
        await bookPage.assertBookPageChange(isPublic);
      });

      test.skip(`Clicking "page flip buttons" updates URL location - ${bookIdentifier}`, async ({ bookPage }) => {
        await bookPage.flipToNextPage();
        expect(await bookPage.isPageInUrl()).toEqual(true);
        expect(await bookPage.isModeInUrl('2up')).toEqual(true);

        await bookPage.flipToPrevPage();
        expect(await bookPage.isPageInUrl()).toEqual(false);
        expect(await bookPage.isModeInUrl('2up')).toEqual(true);
      });

      test(`Clicking "1 page view" brings up 1 page at a time - ${bookIdentifier}`, async ({ bookPage }) => {
        await bookPage.flipToNextPage();
        await bookPage.bookReader.clickOneUpMode();
        const count = await bookPage.bookReader.getVisiblePageCount();
        expect(count).toEqual(1);
      });

      test(`Clicking "2 page view" brings up 2 pages at a time - ${bookIdentifier}`, async ({ bookPage }) => {
        await bookPage.flipToNextPage();
        await bookPage.bookReader.clickTwoUpMode();
        const count = await bookPage.bookReader.getVisiblePageCount();
        expect(count).toEqual(2);
      });

      test(`Clicking "thumbnail view" brings up all of the page thumbnails - ${bookIdentifier}`, async ({ bookPage }) => {
        await bookPage.bookReader.clickThumbnailMode();
        const count = await bookPage.bookReader.getBrContainerPageLoadedCount();
        expect(count).toBeGreaterThanOrEqual(3);
      });
    })
  });
});
