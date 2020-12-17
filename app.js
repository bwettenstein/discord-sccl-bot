// const puppeteer = require('puppeteer');
const Request = require('./js/Request');

const testResultsUrl =
  'https://sccl.bibliocommons.com/v2/search?query=the%20dark%20tower&searchType=smart&_ga=2.2000178.2042555556.1606619824-2090744789.1606619824';

const { searchTitle } = require('./js/homepage');
const { getSearchResults, printSearchResults } = require('./js/search');

const Discord = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

const TOKEN = process.env.TOKEN;

const bot = new Discord.Client();
bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', async (msg) => {
  if (msg.content === 'ping') {
    msg.reply('pong REPLY');
    msg.channel.send('pong CHANNEL SEND ');
  } else if (msg.content.startsWith('!search')) {
    // This is going to be changed to be much neater in the future. Right now it's just to test if the bot actually works
    msg.reply('Searching...');
    const searchTerm = msg.content.split('!search')[1];
    const req = new Request(msg.author.id);

    const searchResults = await req.search(searchTerm);
    const output = await req.printSearchResults(searchResults);
    msg.reply(output);
  }
});

// const main = async () => {
//   // const libUrl = await searchTitle('spiderman');
//   // const searchResults = await getSearchResults(libUrl);
//   const searchResults = await getSearchResults(testResultsUrl);
//   await printSearchResults(searchResults);
// };

// main();
