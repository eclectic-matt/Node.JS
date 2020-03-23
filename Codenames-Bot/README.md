# Codenames Bot (for Discord)

This is a bot for running games of Codenames over Discord. 

The bot comes with all the features needed to play through games of Codenames, including generating the Spymaster grid and a random Word grid. It will also accept guesses and keep track of which team is guessing... and also winning or losing!

## Installing

To install the bot, you will need to follow these steps:

* Create a Discord bot (https://discordapp.com/developers/applications/) and get the token for your bot, as well as the Client ID for your application
* Authorise your bot to the server where you want to run games of Codenames - note: you will need admin permissions on the server you wish to add the bot (https://discordapp.com/oauth2/authorize?&client_id=YOUR_CLIENT_ID_HERE&scope=bot&permissions=8)
* Setup a folder on a machine running Node.JS (v12.0 or higher)
* Add the auth.json, the bot.js and the package.json file to this folder (in this repository)
* Add your bot's token to the auth.json file and the very bottom of the bot.js file (YOUR_TOKEN_HERE)
* Navigate to the folder and install the following packages by command line using:
  * npm install discord.io winston –save
  * npm install https://github.com/woor/discord.io/tarball/gateway_v6
  * npm install discord.js
* Finally, run the command node bot.js
* Now make sure you have given the bot permission to read/send messages in the text channel you wish to play a game in (**don't use a your regular chat channel as the bot will delete messages to make things clear for players**)
* Now it should all work!

## Using the Codenames Bot

The bot has a number of commands to manage games via discord, as follows:

### !cn help
This gives a list of the main functions for the bot, which should be used in the main channel (not private messages)

### !cn start
This registers the author as one of the Spymasters for this game of Codenames (the game will start once another player also registers themselves using !cn start). Once both players have registered using this command, the game will begin and the Spymasters will receive the Spy grid and the Word grid in a private message. The main channel will just see the Word grid and will be able to start guessing.

### !cn guess GUESS_WORD(S)
This allows players to guess one of the words in the grid. If the word is not found, they will be asked to try again. If the word is found, the bot will tell players whether the guess was correct or which team/character relates to that clue.

### !cn next
This allows players to pass the turn, allowing the other team to make a guess.

### !cn reset
This allows players to reset the game from the start in case something goes wrong! 

**IMPORTANT: this will also clear the chat of the last 100 messages so that players don't get confused about old word grids!**
