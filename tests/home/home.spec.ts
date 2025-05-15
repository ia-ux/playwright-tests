import { test, expect } from '../fixtures';

import { SearchOption } from '../models';


test('Home page displays all of its elements', async ({ homePage }) => {
  await test.step('Validate if page elements were loaded', async () => {
    await homePage.validatePageElements();
  });
});

test('Do simple metadata search', async ({ homePage }) => {
  const { collectionSearchInput: searchInput } = homePage;
  const query = 'cats';
  await test.step(`Query for "${query}" and validate that "${query}" appears as the search term `, async () => {
    await searchInput.queryFor(query);
    expect(await searchInput.formInputSearchPage.inputValue()).toBe(query);
  });
});

test('Do simple full-text search', async ({ homePage }) => {
  const { collectionSearchInput: searchInput } = homePage;
  const query = 'dogs';
  await test.step(`Select text contents in search options, query for "${query}" and validate that "${query}" appears as the search term`, async () => {
    await searchInput.clickSearchInputOption(SearchOption.TEXT, 'search');
    await searchInput.queryFor(query);
    expect(await searchInput.formInputSearchPage.inputValue()).toBe(query);
  });
});

test('Do simple TV search', async ({ homePage }) => {
  const { collectionSearchInput: searchInput } = homePage;
  const query = 'iguanas';
  await test.step(`Select TV in search options, query for "${query}" and validate that "${query}" appears as the search term`, async () => {
    await searchInput.clickSearchInputOption(SearchOption.TV, 'search');
    await searchInput.queryFor(query);
    await homePage.collectionBrowser.validateTVPage('iguanas');
  });
});

test('Do simple radio search', async ({ homePage }) => {
  const { collectionSearchInput: searchInput, collectionBrowser } = homePage;
  await test.step(`Select radio in search options, query for "rabbits" and validate that "rabbits" appears as the search term`, async () => {
    await searchInput.clickSearchInputOption(
      SearchOption.RADIO, 'search',
    );
    await searchInput.queryFor('rabbits');
    await collectionBrowser.validateRadioPage('rabbits');
  });
});

test('Redirect web search to Wayback machine page', async ({ homePage }) => {
  const { collectionSearchInput: searchInput, collectionBrowser } = homePage;
  await test.step(`Select TV in search options, query for "parrots" and validate that "parrots" appears as the search term`, async () => {
    await searchInput.clickSearchInputOption(
      SearchOption.WEB, 'search',
    );
    await searchInput.queryFor('parrots');
    await collectionBrowser.validateWaybackPage('parrots');
  });
});

test('Use Wayback widget - Redirect web search', async ({ homePage }) => {
  await test.step(`Search for "canaries" and validate that "canaries" appears as the search term`, async () => {
    await homePage.waybackSearchFor('canaries');
    await homePage.collectionBrowser.validateWaybackPage('canaries');
  });
});

test('TopNav Functionality', async ({ homePage }) => {
  await test.step(`check media button count`, async () => {
    // await homePage.topNav.clickMediaButtons();
    const mediaButtons = await homePage.topNav.getAllMediaButtons();
    expect(mediaButtons.length).toEqual(8);

    for (let [i, text] of homePage.topNav.mediaTypeTexts.entries()) {
      const elemAttr = await mediaButtons[i].getAttribute('data-mediatype');
      expect(elemAttr).toEqual(text);
    }
  });


})

