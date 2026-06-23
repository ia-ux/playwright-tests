# Agent Instructions — playwright-tests

Playwright E2E test suite for Archive.org. Uses the Page Object Model, custom fixtures, and runs on BrowserStack in CI.

## Key files

| File | Purpose |
|------|---------|
| `playwright.config.ts` | Timeouts, reporters, browser projects |
| `global-setup.ts` | Pre-test auth: logs in patron and admin, saves state to `.auth/` |
| `config/index.ts` | `baseURL`, credentials, page identifiers — reads from `.env` |
| `tests/fixtures.ts` | Custom fixtures extending Playwright's `base.test` |
| `tests/models.ts` | Shared types/enums (`SortFilter`, `UserType`, `LayoutViewModeLocator`, ...) |
| `tests/utils.ts` | Shared helpers (`gotoWithRetry`, `assertTitleWithReload`, `parseViewCount`, ...) |
| `tests/page-objects/` | One class per page/component |
| `tests/<category>/` | Spec files grouped by product area |

## Non-negotiable rules

### 1. Page load: always `domcontentloaded`

```ts
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForURL(pattern, { waitUntil: 'domcontentloaded' });
```

`'load'` waits for all resources including audio/video/PDFs — hangs for minutes on archive.org pages, causes BrowserStack idle timeouts.

### 2. `waitFor()` always needs explicit timeout

```ts
await locator.waitFor({ state: 'visible', timeout: 30000 });
```

Never omit `timeout`. Use `30000` for most waits, `60000` for slow operations.

### 3. `networkidle` must have timeout + catch

```ts
await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
```

Media-heavy pages never reach networkidle. The catch prevents test failure.

### 4. Assertions use `toBeVisible()`, not `isVisible()`

```ts
await expect(locator).toBeVisible();       // auto-retries up to 60s ✓
expect(await locator.isVisible()).toBe(true); // immediate, no retry ✗
```

`isVisible()` is only for conditional branching (`if (await x.isVisible()) { ... }`).

### 5. Read text after confirming visibility

```ts
await expect(el).toBeVisible();   // wait first
const text = await el.innerText(); // then read
```

`innerText()` is immediate — calling it before `toBeVisible()` throws if the element isn't in the DOM yet.

### 6. Use `.first()` when a locator can match multiple elements

```ts
page.locator('dropdown-search-bar').first()
```

Omitting `.first()` on a multi-match locator causes a Playwright strict mode violation.

### 7. Block tracking scripts in every fixture

```ts
// In fixtures.ts
await page.route(/(analytics|fonts|googletag|doubleclick|adservice)/, route => route.abort());

// In spec beforeEach blocks
await page.route(/(analytics|fonts|googletag|doubleclick)/, route => route.abort());
```

Without this, third-party requests slow page load and trigger BrowserStack timeouts.

## Writing tests

- Import `{ test, expect }` from `'../fixtures'`, not `@playwright/test`
- Use the appropriate fixture from `fixtures.ts` as the test parameter
- Navigate inside the fixture or spec `beforeEach`, not in individual test bodies
- After clicking something that triggers navigation, call `await page.waitForLoadState('domcontentloaded')` before asserting on the new page

## Auth fixtures

Tests needing a logged-in user use these fixtures from `fixtures.ts`:
- `patronDetailsPage` — patron session (`storageState: '.auth/patron.json'`)
- `adminDetailsPage` — admin/privs session (`storageState: '.auth/admin.json'`)

Session files are written by `global-setup.ts` before tests start.

## Running tests (container — preferred)

```bash
# Rebuild after any source file change (source is baked into the image)
podman compose build playwright

# Run by category
podman compose run --rm playwright npm run test -- --test=search

# Run by title
podman compose run --rm playwright npm run test -- --title="Clicking on an item tile"
```

## Running tests (local npm)

```bash
npm run test -- --test=about
npx playwright test tests/search/search-layout.spec.ts
```
