import { expect, Page } from '@playwright/test';
import { SortOrder, DateMetadataLabel } from './models';

export const PAGE_WAIT_TIME = 5000;

export async function gotoWithRetry(
  page: Page,
  url: string,
  options?: Parameters<Page['goto']>[1],
  maxAttempts = 3,
): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await page.goto(url, options);
      return;
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      await page.waitForTimeout(3000);
    }
  }
}

/**
 * Asserts the page title matches `pattern`, reloading up to `maxAttempts - 1`
 * times if the title hasn't updated yet. Fails the test if the title is still
 * wrong after all attempts.
 *
 * @param readinessLocator - selector to waitFor after each reload so we know
 *   the page content is ready before checking the title again.
 */
export async function assertTitleWithReload(
  page: Page,
  pattern: RegExp,
  readinessLocator: string,
  maxAttempts = 3,
): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (attempt > 1) {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page
        .locator(readinessLocator)
        .waitFor({ state: 'visible', timeout: 30000 });
    }
    try {
      await expect(page).toHaveTitle(pattern, { timeout: 15000 });
      return;
    } catch {
      if (attempt === maxAttempts) {
        throw new Error(
          `Title matching ${pattern} not found after ${maxAttempts} page load(s)`,
        );
      }
    }
  }
}

export function parseViewCount(viewStr: string): number {
  const match = viewStr.match(/^([\d.]+)([MK]?)\s/);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const suffix = match[2];
  if (suffix === 'M') return num * 1_000_000;
  if (suffix === 'K') return num * 1_000;
  return num;
}

export function viewsSorted(order: SortOrder, arr: number[]): boolean {
  if (order === 'ascending') {
    return arr.every((x, i) => i === 0 || x >= arr[i - 1]);
  } else {
    return arr.every((x, i) => i === 0 || x <= arr[i - 1]);
  }
}

export function datesSorted(
  order: SortOrder,
  arr: DateMetadataLabel[],
): boolean {
  if (order === 'ascending') {
    return arr.every(
      (x, i) => i === 0 || new Date(x.date) >= new Date(arr[i - 1].date),
    );
  } else {
    return arr.every(
      (x, i) => i === 0 || new Date(x.date) <= new Date(arr[i - 1].date),
    );
  }
}
