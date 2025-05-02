import { test } from '../fixtures';

import { identifier } from '../../config';

// Parameterized test: https://playwright.dev/docs/test-parameterize
const sampleBooks = [
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
  for (const { bookIdentifier, isPublic } of sampleBooks) {
    test(`Canonical URL has no initial parameters - ${bookIdentifier}`, async ({ bookPage }) => {
      await bookPage.goToPage(bookIdentifier);
      await bookPage.assertUrlInitialParameters();
    });
    
    test.describe('Book navigations', () => {
      test(`On load, pages fit fully inside of the BookReader™ - ${bookIdentifier}`, async ({
        bookPage,
      }) => {
        await bookPage.goToPage(bookIdentifier);
        await bookPage.assertPageBoundingBox();
      });
      
      test(`Nav menu displays properly - ${bookIdentifier}`, async ({
        bookPage,
      }) => {
        await bookPage.goToPage(bookIdentifier);
        await bookPage.bookReader.assertNavigationElements(isPublic);
      });
  
      test(`2up mode - Clicking "Previous page" changes the page - ${bookIdentifier}`, async ({
        bookPage,
      }) => {
        await bookPage.goToPage(bookIdentifier);
        await bookPage.assertBookPageChange(isPublic);
      });

      test(`Clicking "page flip buttons" updates location - ${bookIdentifier}`, async ({
        bookPage,
      }) => {
        await bookPage.goToPage(bookIdentifier);
        await bookPage.assertPageFlipUpdateUrlLocation();
      });
    })
  }
});
