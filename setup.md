# Setup Guide — iaux-e2e-playwright-tests

Playwright end-to-end test suite for [archive.org](https://archive.org), targeting UI functionality across multiple page categories.

---

## Prerequisites

- **Node.js** v18+ (LTS recommended)
- **npm** v8+
- A valid [archive.org](https://archive.org) account (patron and/or privileged)

---

## Installation

```bash
# Clone the repository
git clone <repo-url>
cd playwright-tests

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

---

## Environment Configuration

Copy the sample env file and fill in credentials:

```bash
cp .env.sample .env
```

Edit `.env` with the following variables:

````markdown
| Variable                  | Description                                | Default              |
|---------------------------|--------------------------------------------|----------------------|
| `BASE_URL`                | Target site URL                            | `https://archive.org`|
| `ARCHIVE_EMAIL`           | Privileged account email                   | —                    |
| `ARCHIVE_PASSWORD`        | Privileged account password                | —                    |
| `PATRON_EMAIL`            | Patron (regular user) email                | —                    |
| `PATRON_PASSWORD`         | Patron account password                    | —                    |
| `IS_REVIEW_APP`           | Set `true` for review/staging apps         | `false`              |
| `BETA_ACCESS_TOKEN`       | Required when `IS_REVIEW_APP=true`         | —                    |
| `CATEGORY`                | Default test category to run               | `all`                |
| `BROWSERSTACK_USERNAME`   | BrowserStack username (CI only)            | —                    |
| `BROWSERSTACK_ACCESS_KEY` | BrowserStack access key (CI only)          | —                    |
| `SLACK_WEBHOOK_URL`       | Slack webhook for notifications (CI only)  | —                    |
````
---

## Running Tests

### Run all tests

```bash
npm test
```

### Run a specific category

```bash
npm test -- --test=<category>
```

Available categories: `about`, `av`, `books`, `collection`, `details`, `home`, `legal`, `login`, `music`, `profile`, `search`, `static`

### Filter by test title

```bash
npm test -- --title="<test name substring>"
```

### Run with a specific browser

```bash
npm test -- --browser=<chromium|firefox|webkit>
```

### Additional flags

| Flag | Description |
|---|---|
| `--headed` | Show browser window during test run |
| `--debug` | Open Playwright debugger |
| `--ui` | Open Playwright UI mode |
| `--trace` | Record a trace for each test |

### Examples

```bash
# Run search tests in headed mode
npm test -- --test=search --headed

# Run book tests in Firefox with trace
npm test -- --test=books --browser=firefox --trace

# Run all tests matching a title
npm test -- --title="facet"
```

---

## Viewing Reports

After a test run, HTML reports are saved to `playwright-report/<category>/<timestamp>/`.

To serve and open a report:

```bash
npm run show:report
# Then open http://localhost:8080 in your browser
```

---

## Project Structure

```
playwright-tests/
├── config/
│   └── index.ts              # Base URL, credentials, test identifiers per feature
├── scripts/
│   ├── executeTests.js        # CLI test runner — parses args, builds Playwright command
│   └── generateCommand.js     # Helper to generate npm test commands
├── tests/
│   ├── fixtures.ts            # Playwright fixtures (page objects, login helpers)
│   ├── models.ts              # TypeScript types and enums
│   ├── utils.ts               # Shared utility functions
│   ├── page-objects/          # Page Object Model (POM) classes (18 files)
│   ├── about/                 # About page tests
│   ├── av/                    # Audio/Video page tests
│   ├── books/                 # Book reader tests
│   ├── collection/            # Collection page tests (layout, search, facets)
│   ├── details/               # Item details page tests
│   ├── home/                  # Home page tests
│   ├── legal/                 # Legal page tests
│   ├── openlibrary/           # OpenLibrary login tests
│   ├── profile/               # Profile page tests
│   ├── search/                # Search page tests (layout, facets, results)
│   └── static/                # Static resource page tests
├── _to-fix/                   # Tests temporarily disabled pending fixes
├── .github/workflows/         # CI/CD workflows (GitHub Actions)
├── playwright.config.ts       # Playwright configuration
├── browserstack.yml           # BrowserStack cloud test configuration
├── .env.sample                # Environment variable template
└── run-browserstack-tests.sh  # Script for running tests via BrowserStack
```

---

## Playwright Configuration Highlights

Defined in [playwright.config.ts](playwright.config.ts):

- **Default browser**: Chromium (Firefox, WebKit, Edge available — uncomment in config)
- **Workers**: 10 (parallel test execution)
- **Retries**: 3 per failing test
- **Test timeout**: 10 minutes per test
- **Global timeout**: 30 minutes for full suite
- **Screenshots**: Captured on failure only
- **Reports**: HTML, saved to `playwright-report/`

---

## Development

### Type checking

```bash
npm run typecheck
```

### Format code

```bash
npm run format
```

### Check formatting

```bash
npm run lint
```

### Code generation (record interactions)

```bash
npm run test:codegen
```

### Debug with browser logs

```bash
npm run test:debugbrowser
```

---

## CI/CD

Tests run automatically via GitHub Actions on push and pull requests to `main`.

The CI pipeline:
1. Installs dependencies
2. Sets up BrowserStack environment
3. Runs tests via `./run-browserstack-tests.sh`
4. Sends a Slack notification with pass/fail/timeout status

Reusable workflow: [.github/workflows/call-run-browserstack.yml](.github/workflows/call-run-browserstack.yml)

---

## Review / Staging App Testing

When testing against a review or staging app, set these in `.env`:

```env
IS_REVIEW_APP=true
BASE_URL=https://<your-review-app-url>
BETA_ACCESS_TOKEN=<your-token>
```

The `testBeforeEachConfig()` helper in [config/index.ts](config/index.ts) will automatically inject the `beta-access` cookie before each test when `IS_REVIEW_APP=true`.

---

## Known Issues

- Profile page tests (`profile-page.spec.ts`, `profile-page-uploads-facets.spec.ts`) are currently under `_to-fix/` and are excluded from the default test run.
