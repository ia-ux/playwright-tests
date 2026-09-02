import { test, expect } from '../fixtures';
import { SearchFacetGroupHeaderNames } from '../models';

test(`Profile Page - Uploads: facets appear`, async ({
  profilePageUploads,
}) => {
  await test.step(`Check if date picker appears`, async () => {
    await expect(
      profilePageUploads.collectionFacets.yearPublishedFacetGroup,
    ).toBeVisible({
      timeout: 60000,
    });
  });

  await test.step(`Check if facet groups appear`, async () => {
    for (const header of SearchFacetGroupHeaderNames) {
      const facet = profilePageUploads.collectionFacets.facets.getByRole(
        'heading',
        { name: header },
      );
      // toBeVisible() first: innerText() is immediate and throws (or reads a
      // stale empty string) if the heading has not rendered yet.
      await expect(facet).toBeVisible();
      const facetText = (await facet.innerText()).replace(/\n/g, ' ');
      expect(facetText).toContain(header);
    }
  });
});
