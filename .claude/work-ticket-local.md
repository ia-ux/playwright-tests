# /jb:work-ticket, the playwright-tests half

What `/jb:work-ticket` reads before it claims. The pipeline is the plugin's; this
is only what's true of this repo.

Two things are different here from the other repos in the pipeline:

- **The ticket is in Jira but the PR is on GitHub.** The issue key is
  `WEBDEV-1234` and it goes in the branch name and at the front of the PR
  title, but the forge is `gh`, not `glab`. Don't reach for `glab mr` here.
- **This repo is not mine alone.** It's the shared `ia-ux` e2e suite and the
  whole UX team depends on it. A ticket reached this run because a human
  labelled it `agent-ready`; nothing else in the project is yours to touch.

## Worktree

```bash
git worktree add .claude/worktrees/$ARGUMENTS-<slug> -b $ARGUMENTS-<slug> origin/main
cd .claude/worktrees/$ARGUMENTS-<slug>
npm ci
```

`npm`, not pnpm — this repo has a `package-lock.json` and no `packageManager`
field. Note the shell here routes bare `npm` to pnpm inside pnpm projects; this
isn't one, so `npm ci` passes through untouched.

The worktree needs its own `.env`. It is gitignored and will not come across
with the branch, so copy it from the primary checkout before running anything:

```bash
cp ../../../.env .env
```

## Read first

`README.md`, then `playwright.config.ts` and `config/index.ts`. Between them
they carry the category list, the timeouts, and how `BASE_URL` is resolved.

## House rules

- **Tests are the product here.** A change that makes a test pass by loosening
  its assertion is worse than the failing test. If a test fails because the
  page genuinely changed, match the test to the new reality and say so in the
  PR. If it fails because the page is broken, that's a bug to report, not a
  test to edit.
- **Categories are directories** under `tests/`, and `scripts/executeTests.js`
  validates the name against a hardcoded list. Adding a directory without
  adding it there means the category silently runs as `all`.
- **Prettier decides formatting.** `npm run format` fixes it, `npm run lint`
  is what CI checks. Format only what you edited.
- **Code comments describe only the current state, never the past.** No
  "instead of the old…", no "we used to…".
- **No new dependency unless it's the point of the ticket.**

## Verify

Run separately rather than chained, so one failure doesn't hide the others:

```bash
npm run lint         # prettier --check over tests/
npm run typecheck    # tsc --noEmit
```

Then actually run the affected category against prod:

```bash
CATEGORY=<category> npx playwright test tests/<category> --workers=5
```

**`global-setup.ts` logs in as both `patron` and `privs` before any test
runs.** This is the single most important thing to know about verifying here.
If `.env` is missing `ARCHIVE_EMAIL` / `ARCHIVE_PASSWORD` / `PATRON_EMAIL` /
`PATRON_PASSWORD`, *nothing* runs, including categories that never touch auth.
It fails after three login retries, about 60 seconds, with an error that looks
like a test problem and isn't. Check `.env` first when a run dies early.

Run one category, not `all`. The full suite has a 45-minute `globalTimeout` and
`retries: 1`, so a full pass is most of an hour and a flaky test doubles its own
cost.

## QA

QA here is running the tests, so the verify step above is the QA. State which
category you ran, against which `BASE_URL`, and the pass/fail counts.

**Review apps don't work as a target.** `--base-url https://www-offshoot-<branch>.dev.archive.org`
fails in global setup: the review app 302s `/account/login` to
`https://archive.org/login`, so there's no auth backend on that origin and the
session never establishes. Verify against prod unless the ticket is
specifically about fixing that.

## Hazards

- **Never push to `main`, never merge your own PR.** A human merges. The PR is
  the whole output of this run.
- **`.env` is real credentials for shared test accounts and is gitignored.**
  Never commit it, never paste its values into a PR, a ticket, or a log.
- **A red CI run on this repo is not automatically your fault.** The scheduled
  BrowserStack job has been flaky, and some failures are stale assertions from
  page copy changing. Check whether the failure predates your branch before
  treating it as a regression you caused.
- **The Jira ticket belongs to a team.** Don't transition it, don't reassign
  it, don't touch its sprint or story points, and don't comment on it. Write
  status into the description's `## Agent blocked` section instead. Never move
  it to Code Review; that's a human's call.
- **Verify the assignee is exactly Jason before claiming, every time.** Seeing
  a different assignee is a hard stop, not something to note and proceed past.
