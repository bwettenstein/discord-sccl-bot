// const puppeteer = require('puppeteer');

const testResultsUrl =
  'https://sccl.bibliocommons.com/v2/search?query=harry%20potter&searchType=smart&_ga=2.92226394.1702661095.1606711189-258252403.1606711189';

const { searchTitle } = require('./js/homepage');
const { getSearchResults } = require('./js/search');

const main = async () => {
  // const libUrl = await searchTitle('harry potter');
  await getSearchResults(testResultsUrl);
};

main();
