# Codenames Bot (for Discord)

This is a bot for running games of Codenames over Discord (current version 1.2)

The bot comes with all the features needed to play through games of Codenames, including generating the Spymaster grid and a random Word grid. It will also accept guesses and keep track of which team is guessing... and also winning or losing!

## To Use The Bot
**Simply use this invite link: https://bit.ly/2UlcdTf**

You will be asked which Discord server you wish to add the Codenames Bot to.

_NOTE: you must have admin permissions on that Discord server._

## Done (implemented)

* Functional game of Codenames, with simple commands, some help and rules explanation
* Images for word grids, including a clear private view for Spymasters to see team words
* All packs of words added - now 400 available for grids and 12 different layouts
* Public bot which handles concurrent game sessions
* Set options for your games (duplicate Spymasters, clear messages on reset, clear command allowed)

## To Do (not yet implemented)

* Further randomisation of the Spymaster grids (rotate for more variety)
* A timer function - so the other team can force a guess

## Installing

To install the bot, you will need to follow these steps:

* Create a Discord application and then create a bot (https://discordapp.com/developers/applications/)
* Get the __token for your bot__, as well as the __Client ID for your application__
* Authorise your bot to the Discord server where you want to run games of Codenames - note: you will need admin permissions on the Discord server you wish to add the bot (https://discordapp.com/oauth2/authorize?&client_id=YOUR_CLIENT_ID_HERE&scope=bot&permissions=8)
* Setup a folder on a machine running Node.JS (v12.0 or higher) and you may need to install Microsoft Visual Basic Build Tools as part of the Node installation (https://nodejs.org/)
* Add the *auth.json*, the *bot.js* and the *package.json* file to this folder (clone or copy from this repository)
* Add __your bot's token__ to the *auth.json* file and the very bottom of the *bot.js* file (YOUR_TOKEN_HERE)
* Navigate to the folder and install the following packages by command line using:
  * npm install discord.io winston –save
  * npm install canvas
  * npm install https://github.com/woor/discord.io/tarball/gateway_v6
  * npm install discord.js
* Finally, run the command *node bot.js*
* Now make sure you have given the bot permission to read/send messages in the text channel you wish to play a game in (**don't use a your regular chat channel as the bot will delete messages to make things clear for players**)
* Now it should all work!

## Using the Codenames Bot

The bot has a number of commands to manage games via discord, as follows:

### !cn help
This gives a list of the main functions for the bot, which should be used in the main channel (not private messages)

### !cn rules
This gives an explanation of how to play the game Codenames and the rules for Spymasters and teams!

### !cn start
This registers the author as one of the Spymasters for this game of Codenames (the game will start once another player also registers themselves using !cn start). 

Once both players have registered using this command, the game will begin and the Spymasters will receive the Spy grid and the Word grid in a private message. 

The main channel will just see the Word grid and will be able to start guessing.

### !cn guess GUESS_WORD(S)
This allows players to guess one of the words in the grid. If the word is not found, they will be asked to try again. If the word is found, the bot will tell players whether the guess was correct or which team/character relates to that clue.

### !cn pass
This allows players to pass the turn, allowing the other team to make a guess.

### !cn clear
This allows players to clear the chat channel so they can clear the view.
_NOTE: you must change the default setting to allow this command - see "!cn options" below_

### !cn reset
This allows players to reset the game from the start in case something goes wrong! 
**IMPORTANT: if "!cn options -m" is set to true, this will also clear the chat of the last 100 messages so that players don't get confused about old word grids!**
_You can change the setting using "!cn options -m" if you DO want messages to be deleted!_

### !cn options SETTING
This allows you to set a couple of options for games running in this channel, as follows:

* **!cn options -d**
 
  (default: true) Allows/prevents the same user to be BOTH Spymasters (for testing, or for 2-3 player games)
 
* **!cn options -m**
 
  (default: false) Changes the setting so that the channel's messages are deleted on "!cn reset" for clarity

* **!cn options -c**
  
  (default: false) Allows players to use the "!cn clear" command to clear the channel messages
