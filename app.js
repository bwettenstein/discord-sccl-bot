// const puppeteer = require('puppeteer');

const testResultsUrl =
  'https://sccl.bibliocommons.com/v2/search?query=the%20dark%20tower&searchType=smart&_ga=2.2000178.2042555556.1606619824-2090744789.1606619824';

const { searchTitle } = require('./js/homepage');
const { getSearchResults, printSearchResults } = require('./js/search');

const main = async () => {
  // const libUrl = await searchTitle('spiderman');
  // const searchResults = await getSearchResults(libUrl);
  const searchResults = await getSearchResults(testResultsUrl);
  await printSearchResults(searchResults);
};

main();
