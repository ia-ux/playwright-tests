import { Page, Locator } from '@playwright/test';
import { FacetGroup, FacetType } from '../models';

export class CollectionFacets {
  readonly page: Page;
  readonly facets: Locator;
  readonly modalManager: Locator;
  readonly moreFacetsContent: Locator;
  readonly btnClearAllFilters: Locator;
  readonly resultsTotal: Locator;
  readonly yearPublishedFacetGroup: Locator;

  constructor(page: Page) {
    this.page = page;
    this.facets = page.locator('collection-facets');
    this.modalManager = page.locator('modal-manager');
    this.moreFacetsContent = page.locator('more-facets-content');
    this.btnClearAllFilters = page.locator(
      '#facets-header-container div.clear-filters-btn-row button',
    );
    this.resultsTotal = page.getByTestId('results-total');
    this.yearPublishedFacetGroup = page.getByTestId(
      'facet-group-header-label-date-picker',
    );
  }

  async clickClearAllFilters() {
    await this.btnClearAllFilters.waitFor({ state: 'visible' });
    await this.btnClearAllFilters.click();
  }

  async datePickerVisible() {
    await this.yearPublishedFacetGroup.waitFor({ state: 'visible' });
  }

  async toggleFacetSelection(
    group: FacetGroup,
    selectedFacetLabel: string,
    facetType: FacetType,
  ) {
    const facetGroupContent = await this.getFacetGroupContent(group);
    if (facetGroupContent) {
      const facetRows = await facetGroupContent.locator('facet-row').all();
      for (const facetRow of facetRows) {
        const facetCheckbox = facetRow.locator(
          'div.facet-row-container > div.facet-checkboxes',
        );
        const facetRowCheckbox =
          facetType === 'positive'
            ? facetCheckbox.getByTestId(
                `${group}:${selectedFacetLabel}-show-only`,
              )
            : facetCheckbox.getByTestId(
                `${group}:${selectedFacetLabel}-negative`,
              );
        const rowVisible = await facetRowCheckbox.isVisible();
        if (rowVisible) {
          await facetRowCheckbox.click();
          return;
        }
      }
    }
  }

  async clickMoreInFacetGroup(group: FacetGroup) {
    const facetGroupContent = await this.getFacetGroupContent(group);
    if (facetGroupContent) {
      await facetGroupContent.getByTestId('more-link-btn').click();
    }
  }

  async selectFacetsInModal(selectedFacetLabels: string[]) {
    const btnApplyFilters = this.moreFacetsContent.locator(
      '#more-facets > div.footer > button.btn.btn-submit',
    );
    await btnApplyFilters.waitFor({ state: 'visible' });
    for (const facetLabel of selectedFacetLabels) {
      const facetRow = this.moreFacetsContent
        .locator('#more-facets')
        .getByTestId(`subject:${facetLabel}-show-only`);
      await facetRow.check();
    }
    await btnApplyFilters.click();
  }

  async fillUpYearFilters(startDate: string, endDate: string) {
    const facetGroupContent = await this.getFacetGroupContent(FacetGroup.DATE);
    if (facetGroupContent) {
      const datePickerContainer = facetGroupContent.locator(
        'histogram-date-range #container > div.inner-container > #inputs',
      );
      const minYear = datePickerContainer.locator('input#date-min');
      const maxYear = datePickerContainer.locator('input#date-max');

      await minYear.fill(startDate);
      await maxYear.fill(endDate);
      await maxYear.press('Enter');
    }
  }

  async getFacetGroupContent(group: FacetGroup): Promise<Locator | null> {
    const facetGroup = this.page.getByTestId(
      `facet-group-header-label-${group}`,
    );
    if (group === FacetGroup.DATE) {
      await facetGroup.waitFor({ state: 'visible' });
      return facetGroup;
    } else {
      const facetGroupContent = facetGroup.getByTestId(
        `facet-group-content-${group}`,
      );
      const facetOnGroupContent = facetGroupContent
        .locator('facets-template')
        .getByTestId(`facets-on-${group}`);
      await facetGroupContent.waitFor({ state: 'visible' });
      await facetOnGroupContent.waitFor({ state: 'visible' });
      return facetGroupContent;
    }
  }
}
