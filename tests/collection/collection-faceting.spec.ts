import { test, expect } from '../../tests/fixtures';

import {
  CollectionFacetGroupHeaderNames,
  FacetGroup,
  LayoutViewModeLocator
} from '../../tests/models';

test(`Verify if facets appear on first load`, async ({ collectionPage }) => {
  await test.step('Assert facet group headers count', async () => {
    for (const header of CollectionFacetGroupHeaderNames) {
      const facet = collectionPage.collectionFacets.facets.getByRole(
        'heading', { name: header }
      );
      const facetText = (await facet.innerText()).replace(/\n/g, ' ');
      await expect(facet).toBeVisible();
      expect(facetText).toContain(header);
    }
  });
});

test(`Select a facet for videos and clear facet filters`, async ({
  collectionPage,
}) => {
  const { collectionFacets, infiniteScroller } = collectionPage;
  await test.step(`Select "movies" from inside "Media Type" facet group and check 5 item results for "Movie" tile icon titles`, async () => {
    await collectionFacets.toggleFacetSelection(FacetGroup.MEDIATYPE, 'movies', 'positive');
    const isFacettedCorrectly = await infiniteScroller.validateIncludedFacetedResults(
      'tile-collection-icon-title', ['Movie'], true, 5,
    );
    expect(isFacettedCorrectly).toBeTruthy();
  });

  await test.step(`Click "Clear all filters"`, async () => {
    await collectionFacets.clickClearAllFilters();
    await expect(collectionFacets.btnClearAllFilters).not.toBeVisible();
  });
});

test(`Select Year Published range via date picker`, async ({
  collectionPage,
}) => {
  const { collectionFacets, infiniteScroller } = collectionPage;
  await test.step(`Enter 2014 in start date text field (leftmost text box) and new results will be loaded`, async () => {
    await expect(collectionFacets.yearPublishedFacetGroup).toBeVisible();
    await collectionFacets.fillUpYearFilters('1954', '1955');
    await expect(collectionFacets.resultsTotal).toBeVisible();
  });

  await test.step(`Switch to list view mode to check the first 10 item results Published texts are ONLY 2014 or 2015`, async () => {
    await infiniteScroller.clickViewMode(LayoutViewModeLocator.LIST);
    const isFacettedCorrectly = await infiniteScroller.validateIncludedFacetedResults(
      'list-date', ['1954', '1955'], true, 10,
    );
    expect(isFacettedCorrectly).toBeTruthy();
  });
});

test(`Negative facet to exclude audio`, async ({ collectionPage }) => {
  const { collectionFacets, infiniteScroller } = collectionPage;
  await test.step(`Select "eye" icon near "audio" from inside "Media Type" facet group and check if there's no results with "Audio" tile icon title`, async () => {
    await collectionFacets.toggleFacetSelection(FacetGroup.MEDIATYPE, 'audio', 'negative');
    const isFacettedCorrectly = await infiniteScroller.validateIncludedFacetedResults(
      'tile-collection-icon-title', ['Audio'], false, 10,
    );
    expect(isFacettedCorrectly).toBeTruthy();
  });
});

test(`Facets can be selected via Select filters modal`, async ({ collectionPage }) => {
  const { collectionFacets, infiniteScroller } = collectionPage;
  await test.step(`Click "More" button under Subject facet group`, async () => {
    await collectionFacets.clickMoreInFacetGroup(FacetGroup.SUBJECT);
  });

  await test.step(`Select "Comedy" and "Mystery" from inside "Subject" facet group`, async () => {
    await collectionFacets.selectFacetsInModal(['Comedy', 'Mystery']);
    const isFacettedCorrectly = await infiniteScroller.validateIncludedFacetedResults(
      'tile-collection-icon-title', ['Audio'], true, 10, // select only 10 items, more than that throws an error
    );
    expect(isFacettedCorrectly).toBeTruthy();
  });
});
