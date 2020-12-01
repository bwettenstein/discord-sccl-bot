// Holds methods that pertain to the search results page of the library website
const puppeteer = require('puppeteer');

const getSearchResults = async (url) => {
  try {
    const paginationTextClass = '.pagination-text';
    const searchResultItemContainerClass = '.cp-search-result-item-content';
    const searchResultFormatClass = '.format-info-main-content';
    const searchResultItemInfoClass = '.cp-search-result-item-info';
    const searchResultTitleContainerClass = '.cp-title';

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Subject to change, but the object below should be the format for all of these results
    // {
    //   title,
    //   author (if applicable),
    //   format,
    //   url
    // }
    const resultArray = [];

    await page.goto(url, {
      waitUntil: ['load', 'domcontentloaded'],
    });

    // Get the string that has the number of results
    const paginationText = await page.$(paginationTextClass);
    const numOfResults = await page.evaluate(
      (element) => element.textContent,
      paginationText
    );

    // The format for the pagination text is 'NUMBER to NUMBER of TOTAL_RESULTS results
    // To get the total results, we split the string by spaces
    // From there, we get the index of the word 'results' in the array
    // The index right before that one holds the total results
    const paginationTextArray = numOfResults.split(' ');
    const indexOfResults = paginationTextArray.indexOf('results');
    const totalResults = paginationTextArray[indexOfResults - 1];

    // Get the columns that have the title and the author
    const searchResultItems = await page.$$(searchResultItemContainerClass);
    const titleContainers = await searchResultItems.$$(
      searchResultTitleContainerClass
    );

    for (const titleContainer in titleContainers) {
      //   await parseTitleAndFormat(titleContainer);
      console.log(titleContainer, 'FHFHFHFHFH');
    }

    await browser.close();
  } catch (err) {
    console.error(err.message, 'ERRRRRRR');
  }
};

// Grabs the title and format from each search result
const parseTitleAndFormat = async (titleContainer) => {};

module.exports = { getSearchResults };
