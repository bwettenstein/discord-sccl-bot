// const puppeteer = require('puppeteer');
const Request = require('./js/discord/Request');

// ------------------------------------
// Generic URL used to debug
// ------------------------------------
const testResultsUrl =
  'https://sccl.bibliocommons.com/v2/search?query=the%20dark%20tower&searchType=smart&_ga=2.2000178.2042555556.1606619824-2090744789.1606619824';

const { searchTitle } = require('./js/puppeteer/homepage');
const {
  getSearchResults,
  printSearchResults,
} = require('./js/puppeteer/search');

const Discord = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

const TOKEN = process.env.TOKEN;

const bot = new Discord.Client();
bot.login(TOKEN);

// ------------------------------------
// Define the questions you'd like the
// application to have in this array.
// ------------------------------------
const commands = ['!search', '!next', '!previous', '!help'];

// ------------------------------------
// Holds the requests
// ------------------------------------
const requests = [];

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', async (message) => {
  // Prevent bots from messaging
  if (message.author.bot) return;

  if (message.content.toLowerCase() === '!start') {
    if (requests.includes(message.author.id)) return;

    try {
      await message.channel.send('Bot has started');

      requests.push(message.author.id);

      // ------------------------------------
      // Declares a variable called cancel which defaults to false
      // Upon true, the loop ends
      // ------------------------------------
      let cancel = false;
      let req = null;

      while (!cancel) {
        await message.channel
          .awaitMessages((msg) => msg.author.id === message.author.id, {
            max: 1,
            // Max timeout will be extended, right now it's only 30 seconds for debugging
            // time: 30000,
            errors: ['time'],
          })
          .then(async (m) => {
            if (m.first().content.toLowerCase() === '!stop') {
              await message.channel.send('**Application cancelled.**');
              requests.splice(requests.indexOf(message.author.id), 1);
              cancel = true;
            } else if (m.first().content.toLowerCase().startsWith('!search')) {
              await message.channel.send('Searching.....');
              const searchTerm = m.first().content.split('!search')[1];
              req = new Request(message.author.id);
              await req.search(searchTerm);
              const output = await req.printSearchResults();
              await message.channel.send(output);
            } else if (m.first().content.toLowerCase().startsWith('!next')) {
              await message.channel.send('**Getting next page**');
              await req.nextPage();
              const output = await req.printSearchResults();
              await message.channel.send(output);
            }
          })
          .catch((err) => {
            message.channel.send(':hourglass: **Application timed out.**');
            requests.splice(requests.indexOf(message.author.id), 1);
            cancel = true;
            console.log('Error: ', err.message, err);
          });
      }
    } catch (err) {
      await message.channel.send(err.message);
    }
  }
});

// OLD STUFF BELOW, TRYING STACKOVERFLOW METHOD NOW

// bot.on('message', async (msg) => {
//   let req = null;
//   if (msg.content.startsWith('!search')) {
//     // This is going to be changed to be much neater in the future. Right now it's just to test if the bot actually works
//     msg.reply('Searching...');
//     const searchTerm = msg.content.split('!search')[1];
//     req = new Request(msg.author.id);

//     await req.search(searchTerm);
//     const output = await req.printSearchResults();
//     msg.reply(output);
//     console.log(req instanceof Request, 'HE');
//   }

//   while (req !== null && req.checkIfRequestActive()) {
//     // console.log('called');
//     if (msg.content.startsWith('!next') && req.activeRequest) {
//       console.log('called again');
//       req.nextPage();
//     }
//   }
// });

// WAYS TO GO TO NEXT PAGE
// Check if the paginationEnd is equal to the totalResults
// If they are that means it's the last page

// Otherwise,
// EXAMPLE library url :
// https://sccl.bibliocommons.com/v2/search?query=harry%20potter&searchType=smart&_ga=2.2000178.2042555556.1606619824-2090744789.1606619824&pagination_page=14
// Get the library url and split it based off "page="
// It should return an array of size 2 (lets say it's called urlArray) where the first element is the url and the last element is the page number
// Make the new libUrl urlArray[0] + "page=" + urlArray[1]+1

// const main = async () => {
//   // const libUrl = await searchTitle('spiderman');
//   // const searchResults = await getSearchResults(libUrl);
//   const searchResults = await getSearchResults(testResultsUrl);
//   await printSearchResults(searchResults);
// };

// main();
