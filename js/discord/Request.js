const homepage = require('../puppeteer/homepage');
const search = require('../puppeteer/search');

class Request {
  // Name is the discord user
  // activeRequest is a boolean that determines if the request is active or not
  constructor(name, activeRequest = true) {
    this.name = name;
    this.activeRequest = activeRequest;

    // libUrl holds the url for the search results, it's needed to grab the pagination info for the output
    this.currentSearchResults = null;
    this.libUrl = null;
    this.currentPaginationInfo = null;
  }
}

// Grabs a searchQuery from the user and uses the homepage and search methods from the puppeteer folder
// The libUrl is assigned to the specific request in order for pagination parsing and output purposes
// An array of all the searchResult elements is returned
Request.prototype.search = async function (searchQuery) {
  const libUrl = await homepage.searchTitle(searchQuery);
  const searchResults = await search.getSearchResults(libUrl);

  this.setCurrentSearchResults(searchResults);
  this.setLibUrl(libUrl);
  await this.setPaginationInfo();

  return searchResults;
};

// ------------------------------------
// Parses the existing libUrl and adds a 1 to the existing page number in the url
// Get the library url and split it based off "pagination_page="
// EX of a library url endpoint - "pagination_page=2" is always at the end of a lib url
// It should return an array of size 2 (lets say it's called urlArray) where the first element is the url and the last element is the page number
// Make the new libUrl urlArray[0] + "page=" + urlArray[1]+1
// If the startPagination of the current page is the same as the startPagination of the previous page, that means that we've reached the maximum results
// Otherwise, get the search results for the page and print to the user
// NOTE the library url will only have the "pagination_page" endpoint when the user isn't on the first page of the search results
// Therefore, we need check for that
// ------------------------------------
Request.prototype.nextPage = async function () {
  const splitUrl = this.libUrl.split('&pagination_page=');

  // ------------------------------------
  // Uncomment for debugging
  // console.log(this.libUrl);
  // console.log(splitUrl[0], '0', splitUrl[1], '1');
  // ------------------------------------

  let newUrl = null;

  // If there's no "pagination_page" endpoint, we append it to the url
  if (!splitUrl[1]) {
    newUrl = splitUrl[0] + '&pagination_page=2';
  } else {
    // Parse the int from the string
    const nextPageNumber = parseInt(splitUrl[1]) + 1;
    newUrl = splitUrl[0] + `&pagination_page=${nextPageNumber}`;
  }
  this.setLibUrl(newUrl);
  const searchResults = await search.getSearchResults(this.libUrl);
  await this.setCurrentSearchResults(searchResults);
  await this.setPaginationInfo();

  return searchResults;
};

Request.prototype.printSearchResults = async function () {
  let output = '\n';

  const searchResults = this.currentSearchResults;
  // Check if searchResults has elements in it, if not the search is invalid
  if (searchResults.length === 0) {
    output = 'No search results found \n';
    return output;
  }

  output += `Showing ${this.currentPaginationInfo.paginationStart} - ${this.currentPaginationInfo.paginationEnd} of ${this.currentPaginationInfo.totalResults} results \n`;

  searchResults.forEach((result) => {
    if (result.subtitle && result.author) {
      output += `${searchResults.indexOf(result) + 1}. **${result.title}** **(${
        result.subtitle
      })** | AUTHOR: **${result.author}** | FORMAT: **${result.format}** \n`;
    } else if (result.subtitle) {
      output += `${searchResults.indexOf(result) + 1}. **${result.title}** **(${
        result.subtitle
      })** | FORMAT: **${result.format}** \n`;
    } else if (result.author) {
      output += `${searchResults.indexOf(result) + 1}.  **${
        result.title
      }** | AUTHOR: **${result.author}** | FORMAT: **${result.format}** \n`;
      // For DVDs, Blu Rays, etc
      // They don't have subtitles or authors
    } else {
      output += `${searchResults.indexOf(result) + 1}.  **${
        result.title
      }** | FORMAT: ${result.format} \n`;
    }
  });
  return output;
};

Request.prototype.checkIfRequestActive = function () {
  return this.activeRequest;
};

// SET METHODS
// Methods that set variables for each request

Request.prototype.setCurrentSearchResults = function (currentSearchResults) {
  this.currentSearchResults = currentSearchResults;
};

Request.prototype.setLibUrl = function (libUrl) {
  this.libUrl = libUrl;
};

// Sets the current pagination info for the request
Request.prototype.setPaginationInfo = async function () {
  this.currentPaginationInfo = await search.getPagination(this.libUrl);
};

Request.prototype.setActiveRequest = function (request) {
  this.activeRequest = request;
};

module.exports = Request;
