// Holds methods that pertain to the search results page of the library website
const puppeteer = require('puppeteer');

const getSearchResults = async (url) => {
  try {
    const paginationTextClass = '.pagination-text';
    const titleAuthorContainerClass = '.cp-deprecated-bib-brief';
    const titleFormatClass = '.cp-screen-reader-message';
    const authorClass = '.author-link';
    const subtitleClass = '.cp-subtitle';

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Subject to change, but the object below should be the format for all of these results
    // {
    //   title,
    //   author (if applicable),
    //   format,
    //   url
    // }
    const searchResultsArray = [];

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
    const titleAndAuthorContainer = await page.$$(titleAuthorContainerClass);

    // Grab the title and the format
    // Using a for loop so I can use the await keyword since it doesn't wotk in a forEach
    for (let x = 0; x < titleAndAuthorContainer.length; x++) {
      // Grab the title and format
      const titleAndAuthorElement = titleAndAuthorContainer[x];
      const { title, format } = await getTitleAndFormat(
        titleFormatClass,
        titleAndAuthorElement,
        page
      );

      // Parse the results for the author, if applicable
      const author = await getAuthor(authorClass, titleAndAuthorElement, page);

      // Check if the search result has a "subtitle element", if applicable
      const subtitle = await getSubtitle(
        subtitleClass,
        titleAndAuthorElement,
        page
      );

      const searchResult = {
        title,
        format,
        author,
        subtitle,
      };
      searchResultsArray.push(searchResult);
    }

    await browser.close();

    return searchResultsArray;
  } catch (err) {
    console.error(err.message, 'ERRRRRRR');
  }
};

// Grabs the title and format for a given titleAndAuthorElement and returns them, if applicable
// Takes in the titleFormatClass which is the className to search for
// Takes in the titleAndAuthorElement to parse the title and format from
// Takes in page in order to use the puppeteer query selector method
const getTitleAndFormat = async (
  titleFormatClass,
  titleAndAuthorElement,
  page
) => {
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

// Get the author and return it, if applicable
// Takes in authorClass, which is the name of the class that holds the name of the author
// Takes titleAndAuthorElement, to get the author element from
// Takes page, which allows us to use the puppeter query selector method
const getAuthor = async (authorClass, titleAndAuthorElement, page) => {
  // Parse the results for the author, if applicable
  const authorElement = await titleAndAuthorElement.$(authorClass);
  const author = await page.evaluate((authorElement) => {
    if (authorElement) return authorElement.innerText;
  }, authorElement);
  return author;
};

// Get subtitle element and returns it, if applicable
// Takes in subtitleClass, which is the name of the class that holds the name of the subtitle
// Takes titleAndAuthorElement, to get the author element from
// Takes page, which allows us to use the puppeter query selector method
const getSubtitle = async (subtitleClass, titleAndAuthorElement, page) => {
  const subtitleElement = await titleAndAuthorElement.$(subtitleClass);

  const subtitle = await page.evaluate((subtitleElement) => {
    if (subtitleElement) return subtitleElement.innerText;
  }, subtitleElement);

  return subtitle;
};

// Prints out each search result
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

module.exports = { getSearchResults, printSearchResults };
