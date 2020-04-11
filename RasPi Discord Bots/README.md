# The New Codenames Bot for Discord

## New Version
The entire code base has been refactored into modules for easier updating, logging and consistency. 
The bot now holds logs of servers, games, channels and issues which will be needed to evidence for verification when the Discord Bot changes come into effect in October 2020.

## Modular Code
The new modular code allows me to quickly update parts of the code which need tweaking.
This is particularly necessary as I'm hosting the Bot on a Raspberry Pi so space and ease of file access is crucial.

## New Core Tools
The core tools file (sitting above the structure for the Codenames Bot) is a set of common functions which all of the Discord Bots can use.
These have been stress tested for a reasonable load (synchronous file read/writes) but should cope with the expected number of concurrent operations for the Bots.

## Ready for the next bots
These have all been put into place to make deploying the next bot (Secret Hitler Bot) even easier. 
The code is working, but needs to be refactored for the new core tools and logging used in Codenames Bot.
