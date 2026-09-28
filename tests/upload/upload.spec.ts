import { test, expect } from '../fixtures';
import { identifier } from '../../config';
import { type UploadFile } from '../page-objects/upload-page';

// These tests drive the real uploader at /upload, submit included, but never
// create an item: the upload fixtures capture every S3 PUT instead of sending
// it (see interceptUploads() in page-objects/upload-page.ts). Assertions on
// what was uploaded are made against those captured requests.

const textFile = (name: string, content: string): UploadFile => ({
  name,
  mimeType: 'text/plain',
  buffer: Buffer.from(content),
});

const SAMPLE = textFile(
  'ia-e2e-uploader-sample.txt',
  'Sample file for the uploader e2e tests.\n',
);
const SECOND_SAMPLE = textFile(
  'ia-e2e-uploader-second.txt',
  'Second sample file for the uploader e2e tests.\n',
);
const AUDIO_SAMPLE: UploadFile = {
  name: 'ia-e2e-uploader-sample.mp3',
  mimeType: 'audio/mpeg',
  buffer: Buffer.alloc(64),
};
// The uploader proposes an identifier based on the first file's name.
const SAMPLE_ID = 'ia-e2e-uploader-sample';

test.describe('Upload page - access', () => {
  test('Guests are asked to log in before they can upload', async ({
    uploadPage,
  }) => {
    await test.step('Verify the login prompt replaces the uploader', async () => {
      await expect(uploadPage.loginRequiredMessage).toBeVisible();
      await expect(uploadPage.loginLink).toHaveAttribute('href', '/login');
      await expect(uploadPage.chooseFilesButton).not.toBeVisible();
    });
  });

  test('Logged-in patrons are offered a file chooser', async ({
    patronUploadPage,
  }) => {
    await test.step('Verify the upload landing page', async () => {
      await expect(patronUploadPage.uploadFilesHeading).toBeVisible();
      await expect(patronUploadPage.chooseFilesButton).toBeVisible();
      await expect(
        patronUploadPage.requiredInformationHeading,
      ).not.toBeVisible();
    });
  });
});

test.describe('Upload page - choosing files', () => {
  test('Choosing a file opens the metadata form, filled in from the file name', async ({
    patronUploadPage,
  }) => {
    await test.step('Choose a file', async () => {
      await patronUploadPage.chooseFiles([SAMPLE]);
    });

    await test.step('Verify the file is listed with its size', async () => {
      await expect(patronUploadPage.fileRow(SAMPLE.name)).toContainText(
        `${SAMPLE.buffer.length} bytes`,
      );
    });

    await test.step('Verify the form defaults', async () => {
      await expect(patronUploadPage.titleField).toContainText(SAMPLE_ID);
      await expect(patronUploadPage.pageUrlField).toContainText(SAMPLE_ID);
      await expect(patronUploadPage.collectionField).toContainText(
        'Community texts',
      );
      await expect(patronUploadPage.licenseField).toContainText(
        'No license selected',
      );
      await expect(patronUploadPage.testItemField).toContainText('No');
      await expect(patronUploadPage.uploadButton).toBeEnabled();
    });
  });

  test('Audio files default to the Community audio collection', async ({
    patronUploadPage,
  }) => {
    await test.step('Choose an audio file', async () => {
      await patronUploadPage.chooseFiles([AUDIO_SAMPLE]);
    });

    await test.step('Verify the collection', async () => {
      await expect(patronUploadPage.collectionField).toContainText(
        'Community audio',
      );
    });
  });

  test('Files can be added to and removed from the upload list', async ({
    patronUploadPage,
  }) => {
    await test.step('Choose a file, then add a second one', async () => {
      await patronUploadPage.chooseFiles([SAMPLE]);
      await patronUploadPage.addFiles([SECOND_SAMPLE]);
      await expect(patronUploadPage.fileRow(SAMPLE.name)).toBeVisible();
      await expect(patronUploadPage.fileRow(SECOND_SAMPLE.name)).toBeVisible();
    });

    await test.step('Remove the first file', async () => {
      await patronUploadPage.removeFile(SAMPLE.name);
      await expect(patronUploadPage.fileRow(SAMPLE.name)).not.toBeVisible();
      await expect(patronUploadPage.fileRow(SECOND_SAMPLE.name)).toBeVisible();
    });
  });
});

test.describe('Upload page - metadata form', () => {
  test('A Page URL that is already taken is replaced by an available one', async ({
    patronUploadPage,
  }) => {
    const taken = identifier.upload.existing_identifier;

    await test.step('Choose a file', async () => {
      await patronUploadPage.chooseFiles([SAMPLE]);
    });

    await test.step(`Enter the existing identifier "${taken}" as the Page URL`, async () => {
      await patronUploadPage.setPageUrl(taken);
    });

    await test.step('Verify a different, available identifier is used', async () => {
      await expect(patronUploadPage.itemIdentifier).toHaveText(
        new RegExp(`^${taken}.+`),
      );
      await expect(patronUploadPage.uploadButton).toBeEnabled();
    });
  });

  test('Submitting without a description and subject tags is stopped and uploads nothing', async ({
    patronUploadPage,
  }) => {
    await test.step('Choose a file and submit straight away', async () => {
      await patronUploadPage.chooseFiles([SAMPLE]);
      await patronUploadPage.submit();
    });

    await test.step('Verify the required-fields message and that nothing was uploaded', async () => {
      await expect(patronUploadPage.missingFieldsMessage).toBeVisible();
      expect(patronUploadPage.uploads).toHaveLength(0);
    });

    await test.step('Go back to the form', async () => {
      await patronUploadPage.backButton.click();
      await expect(patronUploadPage.missingFieldsMessage).not.toBeVisible();
      await expect(patronUploadPage.descriptionField).toBeVisible();
    });
  });
});

test.describe('Upload page - submitting', () => {
  test('A completed form uploads every file to the item with the entered metadata', async ({
    patronUploadPage,
  }) => {
    const itemId = `${SAMPLE_ID}-custom-page-url`;

    await test.step('Choose two files', async () => {
      await patronUploadPage.chooseFiles([SAMPLE]);
      await patronUploadPage.addFiles([SECOND_SAMPLE]);
    });

    await test.step('Fill in the metadata', async () => {
      await patronUploadPage.setTitle('Uploader e2e sample');
      await patronUploadPage.setPageUrl(itemId);
      await patronUploadPage.fillRequiredFields(
        'Sample description entered by the uploader e2e tests.',
        ['playwright', 'e2e'],
      );
      await patronUploadPage.setCreator('Uploader E2E Tests');
      await patronUploadPage.setDateYear('2020');
      await patronUploadPage.setLanguage('English');
      await patronUploadPage.setLicense(/^CC0/);
      await expect(patronUploadPage.itemIdentifier).toHaveText(itemId);
    });

    await test.step('Submit', async () => {
      await patronUploadPage.submit();
      await expect(patronUploadPage.uploadCompleteMessage).toBeVisible();
    });

    await test.step('Verify each file went to the item', async () => {
      const { uploads } = patronUploadPage;
      expect(uploads.map(upload => upload.fileName)).toEqual([
        SAMPLE.name,
        SECOND_SAMPLE.name,
      ]);
      for (const upload of uploads) {
        expect(upload.identifier).toBe(itemId);
        expect(upload.headers['x-amz-auto-make-bucket']).toBe('1');
      }
    });

    await test.step('Verify the metadata sent with the upload', async () => {
      const { metadata } = patronUploadPage.uploads[0];
      expect(metadata.title).toEqual(['Uploader e2e sample']);
      expect(metadata.description).toEqual([
        'Sample description entered by the uploader e2e tests.',
      ]);
      expect(metadata.subject).toEqual(['playwright', 'e2e']);
      expect(metadata.creator).toEqual(['Uploader E2E Tests']);
      expect(metadata.date).toEqual(['2020']);
      expect(metadata.language).toEqual(['eng']);
      expect(metadata.licenseurl).toEqual([
        'https://creativecommons.org/publicdomain/zero/1.0/',
      ]);
      expect(metadata.mediatype).toEqual(['texts']);
      expect(metadata.collection).toEqual(['opensource']);
    });

    await test.step('Go to the new item page', async () => {
      await patronUploadPage.goToYourPageButton.click();
      await patronUploadPage.page.waitForURL(`**/details/${itemId}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });
    });
  });

  test('A test item is also added to test_collection', async ({
    patronUploadPage,
  }) => {
    await test.step('Choose a file, fill in the required fields and mark it as a test item', async () => {
      await patronUploadPage.chooseFiles([SAMPLE]);
      await patronUploadPage.fillRequiredFields(
        'Sample description entered by the uploader e2e tests.',
        ['playwright'],
      );
      await patronUploadPage.markAsTestItem();
    });

    await test.step('Submit', async () => {
      await patronUploadPage.submit();
      await expect(patronUploadPage.uploadCompleteMessage).toBeVisible();
    });

    await test.step('Verify the upload went to test_collection', async () => {
      expect(patronUploadPage.uploads).toHaveLength(1);
      expect(patronUploadPage.uploads[0].metadata.collection).toEqual([
        'opensource',
        'test_collection',
      ]);
    });
  });
});
