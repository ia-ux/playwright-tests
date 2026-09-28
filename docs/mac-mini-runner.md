# Mac mini test runner

The suite runs hourly on our Mac mini in real Google Chrome, on top of the every-3-hours
BrowserStack run. The mini run is free and gives faster signal; BrowserStack still covers other
browsers and platforms.

Workflow: [.github/workflows/scheduled-local-testrun.yml](../.github/workflows/scheduled-local-testrun.yml).

## Security note

This repo is public and the workflow runs on our own hardware, so
`scheduled-local-testrun.yml` triggers on `schedule` and `workflow_dispatch` only. Don't add a
`pull_request` trigger to it. That would let anyone run whatever they want on the mini by opening a
PR from a fork. Fork PRs go to `ubuntu-latest` through `main.yml`, which is where they belong.

For the same reason, keep **Settings > Actions > General > Fork pull request workflows** set to
"Require approval for all external contributors".

## What's on the mini

- Homebrew, plus `node`, `jq`, and the Google Chrome cask.
- The GitHub Actions runner in `~/actions-runner`, registered to this repo with the labels
  `self-hosted`, `macOS`, `ARM64`, `playwright-mini`.
- The runner installed as a launchd LaunchAgent, so it starts on login and restarts if it dies.
- Automatic login enabled, and sleep disabled. The runner is a LaunchAgent, not a daemon, so it
  needs a logged-in user session to exist. Auto-login is what guarantees one after a reboot. It also
  gives Chrome a window server to talk to.

There's no `.env` on the mini. The archive.org passwords and the Slack webhook come from GitHub
secrets at job time, so there's nothing to keep in sync.

The passwords aren't stored, but live session state is. `global-setup.ts` writes
`.auth/patron.json` and `.auth/admin.json` into the workspace on every run, and `admin.json` is a
logged-in `storageState` for the privileged account. It sits on disk until the next run's checkout
clears it. Worth knowing, given the machine is also set up for unattended auto-login below. Treat
physical and network access to the mini as access to that account.

## First-time setup

Install the prerequisites:

```bash
brew install node jq
brew install --cask google-chrome
```

Get a registration token (expires after an hour) and set up the runner:

```bash
gh api -X POST repos/ia-ux/playwright-tests/actions/runners/registration-token -q .token
```

```bash
mkdir -p ~/actions-runner && cd ~/actions-runner
RUNNER_VERSION=$(gh api repos/actions/runner/releases/latest -q .tag_name | tr -d v)
curl -o actions-runner.tar.gz -L \
  "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-osx-arm64-${RUNNER_VERSION}.tar.gz"
tar xzf actions-runner.tar.gz

./config.sh --url https://github.com/ia-ux/playwright-tests \
  --token <TOKEN> \
  --name mac-mini \
  --labels playwright-mini \
  --work _work \
  --unattended --replace
```

Install and start it as a service:

```bash
./svc.sh install
./svc.sh start
./svc.sh status
```

Keep the machine awake and logged in:

```bash
sudo pmset -a sleep 0 disksleep 0 displaysleep 10 womp 1
sudo systemsetup -setrestartfreeze on
```

Then turn on automatic login in System Settings > Users & Groups > Automatic login. That part needs
the GUI; it can't be scripted without also storing the account password.

## Checking on it

```bash
# Is the runner online and idle?
gh api repos/ia-ux/playwright-tests/actions/runners -q '.runners[] | "\(.name) \(.status) busy=\(.busy)"'

# Service state and logs, on the mini
cd ~/actions-runner && ./svc.sh status
tail -f ~/actions-runner/_diag/Runner_*.log

# Kick off a run by hand
gh workflow run scheduled-local-testrun.yml --repo ia-ux/playwright-tests
```

### Reports don't persist

The HTML report lands in
`~/actions-runner/_work/playwright-tests/playwright-tests/playwright-report/mac-mini/<timestamp>/`,
but only until the next run. `actions/checkout` defaults to `clean: true`, which is
`git clean -ffdx`, and the `-x` means it deletes ignored paths too. So each run starts by wiping
the previous run's report and its failure screenshots.

To triage a failure, read the run's log in the Actions tab. Playwright's `list` reporter prints the
failing test names, the assertion errors, and stack traces there, and GitHub keeps logs for 90
days. If we ever want the HTML report and screenshots to survive, add an
`actions/upload-artifact` step rather than trying to hold them on the mini.

## When it stops running

- **No runs at all.** GitHub disables scheduled workflows after 60 days with no repo activity.
  Push something or re-enable the workflow in the Actions tab.
- **Runs queue forever.** The runner is offline. Check `./svc.sh status` on the mini. After a
  macOS update the mini can sit at the login window, which stops the LaunchAgent from loading.
- **Every run fails at the Chrome check.** Chrome got moved or uninstalled.
  `brew install --cask google-chrome`.
- **Upgrading the runner.** It self-updates. If that ever breaks, re-run the download and
  `./config.sh --replace` steps above with a fresh token.
- **Stray Chrome processes.** A run killed by `timeout-minutes` skips Playwright's browser
  shutdown, so Chrome processes and `playwright_chromiumdev_profile-*` temp dirs get left behind.
  The workflow reaps them at the start of each run, but if the mini looks loaded between runs,
  that's what to check: `pgrep -fl playwright_chromiumdev_profile`.
