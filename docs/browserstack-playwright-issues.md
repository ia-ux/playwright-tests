# BrowserStack + Playwright: Known Issues and Workarounds

A running log of issues encountered running Playwright e2e tests against archive.org via BrowserStack.

---

## 1. Local browser installation breaks on macOS

### Problem
`npx playwright install` does not reliably install all required binaries on macOS. Specifically, Playwright 1.49+ requires both `chromium` and `chromium_headless_shell` — but the install command sometimes downloads only one, leaving the other missing:

```
Error: browserType.launch: Executable doesn't exist at
/Users/.../ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-mac-arm64/chrome-headless-shell
```

The installer also uses a lockfile (`__dirlock`) that can become stale if a previous install process hung or was killed, blocking all subsequent installs:

```
Error: An active lockfile is found at:
  /Users/.../ms-playwright/__dirlock
```

### Workaround
Use Docker or Podman. The official `mcr.microsoft.com/playwright` image ships with all required browsers pre-installed for the matching version. See the README for Docker/Podman setup.

For local npm installs, set `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` in your shell profile (`~/.zshrc`) to prevent automatic browser downloads during `npm install`, and manage browsers manually with `npx playwright install chromium-headless-shell` when needed.

To clear a stale lockfile manually:
```bash
rm -rf ~/Library/Caches/ms-playwright/__dirlock
```

---

## 2. Test flakiness: page title and content timing issues

### Problem
Several tests (`about`, `static`, `legal`) intermittently fail on BrowserStack because the page title or content is not yet available when the assertion runs. This happens more often on BrowserStack than locally due to network latency to remote browsers.

### Affected pages
- `/about` and sub-pages
- `/legal/` and sub-pages
- Static pages (`/bookserver`, `/scanning`, etc.)

### Workaround
Added page reloads in the test setup to ensure content is fully loaded before asserting. Not ideal — tracked as a known limitation until a proper `waitFor` solution is implemented.

Related commits: `cdd6833`, `fefb750`, `b1abf18`

---

## 3. Overlapping BrowserStack runs exhaust parallel session quota

### Problem
Multiple CI triggers (push, PR, scheduled runs, webhook) could all kick off BrowserStack sessions simultaneously, exhausting the parallel session limit and causing runs to queue or fail.

### Fix
Added a `concurrency` group (`browserstack-tests`) across all workflow triggers. Webhook-triggered runs (`trigger-from-webhook.yml`) cancel any in-progress push/PR/scheduled runs before starting, giving them highest priority.

Related commits: `8690df4`, `cbd923b`, `50e23e1`

---

## 4. BrowserStack API not immediately reflecting build status

### Problem
After tests finish, querying the BrowserStack API immediately for build status returns `running` even when the run is complete. The Slack notification step was sending incorrect statuses.

### Fix
Added a 30-second initial sleep before querying the API, then poll every 30 seconds while status is `running`. The workflow retries until a terminal status (`passed`, `failed`, `timeout`) is returned.

Related commit: `c5fbb11`, `dac19d6`

---

## 5. Socket idle errors on teardown in BrowserStack

### Problem
After tests complete, Playwright emits socket idle errors during page/context teardown when connected to BrowserStack remote browsers. These errors appear in logs but do not affect test results.

### Fix
Suppressed in test teardown. Does not impact pass/fail status.

Related commit: `ad2d38c`

---

## 6. Scheduled runs disabled

The every-3-hour scheduled test run (`scheduled-testrun.yml`) has been stopped while stability issues are being worked on.

Related commit: `31d68e3`

---

## 7. `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD` does not work via `.npmrc`

### Problem
Setting `playwright_skip_browser_download=1` in `.npmrc` triggers an npm warning and has no effect — npm does not pass unknown config keys as environment variables to postinstall scripts.

### Fix
Set the variable in your shell profile instead:
```bash
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1  # add to ~/.zshrc
```

---

## Open questions

- Should we move to a Docker-based CI runner instead of installing browsers on the ubuntu runner each time?
- Should the BrowserStack `idleTimeout` (currently 3500s) be reduced to fail faster on hung sessions?
- Can the page title timing issues be fixed with explicit `waitForLoadState('domcontentloaded')` + `waitForSelector` instead of page reloads?
