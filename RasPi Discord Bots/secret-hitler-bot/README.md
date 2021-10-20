# Secret Roles Bot (for Discord)

This is a bot for running games with Secret Roles (such as Secret Hitler, Secret Voldemort or Secret Sith) over Discord (current version 1.0)

The bot comes with all the features needed to play through games of Secret Hitler etc, such as assigning secret roles privately, private voting, and updating and showing the game board.

## To Use The Bot
**Simply use this invite link: https://bit.ly/2XLbCwa**

You will be asked which Discord server you wish to add the Secret Roles Bot into.

_NOTE: you must have admin permissions on that Discord server._

## Done (implemented)

* Functional game of Secret Hitler (etc)
* Game board, styled to look like the classic Secret Hitler
* All game board actions - such as killing players, investigating secret roles, and veto powers
* Multiple themes available to use, and all descriptions and commands will update appropriately

## To Do (not yet implemented)

* Full testing of all features at all player counts
* Some tweaks to the game board formatting as some themes look sligtly wrong

## Installing

To install the bot, you will need to follow these steps:

* Create a Discord application and then create a bot (https://discordapp.com/developers/applications/)
* Get the __token for your bot__, as well as the __Client ID for your application__
* Authorise your bot to the Discord server where you want to run games of Codenames - note: you will need admin permissions on the Discord server you wish to add the bot (https://discordapp.com/oauth2/authorize?&client_id=YOUR_CLIENT_ID_HERE&scope=bot&permissions=8)
* Setup a folder on a machine running Node.JS (v12.0 or higher) and you may need to install Microsoft Visual Basic Build Tools as part of the Node installation (https://nodejs.org/)
* Add all of the files and directories from this folder (clone or copy from this repository)
* Add __your bot's token__ to the *config.json* file
* Navigate to the folder and install the following packages by command line using:
  * npm install discord.io winston –save
  * npm install canvas
  * npm install https://github.com/woor/discord.io/tarball/gateway_v6
  * npm install discord.js
* Finally, run the command *node secret-hitler-bot.js*
* Now make sure you have given the bot permission to read/send messages in the text channel you wish to play a game in (**don't use a your regular chat channel as the bot will delete messages to make things clear for players**)
* Now it should all work!

### Deploying the bot to Heroku
If you want to deploy the bot to Heroku, use the "secret-hitler-bot.js" code. You will also need the "config.json" file.

For installation, you will need to add the "http" module using "npm install http". It doesn't strictly _use_ the http module, but Heroku insists that the port can be specified. That was a really pain in the butt to fix. 

Finally, you may want to use the Heroku add-on "Heroku Scheduler" which keeps the bot alive by pinging it every 10 minutes. I use the command "npm -test" just to prevent it from going to sleep. Otherwise (on a free dyno) then Heroku will make the bot idle every 20 mins or so... and you will have to wait around 20 seconds for it to wake up after going idle. 

## Using the Secret Roles Bot

The bot has a number of commands to manage games via discord, as follows:

### TO FOLLOW
