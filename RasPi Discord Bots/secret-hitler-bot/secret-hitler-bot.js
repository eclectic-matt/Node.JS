'use strict';

/**
 * BUGS TO FIX
  Player count - check board actions not changing when players killed
  SecretHitlerGame.js:1247

 * UPDATES TO MAKE
  - Rules Explanation - SPECIFIC TO THEME
  - header boxes - based on width of header text

 * THEME ADDITIONS (Carole Baskin example)
  - government (zoo management)
  - player (zoo worker)
  - legislative session (management meeting)

  * NEW THEMES
  - Secret Spider (GoT, Varys, Hand of the King) https://klaradox.de/en/secret-spider/
  - Secret Pirate () https://rpggeek.com/filepage/146920/secret-pirate-files
  -

**/


/**
 * INFORMATION
 * The Secret Hitler Bot which handles games of Secret Hitler via Discord text chat
 * Now split into modules for easier updating and standardisation
 * Includes better logging and clear tools for development
**/

/**
  * Node Imports
**/
const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');

/**
  * My Imports
    For these imports, the following convention is used:
    c_descriptor = constants
    t_descriptor = tools
**/
//const c_colours = require('./constants/colours.js');
const c_text = require('./constants/text.js');
const c_colours = require('./constants/colours.js');

const t_discord = require('../core-tools/coreDiscordTools.js');
const t_logs = require('../core-tools/coreLogTools.js');
const t_std = require('../core-tools/coreStandardTools.js');

/**
  * Just a few more essential constants specific to this game
**/
const { prefix, token, name, issuesChannelID } = require('./config.json');
const channelsLogFN = './logs/channelsLog.json';

/**
  * Then import the class for the Codenames game itself
**/
const SecretHitlerGame = require('./classes/SecretHitlerGame.js');

/**
  * Import the message commands
**/
const comm_discard = require('./messages/discard.js');
const comm_help = require('./messages/help.js');
const comm_investigate = require('./messages/investigate.js');
const comm_issue = require('./messages/issue.js');
const comm_join = require('./messages/join.js');
const comm_kill = require('./messages/killPlayer.js');
const comm_nominate = require('./messages/nominate.js');
const comm_pick = require('./messages/pickCandidate.js');
//const comm_options = require('./messages/options.js');
const comm_reset = require('./messages/reset.js');
const comm_rules = require('./messages/rules.js');
const comm_start = require('./messages/start.js');
const comm_stats = require('./messages/stats.js');
const comm_theme = require('./messages/theme.js');
const comm_update = require('./messages/update.js');
const comm_vetoRequest = require('./messages/vetoRequest.js');
const comm_vetoResponse = require('./messages/vetoResponse.js');
const comm_vote = require('./messages/vote.js');

/**
  * Create an instance of a Discord client
**/
const client = new Client();


/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
client.on('ready', () => {
  console.log('Secret Hitler Bot - ready for action!');
  console.log('Bot active since: ',t_std.getDateStamp());
});

// Create an event listener for messages
client.on('message', message => {

  // Quick line to check if this is detecting the Bot's OWN message!
  if (message.author.id === client.user.id){
    //console.log('Message received from Bot (voting duplicate?)');
    return false;
  }

  // Need a catch here for private messages for voting
  if (message.guild === null){

    if (message.content.startsWith('vote')){

      comm_vote.voteCommand(message, client);

    }else if (message.content.startsWith('discard')){

      comm_discard.discardCommand(message, client);

    }else if (message.content.startsWith('investigate')){

      comm_investigate.investigateCommand(message, client);

    }else if (message.content.startsWith('pick candidate')){

      comm_pick.pickCommand(message, client);

    }else if (message.content.startsWith('kill player')){

      comm_kill.killPlayer(message, client);

    }else if (message.content.startsWith('veto request')){

      comm_vetoRequest.vetoRequest(message, client);

    }else if (message.content.startsWith('veto response')){

      comm_vetoResponse.vetoResponse(message, client);

    }// END IF startsWith()

    return false;

  } // END IF message.guild === null

  // Do not set up game for direct channels
  if (message.channel.game == undefined && message.guild !== null){

    // Set up the game object in this channel
    message.channel.game = new SecretHitlerGame(message.channel, client);

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
        .setTitle('Secret Hitler Bot Active!')
        .setColor(c_colours.COLOUR_HELP)
        .setDescription(c_text.TEXT_WELCOME);
      message.channel.send(thisEmbed);

    }

  }

  // Make a shallow copy of the game for easy referencing
  let theGame = message.channel.game;
  // Commands are based on the botData so set them here
  let joinCommand = theGame.botData.prefix + ' join';
  let startCommand = theGame.botData.prefix + ' start';
  let nominateCommand = theGame.botData.prefix + ' nominate';
  let helpCommand = theGame.botData.prefix + ' help';
  let rulesCommand = theGame.botData.prefix + ' rules';
  let resetCommand = theGame.botData.prefix + ' reset';
  let issueCommand = theGame.botData.prefix + ' issue';
  let updateCommand = theGame.botData.prefix + ' update';
  let themeCommand = theGame.botData.prefix + ' theme';

  /*
      --- JOIN COMMAND (imported from join.js module)
  */
  if (message.content === joinCommand ) {

    comm_join.joinCommand(theGame, message);

  /*
      --- START COMMAND (imported from start.js module)
  */
  }else if (message.content === startCommand) {

    comm_start.startCommand(theGame, message, client);

  /*
      --- NOMINATE COMMAND (imported from nominate.js module)
  */
  }else if (message.content.startsWith(nominateCommand)) {

    comm_nominate.nominateCommand(theGame, message, client);

  /*
      --- THEME COMMAND (imported from theme.js module)
  */
  }else if (message.content.startsWith(themeCommand) ){

    comm_theme.themeCommand(theGame, message);

  /*
      --- HELP COMMAND (imported from help.js module)
  */
  }else if (message.content === helpCommand){

    comm_help.helpCommand(theGame, message);

  /*
      --- RULES COMMAND (imported from rules.js module)
  */
  }else if (message.content === rulesCommand){

    comm_rules.rulesCommand(theGame, message);

  /*
      --- RESET COMMAND
  */
  }else if (message.content === resetCommand){

    comm_reset.resetCommand(theGame, message);

  /*
      --- ISSUES COMMAND
  */
  }else if (message.content.startsWith(issueCommand)){

    comm_issue.issueCommand(theGame, message, client, issueCommand);

  /*
      --- UPDATE COMMAND
  */
  }else if (message.content === updateCommand){

    comm_update.updateCommand(theGame, message);

  /*
    }else if (message.content.startsWith('!cn options')){

      comm_options.optionsCommand(message);
  */
  /**
    * --- STATS command (only for developer)
    * Check first if the message was sent from the "bot-issues-log" channel
  **/
  }else if ( (message.content === 'hitler stats') && (message.channel.id === issuesChannelID) ){

    comm_stats.statsCommand(message, client);

  }

}); // End channel.message function

client.login(token);
