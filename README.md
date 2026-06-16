![Build Status](https://github.com/internetarchive/archiveorg-e2e-tests/actions/workflows/main.yml/badge.svg)

# End to end tests for Archive.org using [Playwright](https://playwright.dev/)

## Setup

Copy `.env.sample` to `.env` and fill in your credentials:

```bash
cp .env.sample .env
```

## Running tests with Docker or Podman

Containers are the recommended way to run tests — no local browser install needed. Both Docker and Podman are supported using the same `docker-compose.yml`. In every command below, swap `docker` for `podman` to use Podman instead.

**Podman first-time setup** (macOS only — required once):

```bash
podman machine init
podman machine start
```

On subsequent sessions, just run `podman machine start` before running tests.

### Local Playwright tests (Chromium inside container)

```bash
# Run all tests
docker compose run --rm playwright
podman compose run --rm playwright

# Run a specific category
docker compose run --rm -e CATEGORY=about playwright
podman compose run --rm -e CATEGORY=about playwright
```

### BrowserStack tests (remote browsers on BrowserStack)

Requires `BROWSERSTACK_USERNAME` and `BROWSERSTACK_ACCESS_KEY` in your `.env`.

```bash
# Run full BrowserStack suite
docker compose run --rm browserstack --workers=5 --fully-parallel
podman compose run --rm browserstack --workers=5 --fully-parallel

# Run a specific test file
docker compose run --rm browserstack npx browserstack-node-sdk playwright test tests/static/static.spec.ts --workers=5 --fully-parallel
podman compose run --rm browserstack npx browserstack-node-sdk playwright test tests/static/static.spec.ts --workers=5 --fully-parallel

# Run a specific category
docker compose run --rm browserstack npx browserstack-node-sdk playwright test tests/about --workers=3 --fully-parallel
podman compose run --rm browserstack npx browserstack-node-sdk playwright test tests/about --workers=3 --fully-parallel
```

Reports and test results are written to `./playwright-report` and `./test-results` on your host machine.

## Running tests locally (NPM)

Install dependencies:

```bash
npm i
npx playwright install
```

Run tests:

```bash
# All tests
npm run test

# Specific category
npm run test -- --test=about

# Specific test title
npm run test -- --title="TV has borrow button"

# Specific file
npx playwright test tests/search/search-layout.spec.ts
```

### Options

| Flag | Description |
|------|-------------|
| `--test=<category>` | Run tests from a specific folder under `tests/` |
| `--title="<name>"` | Run tests matching a title |
| `--browser=chromium\|firefox\|webkit` | Run in a specific browser |
| `--headed` | Show the browser window |
| `--debug` | Open Playwright Inspector |
| `--ui` | Open Playwright UI mode |
| `--trace` | Record trace for the report |

## BrowserStack (without Docker)

```bash
./run-browserstack-tests.sh
```

## View test report

```bash
npm run show:report
```

## VSCode

Install the [Playwright plugin](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) to run and debug individual tests from the editor.

## Reference

- <https://playwright.dev/docs/pom>
- <https://ray.run/blog/mastering-poms>
