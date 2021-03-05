// const puppeteer = require('puppeteer');
const Request = require('./js/discord/Request');
// ------------------------------------
// Generic URL used to debug
// ------------------------------------
// const testResultsUrl =
//   'https://sccl.bibliocommons.com/v2/search?query=the%20dark%20tower&searchType=smart&_ga=2.2000178.2042555556.1606619824-2090744789.1606619824';

// const { searchTitle } = require('./js/puppeteer/homepage');
// const {
//   getSearchResults,
//   printSearchResults,
// } = require('./js/puppeteer/search');

const Discord = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

const TOKEN = process.env.TOKEN;

const bot = new Discord.Client();
bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', async (message) => {
  // Prevent bots from messaging
  if (message.author.bot) return;

  if (message.content.toLowerCase() === '!start') {
    try {
      await message.channel.send(
        'Bot has started \n Available Commands: **!help**, **!search**, **!stop**'
      );

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
            // If the user doesn't make a response within 30 seconds, the application will time out and end
            time: 30000,
            errors: ['time'],
          })
          // This entire section needs to be condensed and written much neater. I'm thinking switch statements
          .then(async (m) => {
            if (m.first().content.toLowerCase().startsWith('!stop')) {
              await message.channel.send('**Application cancelled.**');
              cancel = true;
            } else if (m.first().content.toLowerCase().startsWith('!search')) {
              await message.channel.send('Searching.....');
              const searchTerm = m.first().content.split('!search')[1];
              req = new Request(message.author.id);
              await req.search(searchTerm);
              const output = await req.printSearchResults();
              await message.channel.send(output);
              await message.channel.send(
                'Available Commands: **!help**, **!search**, **!stop**, **!next**, **!prev** **!get**'
              );
            } else if (m.first().content.toLowerCase().startsWith('!next')) {
              if (req !== null && req.checkIfPaginationPossible('next')) {
                await message.channel.send('**Getting next page**');
                await req.nextPage();
                const output = await req.printSearchResults();
                await message.channel.send(output);
                await message.channel.send(
                  'Available Commands: **!help**, **!search**, **!stop**, **!next**, **!prev** **!get**'
                );
              } else {
                await message.channel.send(
                  'Either **you lack a search request** or **there is no next page of search results**'
                );
              }
            } else if (m.first().content.toLowerCase().startsWith('!prev')) {
              if (req !== null && req.checkIfPaginationPossible('prev')) {
                await message.channel.send('**Getting previous page**');
                await req.prevPage();
                const output = await req.printSearchResults();
                await message.channel.send(output);
                await message.channel.send(
                  'Available Commands: **!help**, **!search**, **!stop**, **!next**, **!prev** **!get **'
                );
              } else {
                await message.channel.send(
                  'Either **you lack a search request** or **there is no previous page of search results**'
                );
              }
            } else if (m.first().content.toLowerCase().startsWith('!get')) {
              if (req !== null) {
                const arg = m.first().content.split(' ');
                const numArg = parseInt(arg[1]);
                // Checks if the number is greater than 0 and less than the current size of the currentSearchResults
                if (
                  numArg > 0 &&
                  numArg < req.currentSearchResults.length + 1
                ) {
                  await message.channel.send(
                    req.currentSearchResults[numArg - 1].url
                  );
                } else {
                  await message.channel.send(
                    `Your input is **out of range** or **invalid**`
                  );
                }
              }
            } else if (m.first().content.toLowerCase().startsWith('!back')) {
              if (req !== null) {
                const output = await req.printSearchResults();
                await message.channel.send(output);
                await message.channel.send(
                  'Available Commands: **!search**, **!stop**, **!next**, **!prev** **!get**'
                );
              }
            } else if (m.first().content.toLowerCase().startsWith('!help')) {
              const output = 'Commands:\n';

              const startCommand = `**!start** - Starts the bot. EX - "!start",\n`;
              const stopCommand = `**!stop** - Stops the bot. EX - "!stop",\n`;
              const searchCommand = `**!search** - Searches the library for a search query. Format is "!search SEARCH_QUERY." EX - !search Batman,\n`;
              const nextCommand = `**!next** - Goes to the next page of the search results, if applicable. This command can only be used if you have an active search request. EX - "!next",\n`;
              const prevCommand = `**!prev** - Gets the previous page of the search results, if applicable. This command can only be used if you have an active search request. EX - "!prev",\n`;
              const getCommand =
                '**!get SEARCH_RESULT_NUMBER** - Gets the URL for the search result that matches the number the user ended with. Format is "!get NUMBER."\n !EX -\n  1. Batman Beyond (Season Three)\n  2. Batman Beyond (Batgirl Beyond)\n  3. Batman Beyond (Season 2)\n !get 3 returns Batman Beyond (Season 2), which is the 3rd index on the search results';

              await message.channel.send(
                `${output} ${startCommand} ${stopCommand} ${searchCommand} ${nextCommand} ${prevCommand} ${getCommand}`
              );
            }
            // PIN this comment to the discord channel
            // else if (m.first().content.toLowerCase().startsWith('!intro')) {
            //   const output = `Hello, I'm the SCCL library bot. Message me "!start" to start using me. \nREADME LINK - https://github.com/bwettenstein/discord-sccl-bot`;
            //   await message.channel.send(output);
            // }
          })
          .catch((err) => {
            message.channel.send(':hourglass: **Application timed out.**');
            cancel = true;
            console.log('Error: ', err.message, err);
          });
      }
    } catch (err) {
      await message.channel.send(err.message);
    }
  }
});
