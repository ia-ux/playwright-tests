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

test.describe("BookReader tests", () => {
  for (const { bookIdentifier, isPublic } of testBooks) {
    test(`Canonical URL has no initial parameters - ${bookIdentifier}`, async ({ bookPage }) => {
      await bookPage.goToPage(bookIdentifier);
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
        await bookPage.goToPage(bookIdentifier);
        const brShellBox = await bookPage.getBRShellPageBoundingBox();
        const brContainerBox = await bookPage.getBRContainerPageBoundingBox();
        // images do not get cropped vertically
        expect(brContainerBox?.height).toBeLessThanOrEqual(Number(brShellBox?.height));
        // images do not get cropped horizontally
        expect(brContainerBox?.width).toBeLessThanOrEqual(Number(brShellBox?.width));
      });
      
      test(`Nav menu displays properly - ${bookIdentifier}`, async ({ bookPage }) => {
        await bookPage.goToPage(bookIdentifier);
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
  
      test(`2up mode - Clicking "Previous page" changes the page - ${bookIdentifier}`, async ( { bookPage }) => {
        await bookPage.goToPage(bookIdentifier);
        // TODO
        await bookPage.assertBookPageChange(isPublic);
      });

      test(`Clicking "page flip buttons" updates URL location - ${bookIdentifier}`, async ({ bookPage }) => {
        await bookPage.goToPage(bookIdentifier);
        await bookPage.flipToNextPage();
        expect(await bookPage.isPageInUrl()).toEqual(true);
        expect(await bookPage.isModeInUrl('2up')).toEqual(true);

        await bookPage.flipToPrevPage();
        expect(await bookPage.isPageInUrl()).toEqual(false);
        expect(await bookPage.isModeInUrl('2up')).toEqual(true);
      });
    })
  }
});
