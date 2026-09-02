import { test } from '../fixtures';

/*
 * TODO: later we'll run these tests againsts production URL when auto-renew is moved to live.
 */
const DEMO_APP_BASE_URL =
  'https://internetarchive.github.io/iaux-book-actions/';

// Helper function to construct demo app URL with timer
const getDemoAppUrl = (timer: number) => `${DEMO_APP_BASE_URL}?timer=${timer}`;

// Loan durations in minutes.
//
// The demo app only honours `?timer=` up to 10 minutes — `?timer=60` silently
// yields a 120-second loan, so the 60-minute case asserted against a loan that
// never existed: the countdown could never reach 3600s, and fast-forwarding to
// the configured 51:10 warn point blew straight past expiry. Re-add 60 here
// once these tests move to the production URL and a real 1-hour loan exists.
const loanDurations = [5, 10];

test(`Lending-Bar: auto-renew when user click "Keep Reading" button`, async ({
  lendingBarAutoRenew,
}) => {
  for (const loanDuration of loanDurations) {
    await test.step(`${loanDuration} minutes loan`, async () => {
      await lendingBarAutoRenew.gotoPage(getDemoAppUrl(loanDuration));
      await lendingBarAutoRenew.autoRenewTest(loanDuration, 'keepReading');
    });
  }
});

test(`Lending-Bar: auto-renew when user flip bookreader page`, async ({
  lendingBarAutoRenew,
}) => {
  for (const loanDuration of loanDurations) {
    await test.step(`${loanDuration} minutes loan`, async () => {
      await lendingBarAutoRenew.gotoPage(getDemoAppUrl(loanDuration));
      await lendingBarAutoRenew.autoRenewTest(loanDuration, 'pageFlip');
    });
  }
});
