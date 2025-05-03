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

    test(`Canonical URL has no initial parameters - ${bookIdentifier}`, async ({ bookPage }) => {
      const pageHash = await bookPage.getPageHash();
      const pageUrl = await bookPage.getPageUrl();

      // Initial URL has no params and has no page/ mode/
      expect(pageHash).toEqual('');
      expect(pageUrl).not.toEqual('#page/');
      expect(pageUrl).not.toContain('/page/');
      expect(pageUrl).not.toContain('/mode/');
    });
    
    test.describe('Book navigations', () => {
      test(`On load, pages fit fully inside of the BookReader™ - ${bookIdentifier}`, async ({ bookPage }) => {
        const brShellBox = await bookPage.getBRShellPageBoundingBox();
        const brContainerBox = await bookPage.getBRContainerPageBoundingBox();
        // images do not get cropped vertically
        expect(brContainerBox?.height).toBeLessThanOrEqual(Number(brShellBox?.height));
        // images do not get cropped horizontally
        expect(brContainerBox?.width).toBeLessThanOrEqual(Number(brShellBox?.width));
      });
      
      test(`Nav menu displays properly - ${bookIdentifier}`, async ({ bookPage }) => {
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
  
      test(`2up mode - Clicking "Previous page" changes the page - ${bookIdentifier}`, async ({ bookPage }) => {
        // Flip to next page 2 times, so we can go previous if at front cover
        await bookPage.flipToNextPage();
        await bookPage.flipToNextPage();
        const initialImages = await bookPage.getPageImages();
        const origImg1Src = await initialImages.nth(0).getAttribute('src');
        const origImg2Src = await initialImages.nth(-1).getAttribute('src');
        console.log('orgS1: ', origImg1Src, ' orgS2: ', origImg2Src);

        await bookPage.flipToPrevPage();
        const prevImages = await bookPage.getPageImages();
        const prevImg1Src = await prevImages.nth(0).getAttribute('src');
        const prevImg2Src = await prevImages.nth(-1).getAttribute('src');
        console.log('prvS1: ', prevImg1Src, ' prvS2: ', prevImg2Src);

        // Check if we aren't showing the same image in both leaves
        expect(origImg1Src).not.toEqual(origImg2Src);
        // Check if the new pages are different from the original pages
        expect(prevImg1Src).not.toEqual(origImg1Src);
        expect(prevImg1Src).not.toEqual(origImg2Src);
        // Check if the second new page is different from the first new page
        if (isPublic) {
          expect(prevImg2Src).not.toEqual(origImg1Src);
        } else {
          // TODO: some private books shows Limited preview page 
        }
        // Check if the new pages are different from each other
        expect(prevImg2Src).not.toEqual(origImg2Src);
        expect(prevImg1Src).not.toEqual(prevImg2Src);
      });

      test(`Clicking "page flip buttons" updates URL location - ${bookIdentifier}`, async ({ bookPage }) => {
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
