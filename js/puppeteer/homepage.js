// Holds methods that pertain to the homepage of the library website

const puppeteer = require('puppeteer');

// ------------------------------------
// Searches the sccl.org website for a searchQuery
// Returns the url of the page that displays search results
// searchQuery is provided by the user when they call the "!search" command in discord
// ------------------------------------
const searchTitle = async (searchQuery) => {
  try {
    const headerClass = '.header_search_xs';

    // For testing purposes, this is what we're searching for

    // ID of the form container that holds the search bar and search button
    const mobileFormId = '#mobile_search_form';
    const searchBarDataTag = '[data-js="main_search_input"]';
    const searchButtonWrapperClass = '.input-group-btn';

    // Launch browser methods
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://sccld.org/', {
      waitUntil: ['load', 'domcontentloaded'],
    });

    await page.waitForSelector(headerClass, {
      visible: true,
    });

    // Screenshots are for debugging progress
    // await page.screenshot({ path: 'screenshot1.png' });

    // Reveals the search container
    await page.click(headerClass);

    // await page.screenshot({ path: 'screenshot2.png' });

    await page.waitForSelector(mobileFormId);
    const mobileForm = await page.$(mobileFormId);

    // Search bar actions
    const searchBar = await mobileForm.$(searchBarDataTag);
    await searchBar.type(searchQuery);

    // await page.screenshot({ path: 'screenshot3.png' });

    const searchButtonWrapper = await mobileForm.$(searchButtonWrapperClass);

    await searchButtonWrapper.click('button');

    // Wait until the next page has loaded before recording a screenshot for progress
    await page.waitForTimeout(5000);
    // await page.screenshot({ path: 'screenshot4.png' });

    await browser.close();

    // Return the url of results, so another method can handle parsing the results
    return page.url();
  } catch (err) {
    console.error(err.message, 'ERRRRRR');
  }
};

module.exports = {
  searchTitle,
};
