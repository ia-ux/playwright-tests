import {
  type BrowserContext,
  type Locator,
  type Page,
  type Request,
} from '@playwright/test';

import { identifier } from '../../config';

/** A file handed to the uploader. Built in memory, so no fixture files. */
export type UploadFile = { name: string; mimeType: string; buffer: Buffer };

/** An S3 PUT the uploader made, captured by interceptUploads() instead of sent. */
export type CapturedUpload = {
  identifier: string;
  fileName: string;
  headers: Record<string, string>;
  /**
   * The x-archive-meta headers, decoded and keyed by field name. Repeated
   * fields (x-archive-meta01-subject, x-archive-meta02-subject, ...) are
   * listed in order.
   */
  metadata: Record<string, string[]>;
};

const S3_HOST = /^https?:\/\/s3[^/]*\.archive\.org\//;
const UPLOAD_API = /\/upload\/app\/upload_api\.php/;
const S3_KEY_JSON =
  /((?:&quot;|")s3(?:access|secret)key(?:&quot;|")\s*:\s*(?:&quot;|"))[^&"]*/g;
const UNREDACTED_S3_KEY =
  /s3(?:access|secret)key(?:&quot;|")\s*:\s*(?:&quot;|")(?!DUMMY)/;
const READ_ONLY_METHODS = ['GET', 'HEAD', 'OPTIONS'];

function uploadApiCallName(request: Request): string | null {
  const url = new URL(request.url());
  const body = request.postData() ?? '';
  const multipart = body.match(/name="name"\r?\n\r?\n([^\r\n]*)/);
  return (
    multipart?.[1] ??
    new URLSearchParams(body).get('name') ??
    url.searchParams.get('name')
  );
}

function captureUpload(request: Request): CapturedUpload {
  const headers = request.headers();
  const [itemId, ...fileParts] = decodeURIComponent(
    new URL(request.url()).pathname.slice(1),
  ).split('/');

  const fields = Object.entries(headers)
    .map(([name, value]) => ({
      match: name.match(/^x-archive-meta(\d*)-(.+)$/),
      value,
    }))
    .filter(({ match }) => match)
    .sort((a, b) => Number(a.match![1] || 0) - Number(b.match![1] || 0));

  const metadata: Record<string, string[]> = {};
  for (const { match, value } of fields) {
    const uri = value.match(/^uri\((.*)\)$/);
    (metadata[match![2]] ??= []).push(uri ? decodeURIComponent(uri[1]) : value);
  }

  return {
    identifier: itemId,
    fileName: fileParts.join('/'),
    headers,
    metadata,
  };
}

/**
 * Routes the uploader's traffic so a test can drive the whole form, submit
 * included, without creating anything on archive.org:
 *
 * - S3 PUTs are captured into `captured` and answered with a fake 200. They are
 *   never sent.
 * - Of the upload_api.php calls, only the read-only identifier check goes
 *   through. The rest (upload counter, catalog polling) are aborted.
 * - The /upload page is served with its embedded S3 keys swapped for dummies,
 *   so the browser never holds real upload credentials, and even a request
 *   that slipped past these routes could not upload anything. If real keys are
 *   still found after the swap, the page is not served at all.
 * - Every other request that could change something is aborted.
 */
export async function interceptUploads(
  context: BrowserContext,
  captured: CapturedUpload[],
) {
  await context.route('**/*', async route => {
    const request = route.request();
    const url = request.url();

    if (S3_HOST.test(url)) {
      if (request.method() === 'PUT') captured.push(captureUpload(request));
      return route.fulfill({
        status: 200,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'PUT, OPTIONS',
          'access-control-allow-headers': '*',
        },
        body: '',
      });
    }

    if (UPLOAD_API.test(url)) {
      return uploadApiCallName(request) === 'identifierAvailable'
        ? route.continue()
        : route.abort();
    }

    if (
      request.resourceType() === 'document' &&
      new URL(url).pathname.replace(/\/$/, '') === identifier.upload.url
    ) {
      const response = await route.fetch();
      const body = (await response.text()).replace(S3_KEY_JSON, '$1DUMMY');
      if (UNREDACTED_S3_KEY.test(body)) {
        return route.fulfill({
          status: 500,
          contentType: 'text/plain',
          body: 'Uploader test guard: could not replace the S3 keys in the /upload page, so it was not served.',
        });
      }
      return route.fulfill({ response, body });
    }

    if (!READ_ONLY_METHODS.includes(request.method())) return route.abort();

    return route.fallback();
  });
}

export class UploadPage {
  readonly page: Page;

  /** S3 uploads the page attempted, in order. Filled by interceptUploads(). */
  readonly uploads: CapturedUpload[] = [];

  readonly loginRequiredMessage: Locator;
  readonly loginLink: Locator;

  readonly uploadFilesHeading: Locator;
  readonly chooseFilesButton: Locator;
  readonly addFilesButton: Locator;
  readonly fileList: Locator;

  readonly requiredInformationHeading: Locator;
  readonly titleField: Locator;
  readonly titleInput: Locator;
  readonly pageUrlField: Locator;
  readonly pageUrlInput: Locator;
  readonly itemIdentifier: Locator;
  readonly descriptionField: Locator;
  readonly descriptionEditor: Locator;
  readonly subjectTagsField: Locator;
  readonly subjectTagsInput: Locator;
  readonly collectionField: Locator;
  readonly creatorField: Locator;
  readonly creatorInput: Locator;
  readonly dateField: Locator;
  readonly dateYearInput: Locator;
  readonly languageField: Locator;
  readonly languageSelect: Locator;
  readonly licenseField: Locator;
  readonly licensePicker: Locator;
  readonly testItemField: Locator;
  readonly testItemSelect: Locator;

  readonly uploadButton: Locator;
  readonly missingFieldsMessage: Locator;
  readonly backButton: Locator;
  readonly uploadCompleteMessage: Locator;
  readonly itemReadyMessage: Locator;
  readonly itemCreationFailedMessage: Locator;
  readonly goToYourPageButton: Locator;

  public constructor(page: Page) {
    this.page = page;

    this.loginRequiredMessage = page.getByText(
      'You must be logged in to upload',
    );
    this.loginLink = page.getByRole('main').getByRole('link', { name: 'here' });

    this.uploadFilesHeading = page.getByRole('heading', {
      name: 'Upload files',
    });
    this.chooseFilesButton = page.getByRole('button', {
      name: 'Choose files to upload',
    });
    this.addFilesButton = page.getByRole('button', {
      name: 'Select files to add',
    });
    this.fileList = page.locator('#files');

    // Each metadata field is a click-to-edit row whose accessible name is its
    // label followed by its current value.
    this.requiredInformationHeading = page.getByRole('heading', {
      name: 'Required Information',
    });
    this.titleField = page.getByRole('button', { name: /^Item Title \*/ });
    this.titleInput = page.locator('#page_title_row input');
    this.pageUrlField = page.getByRole('button', { name: /^Page URL \*/ });
    this.pageUrlInput = page.getByLabel('Edit Page URL');
    this.itemIdentifier = page.locator('#item_id');
    this.descriptionField = page.getByRole('button', {
      name: /^Description \*/,
    });
    this.descriptionEditor = page
      .frameLocator('#description_editor-wysiwyg-iframe')
      .locator('body');
    this.subjectTagsField = page.getByRole('button', {
      name: /^Subject Tags \*/,
    });
    this.subjectTagsInput = page.locator('#subject_row input');
    this.collectionField = page.getByRole('button', { name: /^Collection \*/ });
    this.creatorField = page.getByRole('button', { name: /^Creator/ });
    this.creatorInput = page.locator('#creator_row input');
    this.dateField = page.getByRole('button', { name: /^Date/ });
    this.dateYearInput = page.locator('#date_year');
    this.languageField = page.getByRole('button', { name: /^Language/ });
    this.languageSelect = page.locator('#language_select');
    this.licenseField = page.getByRole('button', { name: /^License/ });
    this.licensePicker = page.locator('#license_picker');
    this.testItemField = page.getByRole('button', { name: /^Test Item/ });
    this.testItemSelect = page.locator('#test_item_select');

    // Reads "Checking identifier..." until the Page URL check finishes.
    this.uploadButton = page.getByRole('button', {
      name: 'Upload and Create Your Item',
    });
    this.missingFieldsMessage = page.getByText(
      'Please complete the required fields highlighted in red.',
    );
    this.backButton = page.getByRole('button', { name: 'Back' });
    // Shown when the files are uploaded but the item's status can't be
    // checked, which is always the case when uploads are intercepted.
    this.uploadCompleteMessage = page.getByText('Upload complete', {
      exact: true,
    });
    // After a real upload the page polls the item's catalog tasks, then shows
    // one of these.
    this.itemReadyMessage = page.getByText('Your item is ready!');
    this.itemCreationFailedMessage = page.getByText(
      'There was an error in creating your item.',
    );
    this.goToYourPageButton = page.getByRole('button', {
      name: 'Go to your page',
    });
  }

  async goto() {
    await this.page.goto(identifier.upload.url, {
      waitUntil: 'domcontentloaded',
    });
  }

  fileRow(fileName: string): Locator {
    return this.fileList.getByRole('row', { name: fileName });
  }

  /** Picks files through the file chooser, as a user would. */
  async chooseFiles(files: UploadFile[]) {
    const fileChooser = this.page.waitForEvent('filechooser', {
      timeout: 30000,
    });
    await this.chooseFilesButton.click();
    await (await fileChooser).setFiles(files);
    await this.requiredInformationHeading.waitFor({
      state: 'visible',
      timeout: 30000,
    });
    await this.waitForIdentifierCheck();
  }

  async addFiles(files: UploadFile[]) {
    const fileChooser = this.page.waitForEvent('filechooser', {
      timeout: 30000,
    });
    await this.addFilesButton.click();
    await (await fileChooser).setFiles(files);
    await this.fileRow(files[files.length - 1].name).waitFor({
      state: 'visible',
      timeout: 30000,
    });
  }

  async removeFile(fileName: string) {
    await this.fileRow(fileName).getByRole('link').click();
  }

  /** The upload button only takes its real label once the Page URL is checked. */
  async waitForIdentifierCheck() {
    await this.uploadButton.waitFor({ state: 'visible', timeout: 30000 });
  }

  async setTitle(title: string) {
    await this.titleField.click();
    await this.titleInput.fill(title);
    await this.titleInput.press('Enter');
  }

  async setPageUrl(itemId: string) {
    await this.pageUrlField.click();
    await this.pageUrlInput.fill(itemId);
    await this.pageUrlInput.press('Enter');
    await this.waitForIdentifierCheck();
  }

  async setDescription(description: string) {
    await this.descriptionField.click();
    await this.descriptionEditor.click();
    await this.descriptionEditor.pressSequentially(description);
  }

  async setSubjectTags(tags: string[]) {
    await this.subjectTagsField.click();
    await this.subjectTagsInput.fill(tags.join(', '));
    await this.subjectTagsInput.press('Enter');
  }

  async setCreator(creator: string) {
    await this.creatorField.click();
    await this.creatorInput.fill(creator);
    await this.creatorInput.press('Enter');
  }

  async setDateYear(year: string) {
    await this.dateField.click();
    await this.dateYearInput.fill(year);
    await this.dateYearInput.press('Tab');
  }

  async setLanguage(language: string) {
    await this.languageField.click();
    await this.languageSelect.selectOption({ label: language });
  }

  async setLicense(license: string | RegExp) {
    await this.licenseField.click();
    await this.licensePicker.getByLabel(license).check();
  }

  async markAsTestItem() {
    await this.testItemField.click();
    await this.testItemSelect.selectOption('Yes');
  }

  async fillRequiredFields(description: string, tags: string[]) {
    await this.setDescription(description);
    await this.setSubjectTags(tags);
  }

  async submit() {
    // Clicking a heading closes whichever field editor is still open, so its
    // value is saved before the uploader reads the form.
    await this.requiredInformationHeading.click();
    await this.uploadButton.click();
  }
}
