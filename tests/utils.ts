import { expect, Page, TestInfo } from '@playwright/test';
import { SortOrder, DateMetadataLabel } from './models';

export const PAGE_WAIT_TIME = 5000;

/**
 * True when this test is driving a remote BrowserStack browser rather than a
 * local one. The BrowserStack SDK rewrites the Playwright config to connect
 * over a websocket at its grid, so `connectOptions.wsEndpoint` is set there
 * and absent on every local or container run. Checking for the BrowserStack
 * credentials instead would not work — `.env.sample` puts them in the local
 * environment too.
 *
 * Use it to gate the handful of tests that need behaviour the grid does not
 * allow, rather than skipping them everywhere.
 */
export function isRemoteBrowserStackRun(testInfo: TestInfo): boolean {
  const endpoint = testInfo.project.use.connectOptions?.wsEndpoint ?? '';
  return /browserstack/i.test(endpoint);
}

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

/**
 * Parse a date string from archive.org list-view metadata.
 * Year-only values (e.g. "0", "19", "666") must be handled explicitly because
 * JavaScript's Date constructor misinterprets small integers:
 *   new Date('19')  → Invalid Date
 *   new Date('0')   → year 2000 (wrong)
 * Using setFullYear avoids these issues.
 */
function parseDateString(dateStr: string): Date {
  const trimmed = (dateStr ?? '').trim();
  if (/^\d+$/.test(trimmed)) {
    const d = new Date(0);
    d.setFullYear(parseInt(trimmed, 10), 0, 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  return new Date(trimmed);
}

export function datesSorted(
  order: SortOrder,
  arr: DateMetadataLabel[],
): boolean {
  if (order === 'ascending') {
    return arr.every(
      (x, i) =>
        i === 0 || parseDateString(x.date) >= parseDateString(arr[i - 1].date),
    );
  } else {
    return arr.every(
      (x, i) =>
        i === 0 || parseDateString(x.date) <= parseDateString(arr[i - 1].date),
    );
  }
}
