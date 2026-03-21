import { test, expect } from '../fixtures';
import { SearchFacetGroupHeaderNames } from '../models';

const UNOWNED_TABS = ['uploads', 'lists', 'posts', 'reviews', 'collections', 'web-archive'];

const TAB_LABEL: Record<string, string> = {
  uploads: 'UPLOADS',
  lists: 'LISTS',
  posts: 'POSTS',
  reviews: 'REVIEWS',
  collections: 'COLLECTIONS',
  'web-archive': 'WEB ARCHIVES',
};

test.describe('Profile Page - Basic display tests', () => {
  test(`Profiles use profile page layout`, async ({ profilePage }) => {
    await test.step(`Verify profile header and avatar are visible`, async () => {
      await expect(profilePage.profileHeader).toBeVisible();
      await expect(profilePage.thumbnailFrame).toBeVisible();
    });

    await test.step(`Verify user summary and action bar are visible`, async () => {
      await expect(profilePage.pageSummary).toBeVisible();
      await expect(profilePage.actionBar).toBeVisible();
    });

    await test.step(`Verify all tabs are present for guest user`, async () => {
      await expect(profilePage.pageTabs).toBeVisible({ timeout: 60000 });
      for (const tabId of UNOWNED_TABS) {
        await expect(profilePage.getTabById(tabId)).toBeVisible();
      }
    });
  });

  test(`Tab navigation: Click the different tabs on profile page`, async ({ profilePage }) => {
    await test.step(`Click "Uploads" tab and verify it is active with results`, async () => {
      await profilePage.clickProfileTab('uploads');
      await expect(profilePage.getTabSlot('uploads')).toBeVisible({ timeout: 1000 });
      expect(await profilePage.activeTab.innerText()).toContain(TAB_LABEL['uploads']);
      await expect(profilePage.getTabResultCount('uploads')).toBeVisible({ timeout: 100 });
    });

    await test.step(`Click "Lists" tab and verify it is active`, async () => {
      await profilePage.clickProfileTab('lists');
      await expect(profilePage.getTabSlot('lists')).toBeVisible({ timeout: 1000 });
      expect(await profilePage.activeTab.innerText()).toContain(TAB_LABEL['lists']);
    });

    await test.step(`Click "Posts" tab and verify it is active with heading`, async () => {
      await profilePage.clickProfileTab('posts');
      await expect(profilePage.getTabSlot('posts')).toBeVisible({ timeout: 1000 });
      expect(await profilePage.activeTab.innerText()).toContain(TAB_LABEL['posts']);
      expect(await profilePage.postsHeading.innerText()).toContain('Posts by');
    });

    await test.step(`Click "Reviews" tab and verify it is active with results`, async () => {
      await profilePage.clickProfileTab('reviews');
      await expect(profilePage.getTabSlot('reviews')).toBeVisible({ timeout: 1000 });
      expect(await profilePage.activeTab.innerText()).toContain(TAB_LABEL['reviews']);
      await expect(profilePage.getTabResultCount('reviews')).toBeVisible({ timeout: 100 });
    });

    await test.step(`Click "Collections" tab and verify it is active with results`, async () => {
      await profilePage.clickProfileTab('collections');
      await expect(profilePage.getTabSlot('collections')).toBeVisible({ timeout: 1000 });
      expect(await profilePage.activeTab.innerText()).toContain(TAB_LABEL['collections']);
      await expect(profilePage.getTabResultCount('collections')).toBeVisible({ timeout: 100 });
    });

    await test.step(`Click "Web Archives" tab and verify it is active with results`, async () => {
      await profilePage.clickProfileTab('web archives');
      await expect(profilePage.getTabSlot('web-archive')).toBeVisible({ timeout: 1000 });
      expect(await profilePage.activeTab.innerText()).toContain(TAB_LABEL['web-archive']);
      await expect(profilePage.getTabResultCount('web-archive')).toBeVisible({ timeout: 100 });
    });
  });
});

test.describe('Profile Page - Lists', () => {
  test(`Facets appear`, async ({ profilePage }) => {
    await test.step(`Go to @robertkeizer profile`, async () => {
      await profilePage.visit('robertkeizer');
    });

    await test.step(`Navigate to Lists tab`, async () => {
      await profilePage.clickProfileTab('lists');
    });

    await test.step(`Verify 7 facet group headers are visible`, async () => {
      for (const header of SearchFacetGroupHeaderNames) {
        const facet = profilePage.collectionFacets.facets.getByRole('heading', { name: header });
        const facetText = (await facet.innerText()).replace(/\n/g, ' ');
        await expect(facet).toBeVisible();
        expect(facetText).toContain(header);
      }
    });

    await test.step(`Verify date picker is visible`, async () => {
      await expect(profilePage.collectionFacets.yearPublishedFacetGroup).toBeVisible({
        timeout: 60000,
      });
    });
  });
});
