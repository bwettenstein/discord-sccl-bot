# discord-sccl-bot

## Description

This is a discord bot that allows users to search the [Santa Clara County Library](https://sccld.org) website through the discord client.  
Users direct message the bot their requests, and the bot returns the information it receives. After 30 seconds of no interaction with the user,  
the bot will time out.

## How to use

The bot lives on this [discord server](https://discord.gg/CS7VP4Gk). Just join it, head to the "bot-information" channel where the bot has its  
message pinned, and DM the bot "!start" in order to start it up.

Bot information: **sccl-library-bot#9658**

## Commands

- **!start**
  - Starts the bot, required in order to use the bot.
  - EX of usage: _"!start"_
- **!stop**
  - Stops the bot. This command will automatically trigger if the user hasn't sent a request within 30 seconds.
  - EX of usage: _"!stop"_
- **!help**
  - A list of all the bot commands are returned to the user.
  - EX of usage: _"!help"_
- **!search**
  - Sends a search query to the bot. The "!search" must be followed by the search term that you wish the bot to search for.
  - EX of usage: _"!search Batman"_
- **!prev**
  - Gets the previous page of search results, if applicable. This command will only successfully run if the user's search query  
    yielded results and there's a previous page of search results to grab. For example, if you've searched "Batman" and receive 9  
    pages of search results, you can only use the !prev command if you're on a page that's greater than 1 (i.e. page 2, 3, 4, etc).
  - EX of usage: _"!prev"_
- **!next**
  - Gets the next page of search results, if applicable. This command will only successfully run if the user's search query yielded  
    results and there's a next page of search results to grab. For example, if you've searched "Batman" and receive 9 pages of search  
    results, you can only use the !prev command if you're on a page that's that's not 9. (i.e. page 1, 2, 3, etc)
  - EX of usage: _"!next"_
- **!get**
  - Gets the url for the specific item in the search results. The "!get" call is followed by the number that corresponds to the  
    specific search result. For example, if you search "Harry Potter and the Order of the Phoenix" and get 8 search results, you  
    could get the 2nd search result with "!get 2."
  - EX of usage: _"!get 5"_
- **!back**
  - Gets the most recent search results and returns them to the user. This command is meant to be used after the !get command is used.
  - EX of usage: _"!back"_
