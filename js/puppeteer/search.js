// Holds methods that pertain to the search results page of the library website

const puppeteer = require('puppeteer');

// ------------------------------------
// Grabs the search results on the page from the given url and parses each of them for information (see the comment above the searchResultsArray for the specific info)
// Various methods, commented below, are used to parse specific information
// Once parsed, all the information is placed into an object which is pushed on to an array and returned
// Takes in a url, which it parses for the search result information
// ------------------------------------
const getSearchResults = async (url) => {
  try {
    const titleAuthorContainerClass = '.cp-deprecated-bib-brief';
    const searchResultContainerClass = '.cp-search-result-item-content';

    // Launch browser methods
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();

    // Subject to change, but the object below should be the format for all of these results
    // {
    //   title,
    //   author (if applicable),
    //   format,
    //   url,
    //   availability
    // }
    const searchResultsArray = [];

    await page.goto(url, {
      waitUntil: ['load', 'domcontentloaded'],
    });

    // Get the columns that have the title and the author
    const titleAndAuthorContainer = await page.$$(titleAuthorContainerClass);

    // Get all the search result containers to parse the availability
    const searchResultContainer = await page.$$(searchResultContainerClass);

    // Grab the title and the format
    // Using a for loop so I can use the await keyword since it doesn't wotk in a forEach
    for (let x = 0; x < titleAndAuthorContainer.length; x++) {
      // Grab the title and format
      const titleAndAuthorElement = titleAndAuthorContainer[x];
      const { title, format } = await getTitleAndFormat(
        titleAndAuthorElement,
        page
      );

      const url = await getResultUrl(titleAndAuthorElement, page);

      // Parse the results for the author, if applicable
      const author = await getAuthor(titleAndAuthorElement, page);

      // Check if the search result has a "subtitle element", if applicable
      const subtitle = await getSubtitle(titleAndAuthorElement, page);

      const searchResultElement = searchResultContainer[x];
      const availabilityStatus = await getAvailability(
        searchResultElement,
        page
      );

      let availability = null;

      if (availabilityStatus) {
        availability = 'Available';
      } else {
        availability = 'Unavailable';
      }

      const searchResult = {
        title,
        format,
        author,
        subtitle,
        url,
        availability,
      };
      searchResultsArray.push(searchResult);
    }

    await browser.close();

    return searchResultsArray;
  } catch (err) {
    console.error(err.message, 'ERRRRRRR');
  }
};

// ------------------------------------
// Get the pagination of the current results on the current page
// * The format for the pagination text is 'NUMBER (paginationStart) to NUMBER (paginationEnd) of TOTAL_RESULTS results'
// EX: 1 - 10 of 30 results
// Takes in the url, which it parses for the pagination classes
// Takes in a searchQuery, which can be "paginationStart" (which returns the starting index of the current results, see *),
// paginationEnd (which returns the end index of the current results, see *),
// totalResults (which returns the total number of results, see *),
// or returns the paginationStart, paginationEnd, and totalResults as an object if searchQuery is empty
// ------------------------------------
const getPagination = async (url, searchQuery = '') => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url, {
    waitUntil: ['load', 'domcontentloaded'],
  });

  const paginationTextClass = '.cp-pagination-label';

  // Get the string that has the number of results
  const paginationText = await page.$(paginationTextClass);
  const numOfResults = await page.evaluate(
    (element) => element.textContent,
    paginationText
  );

  // The format for the pagination text is 'NUMBER (paginationStart) to NUMBER (paginationEnd) of TOTAL_RESULTS results
  // To get the total results, we split the string by spaces
  // From there, we get the index of the word 'results' in the array
  // The index right before that one holds the total results
  const paginationTextArray = numOfResults.split(' ');
  const indexOfResults = paginationTextArray.indexOf('results');
  const paginationStart = paginationTextArray[0];
  const paginationEnd = paginationTextArray[2];
  const totalResults = paginationTextArray[indexOfResults - 1];

  let output;

  switch (searchQuery) {
    case 'paginationStart':
      output = paginationStart;
      break;
    case 'paginationEnd':
      output = paginationEnd;
      break;
    case 'totalResults':
      output = totalResults;
      break;
    default:
      output = { paginationStart, paginationEnd, totalResults };
      break;
  }
  return output;
};

// ------------------------------------
// Gets the url for each search result and returns it
// Takes in a titleAndAuthorElement which is parsed for the href
// Takes in a page element which holds puppeteer browser methods
// Takes page, which allows us to use the puppeter evaluate method to get the url of the specific titleAndAuthorElement
// ------------------------------------
const getResultUrl = async (titleAndAuthorElement, page) => {
  // The href link will be added to the end of this url

  const anchorElement = await titleAndAuthorElement.$('a');
  const href = await page.evaluate(
    (anchorElement) => anchorElement.getAttribute('href'),
    anchorElement
  );
  const url = 'https://sccl.bibliocommons.com' + href;

  return url;
};

// ------------------------------------
// Grabs the title and format and returns them, if applicable
// Takes in the titleAndAuthorElement to parse the title and format in it
// Takes in a page element which holds puppeteer browser methods
// Takes page, which allows us to use the puppeter evaluate method to get the title and format
// ------------------------------------
const getTitleAndFormat = async (titleAndAuthorElement, page) => {
  const titleFormatClass = '.cp-screen-reader-message';
  const titleAndFormatElement = await titleAndAuthorElement.$(titleFormatClass);

  let titleAndFormatString = await page.evaluate(
    (titleAndFormatElement) => titleAndFormatElement.innerText,
    titleAndFormatElement
  );

  // The title and the format are stored in a string that's formatted like:
  // ITEM TITLE, FORMAT
  // To get the title and item, we split the string by ", "
  // The first item in the array will be the title, the 2nd will be the format

  titleAndFormatString = titleAndFormatString.split(', ');

  const title = titleAndFormatString[0];
  const format = titleAndFormatString[1];
  return { title, format };
};

// ------------------------------------
// Get the author and returns it, if applicable
// Takes titleAndAuthorElement, to parse the author element in it
// Takes in a page element which holds puppeteer browser methods
// Takes page, which allows us to use the puppeter evaluate method to get the author
// ------------------------------------
const getAuthor = async (titleAndAuthorElement, page) => {
  // Parse the results for the author, if applicable
  const authorClass = '.author-link';
  const authorElement = await titleAndAuthorElement.$(authorClass);
  const author = await page.evaluate((authorElement) => {
    if (authorElement) return authorElement.innerText;
  }, authorElement);
  return author;
};

// ------------------------------------
// Get the subtitle and returns it, if applicable
// Subtitles are usually only present for books
// EX - The Dark Tower: The Wind Through The Keyhole, here "The Wind Through The Keyhole" is the subtitle
// Takes titleAndAuthorElement, to parse the subtitle element from
// Takes page, which allows us to use the puppeter evaluate method to get the subtitle
// ------------------------------------
const getSubtitle = async (titleAndAuthorElement, page) => {
  const subtitleClass = '.cp-subtitle';
  const subtitleElement = await titleAndAuthorElement.$(subtitleClass);

  const subtitle = await page.evaluate((subtitleElement) => {
    if (subtitleElement) return subtitleElement.innerText;
  }, subtitleElement);

  return subtitle;
};

// ------------------------------------
// Gets the availability status and returns true if the item is available
// Takes titleAndAuthorElement, to parse the availability element from
// If the availabilityElement's innerText is 'Available', return true
// Takes in a page element which holds puppeteer browser methods
// Takes page, which allows us to use the puppeter evaluate method to get the availability
// ------------------------------------
const getAvailability = async (searchResultElement, page) => {
  const availabilityClass = '.cp-availability-status';
  const availabilityElement = await searchResultElement.$(availabilityClass);

  let availability = await page.evaluate((availabilityElement) => {
    if (availabilityElement) return availabilityElement.innerText;
  }, availabilityElement);

  return availability === 'Available';
};

// Prints out each search result
// Mostly used for debugging
const printSearchResults = async (searchResultsArray) => {
  searchResultsArray.forEach((result) => {
    if (result.subtitle && result.author) {
      console.log(
        `${result.title} (${result.subtitle}) | AUTHOR: ${result.author} | ${result.format}`
      );
    } else if (result.subtitle) {
      console.log(`${result.title} (${result.subtitle}) | ${result.format}`);
    } else if (result.author) {
      console.log(
        `${result.title} | AUTHOR: ${result.author} | FORMAT: ${result.format}`
      );
      // For DVDs, Blu Rays, etc
      // They don't have subtitles or authors
    } else {
      console.log(`${result.title} | FORMAT: ${result.format}`);
    }
  });
};

module.exports = {
  getSearchResults,
  printSearchResults,
  getPagination,
  getResultUrl,
  getAuthor,
  getSubtitle,
  getTitleAndFormat,
};
