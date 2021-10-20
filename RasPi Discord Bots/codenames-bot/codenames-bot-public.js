'use strict';

/**
 * INFORMATION
 * The Codenames Bot which handles games of codenames via Discord text chat
 * Now split into modules for easier updating and standardisation
 * Includes better logging and clear tools for development
**/

/**
  * Node Imports
**/
const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const Canvas = require('canvas');
const http = require('http');

/**
  * HTTP module setup (needed for Heroku)
**/
const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  //respondToRequest(req, res);
});
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

/**
  * My Imports
    For these imports, the following convention is used:
    c_descriptor = constants
    t_descriptor = tools
**/
//const c_colours = require('./constants/colours.js');
const c_text = require('./constants/text.js');
const c_words = require('./constants/wordsGrids.js');
const c_canvas = require('./constants/canvasVars.js');

const t_discord = require('../core-tools/coreDiscordTools.js');
const t_logs = require('../core-tools/coreLogTools.js');
const t_std = require('../core-tools/coreStandardTools.js');

/**
  * Just a few more essential constants specific to this game
**/
const { prefix, token, name, issuesChannelID } = require('./config.json');
const channelsLogFN = './logs/channelsLog.json';
const issuesLogFN = './logs/issuesLog.json';
const updatesLogFN = './logs/updatesLog.json';
const gamesLogFN = './logs/gamesLog.json';

/**
  * Then import the class for the Codenames game itself
**/
const CodenamesGame = require('./classes/CodenamesGame.js');

/**
  * Import the message commands
**/
const comm_guess = require('./messages/guess.js');
const comm_help = require('./messages/help.js');
const comm_issue = require('./messages/issue.js');
const comm_options = require('./messages/options.js');
const comm_pass = require('./messages/pass.js');
const comm_reset = require('./messages/reset.js');
const comm_rules = require('./messages/rules.js');
const comm_start = require('./messages/start.js');
const comm_stats = require('./messages/stats.js');
const comm_update = require('./messages/update.js');


/**
  * Create an instance of a Discord client
**/
const client = new Client();


/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
client.on('ready', () => {
  console.log('Codenames Bot - ready for action!');
  console.log('Bot active since: ',t_std.getDateStamp());
});

// Create an event listener for messages
client.on('message', message => {

  // Do not set up game for direct channels
  if (message.channel.game == undefined && message.guild !== null){
    // Set up the game object in this channel
    message.channel.game = new CodenamesGame(message.channel);

    let channelLogged = t_logs.checkChannelInLog(channelsLogFN, message.channel.id);
    //console.log('Channel Logged flag = ', channelLogged);

    if (channelLogged){
      // Channel already logged, do not send welcome
      console.log('Channel ' + message.channel.name + ' already logged - no welcome sent');
    }else{

      t_logs.addChannelToLog(channelsLogFN, message.channel.id);
      console.log('Channel not logged - Sending welcome message to "' + message.channel.name + '"');

      // No longer needed
      //message.channel.game.welcomeMessageSent = true;

      let thisEmbed = new MessageEmbed()
        .setTitle('Codenames Bot Active!')
        .setColor(0x00ff00)
        .setDescription(c_text.TEXT_WELCOME);
      message.channel.send(thisEmbed);
    }

  }

  /*
      --- START COMMAND (imported from start.js module)
  */
  // If the message is "!cn start"
  if (message.content === '!cn start') {

    comm_start.startCommand(message, client);

  /*
      --- HELP COMMAND (imported from help.js module)
  */
  }else if (message.content === '!cn help'){

    comm_help.helpCommand(message);


  /*
      --- RULES COMMAND (imported from rules.js module)
  */
  }else if (message.content === '!cn rules'){

    comm_rules.rulesCommand(message);


    /*
      --- CLEAR COMMAND
    */
  }else if (message.content === '!cn clear' && message.channel.game.options.clearAllowed){

    message.channel.bulkDelete(100);

  /*
      --- PASS COMMAND
  */
  }else if (message.content === '!cn pass' && message.channel.game.users.sm1 !== '' && message.channel.game.users.sm2 !== ''){

    comm_pass.passCommand(message);

  /*
      --- RESET COMMAND
  */
  }else if (message.content === '!cn reset'){

    comm_reset.resetCommand(message);

  /*
      --- ISSUES COMMAND
  */
  }else if (message.content.startsWith('!cn issue')){

    comm_issue.issueCommand(message, client);

  /*
      --- UPDATE COMMAND
  */
  }else if (message.content === '!cn update'){

    comm_update.updateCommand(message);

  }else if (message.content.startsWith('!cn options')){

    comm_options.optionsCommand(message);

  /*
      --- GUESS COMMAND
  */
  }else if (message.content.startsWith('!cn guess')){

    comm_guess.guessCommand(message);

  /**
    * --- STATS command (only for developer)
    * Check first if the message was sent from the "bot-issues-log" channel
  **/
  }else if ( (message.content === '!cn stats') && (message.channel.id === issuesChannelID) ){

    comm_stats.statsCommand(message, client);

  }

}); // End channel.message function

client.login(token);
