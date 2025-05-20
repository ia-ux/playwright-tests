import { test, expect } from '../../tests/fixtures';

test(`Collections basic display - use collection page layout`, async ({
  collectionPage,
}) => {
  await test.step(`Check if collection thumbnail, summary and action bar appears`, async () => {
    await expect(collectionPage.pageHeader).toBeVisible();
    await expect(collectionPage.topMatterFrame).toBeVisible();
    await expect(collectionPage.pageSummary).toBeVisible();
    await expect(collectionPage.actionBar).toBeVisible();
  });

  await test.step(`Check if Collection | About | Forum tabs are displayed`, async () => {
    await expect(collectionPage.pageTabs).toBeVisible();
    // this could cause an error in some detailsPage that doesn't have Forum tab like ytjdradio
    // should be tackled in a different task
    await expect(collectionPage.pageTabs.getByLabel('Collection', { exact: true })).toBeVisible();
    await expect(collectionPage.pageTabs.getByLabel('Forum')).toBeVisible();
    await expect(collectionPage.pageTabs.getByLabel('About')).toBeVisible();
  });
});

test(`Collections page - "More..." link to About tab appears below description`, async ({
  collectionPage,
}) => {  
  await test.step(`Go to "ytjdradio" collection page`, async () => {
    await collectionPage.visit('ytjdradio');
  });

  await test.step(`Click the "More..." link and check if About page is displayed`, async () => {
    await collectionPage.clickMoreBtnFromSummary();
    await expect(collectionPage.aboutPageActivity).toBeVisible();
    await expect(collectionPage.aboutPageCollectionInfo).toBeVisible();
    expect(await collectionPage.getPageActiveTabText()).toContain('ABOUT');
  });
});

test(`Tab navigation`, async ({ collectionPage }) => {
  test.info().annotations.push({
    type: 'Test',
    description: "Need to consider that other collections don't have Forums page like `ytjdradio`",
  });

  await test.step(`Click "About" tab button and check if About page is displayed in "oldtimeradio" collection page`, async () => {
    await collectionPage.clickCollectionTab('About');
    expect(await collectionPage.getPageActiveTabText()).toContain('ABOUT');
    await expect(collectionPage.aboutPageActivity).toBeVisible();
    await expect(collectionPage.aboutPageCollectionInfo).toBeVisible();
  });

  await test.step(`Click "Forum" tab button and check if Forum page is displayed in "oldtimeradio" collection page`, async () => {
    await collectionPage.clickCollectionTab('Forum');
    expect(await collectionPage.getPageActiveTabText()).toContain('FORUM');
    await expect(collectionPage.forumContainer).toBeVisible();
    await expect(collectionPage.newPostButton).toBeVisible();
    await expect(collectionPage.rssButton).toBeVisible();
  });

  await test.step(`Click "Collection" tab button and check if Collections page is displayed in "oldtimeradio" collection page`, async () => {
    await collectionPage.clickCollectionTab('Collection');
    expect(await collectionPage.getPageActiveTabText()).toContain('COLLECTION');
    await expect(collectionPage.cbContainer).toBeVisible();
  });
});
