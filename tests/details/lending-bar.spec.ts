import { test } from '../fixtures';

import { identifier } from '../../config';

test(`Lending bar: non-logged-in user sees "Log In and Borrow"`, async ({
  detailsPage,
  browserName,
}) => {
  await detailsPage.gotoPage(identifier.lending[browserName]);

  await test.step('verify default texts and info icon', async () => {
    await detailsPage.lendingBar.verifyDefaultTexts();
    await detailsPage.lendingBar.verifyInfoIcon();
  });

  await test.step('verify lending bar prompts login', async () => {
    await detailsPage.lendingBar.verifyLendingBarBasicNonLoggedIn();
  });
});

test(`Lending bar: logged-in patron sees borrow/return controls`, async ({
  patronDetailsPage,
  browserName,
}) => {
  await patronDetailsPage.gotoPage(identifier.lending[browserName]);

  await test.step('verify lending bar shows borrow or return controls', async () => {
    await patronDetailsPage.lendingBar.verifyLendingBarLoggedIn();
  });
});
