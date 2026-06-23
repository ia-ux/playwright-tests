# Claude Code Instructions — playwright-tests

Playwright E2E test suite for [Archive.org](https://archive.org). Tests run locally via Chromium or remotely via BrowserStack.

## Running tests

Always prefer the container workflow — it avoids browser installation and matches CI exactly.

```bash
# Build image after any source change (source is baked in, not mounted)
podman compose build playwright

# Run a category
podman compose run --rm playwright npm run test -- --test=about
podman compose run --rm playwright npm run test -- --test=search

# Run by title
podman compose run --rm playwright npm run test -- --title="Clicking on an item tile"

# Run without container (requires local Playwright install)
npm run test -- --test=about
npx playwright test tests/search/search-layout.spec.ts
```

**Important:** Source files are baked into the Docker image at build time, not volume-mounted. After editing any `.ts` file, run `podman compose build playwright` before running tests or your changes won't be picked up.

## Project structure

```
tests/
  <category>/          # Spec files grouped by area (about, av, books, search, ...)
  page-objects/        # Page Object Model classes
  fixtures.ts          # Custom Playwright fixtures (extend base test)
  models.ts            # Shared types and enums
  utils.ts             # Shared helpers (gotoWithRetry, assertTitleWithReload, ...)
config/index.ts        # baseURL, credentials, identifiers (reads from .env)
global-setup.ts        # Runs once before all tests — logs in patron and admin users
playwright.config.ts   # Playwright config (timeouts, reporters, projects)
browserstack.yml       # BrowserStack platform config
```

## Critical timing rules

These rules prevent BrowserStack WebSocket idle timeouts and test flakiness.

**Always use `domcontentloaded`, never `load`:**
```ts
// CORRECT
await page.goto('/search', { waitUntil: 'domcontentloaded' });
await page.waitForURL('/details', { waitUntil: 'domcontentloaded' });

// WRONG — 'load' waits for all resources (images, audio) and can hang for minutes
await page.goto('/search', { waitUntil: 'load' });
```

**All `waitFor()` calls need an explicit timeout:**
```ts
// CORRECT
await locator.waitFor({ state: 'visible', timeout: 30000 });
await locator.waitFor({ state: 'attached', timeout: 60000 });

// WRONG — omitting timeout relies on actionTimeout which may be overridden
await locator.waitFor({ state: 'visible' });
```

**`networkidle` must always have a timeout and catch:**
```ts
// CORRECT
await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

// WRONG — networkidle can hang indefinitely on media-heavy pages
await page.waitForLoadState('networkidle');
```

## Assertion patterns

**Use `toBeVisible()` for assertions, `isVisible()` only for branching:**
```ts
// CORRECT — auto-retries up to expect.timeout (60s)
await expect(locator).toBeVisible();

// WRONG — isVisible() is immediate, no retry
expect(await locator.isVisible()).toBeTruthy();
```

**Wait for visibility before reading text:**
```ts
// CORRECT — toBeVisible() auto-retries, then innerText() reads safely
await expect(facet).toBeVisible();
const text = await facet.innerText();

// WRONG — innerText() is immediate; throws if element not yet in DOM
const text = await facet.innerText();
await expect(facet).toBeVisible();
```

**Use `.first()` when a locator may match multiple elements:**
```ts
// CORRECT — prevents strict mode violations
const bar = page.locator('dropdown-search-bar').first();

// WRONG — throws "strict mode violation: resolved to N elements"
const bar = page.locator('dropdown-search-bar');
```

## Route blocking

Block third-party scripts in every fixture and relevant `beforeEach`. Without this, googletag/doubleclick add network requests that trigger BrowserStack socket idle timeouts.

**In fixtures.ts** — full pattern:
```ts
await page.route(/(analytics|fonts|googletag|doubleclick|adservice)/, route => route.abort());
```

**In spec `beforeEach` blocks** — shorter pattern (adservice not needed):
```ts
await page.route(/(analytics|fonts|googletag|doubleclick)/, route => route.abort());
```

## Authentication

`global-setup.ts` runs once before all tests and logs in two users:
- `patron` → `.auth/patron.json`
- `privs` (admin) → `.auth/admin.json`

Fixtures that need auth use `storageState`:
```ts
const context = await browser.newContext({ storageState: '.auth/admin.json' });
```

Credentials come from `.env` via `config/index.ts`. Copy `.env.sample` to `.env` to set up locally.

## Adding new tests

1. Create a spec file under `tests/<category>/`
2. Import `{ test, expect }` from `'../fixtures'` (not from `@playwright/test`)
3. Use an existing fixture from `fixtures.ts` or add a new one there
4. Use page objects from `tests/page-objects/` — add new ones for new pages
5. Apply all timing, assertion, and route-blocking rules above

## CI / BrowserStack

Tests run on BrowserStack via GitHub Actions (`.github/workflows/`). Three triggers:
- Push/PR to `main` → `main.yml`
- Repository dispatch webhook → `trigger-from-webhook.yml`
- Scheduled → `scheduled-testrun.yml`

All workflows share a `browserstack-tests` concurrency group to prevent overlapping runs.
