import { test, expect } from '../fixtures';
import { DetailsPage } from '../page-objects/details-page';
import { type UploadFile } from '../page-objects/upload-page';

// This test creates a real item on archive.org, so it only runs when
// RUN_REAL_UPLOAD=true (see the realUploadPage fixture). The item is always a
// test item, which archive.org removes after 30 days. Retries are off so a
// failed run can't create a second item.
test.describe.configure({ retries: 0 });

test('A real upload creates a test item on archive.org', async ({
  realUploadPage,
  request,
}) => {
  const itemId = `ia-e2e-uploader-test-${Date.now()}`;
  const file: UploadFile = {
    name: `${itemId}.txt`,
    mimeType: 'text/plain',
    buffer: Buffer.from(
      `Created by the uploader e2e tests at ${new Date().toISOString()}.\n`,
    ),
  };
  const title = `Uploader e2e test item ${itemId}`;
  const description =
    'Automated test item created by the archive.org uploader e2e tests. Test items are removed after 30 days.';
  test.info().annotations.push({
    type: 'item',
    description: `https://archive.org/details/${itemId}`,
  });

  await test.step('Choose a file and fill in the form', async () => {
    await realUploadPage.chooseFiles([file]);
    await expect(realUploadPage.itemIdentifier).toHaveText(itemId);
    await realUploadPage.setTitle(title);
    await realUploadPage.fillRequiredFields(description, ['playwright', 'e2e']);
  });

  await test.step('Mark it as a test item, so archive.org removes it after 30 days', async () => {
    await realUploadPage.markAsTestItem();
    await expect(realUploadPage.testItemSelect).toHaveValue('Yes');
  });

  await test.step('Submit and wait for the item to be created', async () => {
    await realUploadPage.submit();
    await expect(
      realUploadPage.itemReadyMessage.or(
        realUploadPage.itemCreationFailedMessage,
      ),
    ).toBeVisible({ timeout: 5 * 60 * 1000 });
    await expect(realUploadPage.itemReadyMessage).toBeVisible();
  });

  await test.step('Go to the new item page', async () => {
    await realUploadPage.goToYourPageButton.click();
    await realUploadPage.page.waitForURL(`**/details/${itemId}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await expect(new DetailsPage(realUploadPage.page).itemTitle).toHaveText(
      title,
    );
  });

  await test.step('Verify the item through the metadata API', async () => {
    await expect
      .poll(
        async () => {
          const item = await (await request.get(`/metadata/${itemId}`)).json();
          return {
            title: item.metadata?.title,
            inTestCollection: [item.metadata?.collection]
              .flat()
              .includes('test_collection'),
            hasFile: (item.files ?? []).some(
              (f: { name: string }) => f.name === file.name,
            ),
          };
        },
        { timeout: 2 * 60 * 1000, intervals: [5000, 10000] },
      )
      .toEqual({ title, inTestCollection: true, hasFile: true });
  });
});
