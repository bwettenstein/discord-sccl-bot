const homepage = require('./homepage');
const search = require('./search');

class Request {
  // Name is the discord user
  // activeRequest is a boolean that determines if the request is active or not
  constructor(name, activeRequest = true) {
    this.name = name;
    this.activeRequest = activeRequest;
  }
}

Request.prototype.search = async function (searchQuery) {
  const libUrl = await homepage.searchTitle(searchQuery);
  const searchResults = await search.getSearchResults(libUrl);
  return searchResults;
};

Request.prototype.printSearchResults = async function (searchResults) {
  let output = '\n';
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

module.exports = Request;
