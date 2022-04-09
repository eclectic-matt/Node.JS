'use strict';

/**
 * The Codenames Bot which handles games of codenames via Discord text chat
 */

/*
  Stats and monitors for the Bot
  Hoisted here as referenced in imported classes
*/
var botStats = {};
botStats.channelsAdded = 0;
botStats.gamesLogged = 0;
botStats.activeGames = 0;
// Need this for private message returns to match to games
botStats.channels = [];

// Client ID (for invite links) - public so not in config.json
const CLIENT_ID = 693209558272966686;
//https://discordapp.com/oauth2/authorize?&client_id=693209558272966686&scope=bot&permissions=8

// Import the discord.js module
const Discord = require('discord.js');
// Expose Client and MessageEmbed separately to be used
const { Client, MessageEmbed } = require('discord.js');
// Import the generic tools for the game
const tools = require('./hitler-bot-modules/tools.js');
// Import the class for the Secret Hitler Game
const SecretHitlerGame = require('./hitler-bot-modules/SecretHitlerClass.js');
// Import the HTML canvas and registerFont functions
const { registerFont, createCanvas } = require('canvas');
//https://github.com/Automattic/node-canvas/#registerfont
registerFont('Eskapade.ttf', { family: 'Eskapade'});
// Get key constants from the config file for security
const { prefix, token, name, issuesChannelID } = require('./config.json');

// Create an instance of a Discord client
const client = new Client();

// Allows for debugging, lets players join/vote multiple times
const debugFlag = true;

/*
  BOT CONSTANTS
*/
const PREFIX = prefix;  // Update in config.json
const COMM_JOIN = 'join';
const COMM_START = 'start';
const COMM_NOMINATE = 'nominate';

// ALTERNATIVE NAMES FOR THE VARIOUS ROLES
// Note: the code will always refer to Chancellor/Hitler etc
// These will only be used for bot message outputs
const CHANCELLOR = 'Chancellor';
const PRESIDENT = 'President';
const HITLER = 'Hitler';
const FASCIST = 'Fascist';
const LIBERAL = 'Liberal';
const JA = 'Ja';
const NEIN = 'Nein';

const COLOUR_HELP = 0x00ff00;
const COLOUR_FASCIST = 0xff0000;
const COLOUR_LIBERAL = 0x0000ff;

/*
  BOARD CTX CONSTANTS
*/
const CNV_WIDTH = 800;
const CNV_HEIGHT = 600;
const HEADER_HEIGHT = 50;
const SLOT_WIDTH = 130;
const SLOT_HEIGHT = 200;
const TEAM_HEIGHT = 300;
const LIB_BORDER_WIDTH = 75;
const FAS_BORDER_WIDTH = 10;
const FAIL_BORDER_WIDTH = 140;
const CARD_BORDER = 15;
const STRIP_MARGIN = 5;
const STRIP_WIDTH = 2;
const BORDER_LINES_WIDTH = 1;


const CTX_COL_TEXT = '#000000';     // BLACK
const CTX_COL_BG = '#f0d0a1';       // CREAM

const CTX_COL_FASC = '#e3612f';     // RED
const CTX_COL_FASC_BG = '#f08b5d';  // ORANGE
//const CTX_COL_FASC_BOR = '#d5431e'; // DARK RED
const CTX_COL_FASC_BOR = '#ab2b0a'; // DARK RED

const CTX_COL_LIBS = '#7c8c8c';     // BLUE
const CTX_COL_LIBS_BG = '#639cba';  // LIGHT BLUE
const CTX_COL_LIBS_BOR = '#464c62'; // DARK BLUE

/*
  GAME CONSTANTS
*/
const PLAYERS_MIN = 5;
const PLAYERS_MAX = 10;
const POLICIES_LIBERAL_COUNT = 6;
const POLICIES_FASCIST_COUNT = 11;
const BOARD_LIBERAL_COUNT = 5;
const BOARD_FASCIST_COUNT = 6;
const BOARD_FAIL_COUNT = 3;

const FAILURES_MAX = 3;

// 6 Liberal / 11 Fascist cards
const POLICY_CARDS = ['Liberal', 'Liberal', 'Liberal', 'Liberal', 'Liberal', 'Liberal', 'Fascist', 'Fascist', 'Fascist', 'Fascist', 'Fascist', 'Fascist', 'Fascist', 'Fascist', 'Fascist', 'Fascist', 'Fascist' ];

// The array used to assign roles
const PLAYER_ROLES = ['Hitler', 'Fascist', 'Liberal', 'Liberal', 'Liberal', 'Liberal', 'Fascist', 'Liberal', 'Fascist', 'Liberal'];
const PLAYER_MEMBERSHIPS = ['Fascist', 'Fascist', 'Liberal', 'Liberal', 'Liberal', 'Liberal', 'Fascist', 'Liberal', 'Fascist', 'Liberal'];

// Text descriptions for the board
const GAME_BOARD = [
  // LIBERAL
  ['', '', '', '', 'Liberals win'],
  // FASCIST
  // 5 -6 players
  ['', '', 'The President examines the top three cards', 'The President must kill a player', 'The President must kill a player. Veto power is unlocked', 'Fascists win'],
  // 7 - 8 players
  ['', 'The President investigates a player\'s identity card', 'The President picks the next Presidential Candidate', 'The President must kill a player', 'The President must kill a player. Veto power is unlocked', 'Fascists win'],
  // 9 - 10 players
  ['The President investigates a player\'s identity card', 'The President investigates a player\'s identity card', 'The President picks the next Presidential Candidate', 'The President must kill a player', 'The President must kill a player. Veto power is unlocked', 'Fascists win']
];

// FASCIST ONLY - RISKY! eval(actions)
const BOARD_ACTIONS = [
  ['', '', 'this.powerPresidentExamine()', 'this.powerPresidentKillStart()', 'this.powerPresidentKillStart(); this.powerVetoUnlocked();', 'this.gameOver(this.botData.fascist)'],
  // 7 - 8 players
  ['', 'this.powerInvestigateStart()', 'this.powerPickCandidateStart()', 'this.powerPresidentKillStart()', 'this.powerPresidentKillStart(); this.powerVetoUnlocked();', 'this.gameOver(this.botData.fascist)'],
  // 9 - 10 players
  ['this.powerInvestigateStart()', 'this.powerInvestigateStart()', 'this.powerPickCandidateStart()', 'this.powerPresidentKillStart()', 'this.powerPresidentKillStart(); this.powerVetoUnlocked();', 'this.gameOver(this.botData.fascist)']
];

const TEXT_FIVESIX = '5 OR 6 PLAYERS: 1 FASCIST AND HITLER, HITLER KNOWS WHO THE FASCIST IS.';
const TEXT_SEVENEIGHT = '7 OR 8 PLAYERS: 2 FASCISTS AND HITLER, HITLER DOESN\'T KNOW WHO THE FASCISTS ARE.';
const TEXT_NINETEN = '9 OR 10 PLAYERS: 3 FASCISTS AND HITLER, HITLER DOESN\'T KNOW WHO THE FASCISTS ARE.';

const TEXT_WELCOME = 'The Secret Hitler Bot is now active in this channel!\n\nSend a message with the following command to learn how to use the bot:\n\nhitler help\n\nIf you are having issues, you can report them using the command:\n\nhitler issue <issue description>\n\nThis will be logged with the developer who will try to push out a fix as soon as possible!\n\nVisit my site for more information and contact details:\n\nhttps://eclectic-matt.github.io/Isolation-Bots/';

/*
 The ready event is vital, it means that only _after_ this will your bot start reacting to information received from Discord
*/
client.on('ready', () => {
  console.log(tools.getDateStamp(),'Secret Hitler Bot - ready for action!');
});

// These will log errors and warnings in case of bot issues
//client.on("error", (e) => console.error(e));
//client.on("warn", (e) => console.warn(e));
//client.on("debug", (e) => console.info(e));


// Create an event listener for messages
client.on('message', message => {

  // Quick line to check if this is detecting the Bot's OWN message!
  if(message.author.id === client.user.id){
    //console.log('Message received from Bot (voting duplicate?)');
    return false;
  }

  // Need a catch here for private messages for voting
  if (message.guild === null){

    if (message.content.startsWith('vote')){

      // message will be in the format
      // vote 103048912012129 ja
      // vote ja (103048912012129)
    	let split = message.content.split(/ +/);
    	let thisChannel = split[2].replace('(','').replace(')','');
      let thisVote = split[1];

      client.channels.fetch(thisChannel)
        .then(channel => channel.game.processVote(message.author.id, thisVote))
        .catch(console.error);

    }else if (message.content.startsWith('discard')){

      // message will be in the format
      // discard policy 1 (channelID)
      let split = message.content.split(/ +/);

    	let thisChannel = split[3].replace('(','').replace(')','');
      let discardedPolicy = split[2];
      console.log('Received discard policy from ID ',message.author.id,discardedPolicy);

      // Have to wrap everything in the channel fetch to check policy options and IDs
      client.channels.fetch(thisChannel)
        .then(channel => {
          // Before processing, check this message came from the president
          let presID = channel.game.getUserIDfromUsername(channel.game.government.currPres);
          let chanID = channel.game.getUserIDfromUsername(channel.game.government.currChan);
          console.log('Inside discard channel wrapper');
          // Check if message came from the president
          if (message.author.id === presID){
            // Check if three policies currently available
            if (channel.game.policyOptions.length === 3){
              // Check if message is discarding policy 1, 2 or 3
              if ( (discardedPolicy === '1') || (discardedPolicy === '2') || (discardedPolicy === '3') ){
                console.log('Valid presidential discard received');
                channel.game.policyPhaseTwo(discardedPolicy);
                return;
              }
            }
          // Check if message came from the chancellor
          //}else if (message.author.id === chanID){
          }
          // Having to use this for testing rather than "else if" as I'm both pres & chan!
          if (message.author.id === chanID){

            // Check if two policies currently available
            if (channel.game.policyOptions.length === 2){
              // Check if message is discarding policy 1 or 2
              if ( (discardedPolicy === '1') || (discardedPolicy === '2') ){
                console.log('Valid chancellor discard received');
                channel.game.policyEnact(discardedPolicy);
              }
            }
          }
        })
        .catch(console.error);

    }else if (message.content.startsWith('investigate')){

      // Message format will be:
      // investigate player 1 - "EclecticMatt" (1039383829)
      // 0           1      2 3 4              5
      let split = message.content.split(/ +/);
      let playerName = split[4].replace('"','');
      let thisChannel = split[5].replace('(','').replace(')','');
      console.log('Received investigate request from ',message.author.id,playerName);

      client.channels.fetch(thisChannel)
        .then(channel => {
          // Before processing, check this message came from the president
          let presID = channel.game.getUserIDfromUsername(channel.game.government.currPres);
          let presUser = client.users.cache.get(presID);
          console.log('Inside investigate channel wrapper');
          // Check if message came from the president
          if (message.author.id === presID){
            // Check if the investigation power is currently active
            if (this.status.investigating){
              console.log('Valid investigation request');
              this.powerInvestigateResult(playerName);
            }else{
              console.log('Investigation requested but power not active');
              presUser.send('You are not allowed to investigate a player at this time');
            }

          }

        })
        .catch(console.error);

    }else if (message.content.startsWith('pick candidate')){

      // Message will be in the format
      // pick candidate 1 - "EclecticMatt" (293840202818)
      // 0    1         2 3 4              5
      let split = message.content.split(/ +/);
      let playerName = split[4].replace('"','');
      let thisChannel = split[5].replace('(','').replace(')','');
      console.log('Received candidate pick request from ',message.author.id,playerName);

      client.channels.fetch(thisChannel)
        .then(channel => {
          // Before processing, check this message came from the president
          let presID = channel.game.getUserIDfromUsername(channel.game.government.currPres);
          let presUser = client.users.cache.get(presID);
          console.log('Inside pick channel wrapper');
          // Check if message came from the president
          if (message.author.id === presID){
            // Check if the investigation power is currently active
            if (this.status.pickCandidate){
              console.log('Valid candidate pick request');
              this.powerPickCandidateResult(playerName);
            }else{
              console.log('Pick candidate requested but power not active');
              presUser.send('You are not allowed to pick a candidate at this time');
            }

          }
        })
        .catch(console.error);

      }else if (message.content.startsWith('kill player')){

        // Message will be in format
        // kill player 1 - "EclecticMatt" (371391239838)
        // 0    1      2 3 4              5
        let split = message.content.split(/ +/);
        let playerName = split[4].replace('"','');
        let thisChannel = split[5].replace('(','').replace(')','');
        console.log('Received kill player request from ',message.author.id, playerName);

        client.channels.fetch(thisChannel)
          .then(channel => {
            // Before processing, check this message came from the president
            let presID = channel.game.getUserIDfromUsername(channel.game.government.currPres);
            let presUser = client.users.cache.get(presID);
            console.log('Inside kill channel wrapper');
            // Check if message came from the president
            if (message.author.id === presID){
              // Check if the investigation power is currently active
              if (this.status.killPlayer){
                console.log('Valid kill player request');
                this.powerPresidentKillResult(playerName);
              }else{
                console.log('Kill player requested but power not active');
                presUser.send('You are not allowed to kill a player at this time');
              }

            }
          })
          .catch(console.error);

      }else if (message.content.startsWith('veto request')){

        // Message will be in format
        // veto request 220202933030
        let split = message.content.split(/ +/);
        let thisChannel = split[2];
        console.log('Received veto request from ',message.author.id);

        client.channels.fetch(thisChannel)
          .then(channel => {
            // Before processing, check this message came from the chancellor
            let presID = channel.game.getUserIDfromUsername(channel.game.government.currPres);
            let presUser = client.users.cache.get(presID);
            let chanID = channel.game.getUserIDfromUsername(channel.game.government.currChan);
            let chanUser = client.users.cache.get(chanID);
            console.log('Inside veto request channel wrapper');
            // Check if message came from the chancellor
            if (message.author.id === chanID){
              // Check if the veto power is currently active and request not already submitted
              if ( (this.government.vetoUnlocked) && (!this.government.vetoRequested) ){
                console.log('Valid veto request');
                this.government.vetoRequested = true;
                let vetoEmbed = new MessageEmbed()
                  .setTitle('Veto Requested')
                  .setColor(0x00ff00)
                  .setDescription('The ' + this.botData.chancellor + ' has requested that these policies are all vetoed, meaning that they will be discarded and none will be enacted.\n\n**Please note: this will count as a failed government and will move the election failure tracker one step.**\n\nYou should reply in this private message to indicate if you DECLINE or APPROVE this veto request.\n\nIt is easier to copy and paste your preferred response below to send it. If you are using the Discord app on mobile, just hold down on the message you want to send and then paste it into the "message" box below:');
                presUser.send(vetoEmbed);
                presUser.send('veto response DECLINE (' + this.channel.id + ')');
                presUser.send('veto response APPROVE (' + this.channel.id + ')');

              }else{
                console.log('Veto requested but not active');
                chanUser.send('You are not allowed to veto the policies at this time');
              }

            }
          })
          .catch(console.error);


      }else if (message.content.startsWith('veto response')){

        // Message will be in the format
        // veto response DECLINE 230420349
        let split = message.content.split(/ +/);
        let thisResponse = split[2];
        let thisChannel = split[3];
        console.log('Received veto response from ',message.author.id);

        client.channels.fetch(thisChannel)
          .then(channel => {
            // Before processing, check this message came from the president
            let presID = channel.game.getUserIDfromUsername(channel.game.government.currPres);
            let presUser = client.users.cache.get(presID);
            let chanID = channel.game.getUserIDfromUsername(channel.game.government.currChan);
            let chanUser = client.users.cache.get(chanID);
            console.log('Inside veto response channel wrapper');
            // Check if message came from the president
            if (message.author.id === presID){
              // Check if the veto was requested
              if ( channel.game.government.vetoRequested ){
                console.log('Valid veto response');
                //this.government.vetoRequested = false;

                // Process the response
                if (thisResponse === 'DECLINE'){
                  chanUser.send('The veto request was DECLINED. You must now pick from the 2 policies to enact one of these');
                  // Use blank for the discarded policy
                  channel.game.policyPhaseTwo('');
                }else if (thisResponse === 'APPROVE'){
                  // Veto APPROVED
                  let vetoEmbed = new MessageEmbed()
                    .setTitle('Veto Power Used')
                    .setColor(0x00ff00)
                    .setDescription('The ' + channel.game.botData.president + ' and the ' + channel.game.botData.chancellor + ' have agreed that these policies should be vetoed, meaning that they have been discarded and none will be enacted.\n\n**This counts as a failed government and has moved the election failure tracker one step.**');
                  channel.send(vetoEmbed);
                  // Discard policyOptions
                  channel.game.policyOptions = '';
                  channel.game.boardProgress.failure++;
                  if (channel.game.boardProgress.failure === BOARD_FAIL_COUNT){
                    channel.game.chaosPolicy();
                  }
                  channel.game.roundEnd();
                }else{
                  presUser.send('Veto response not recognised. Please try again using the responses above.');
                }

              }else{
                console.log('Kill player requested but power not active');
                presUser.send('You are not allowed to kill a player at this time');
              }

            }
          })
          .catch(console.error);




      }// END IF startsWith()

  } // END IF message.guild === null

  // If the game has not been set up yet, and it is not from a DM
  if (message.channel.game === undefined && message.guild !== null){
    // Set up the game object in this channel
    console.log(tools.getDateStamp(),'New game setup');
    message.channel.game = new SecretHitlerGame(message.channel);

    if (message.channel.game.welcomeMessageSent === false){

      console.log('Sending welcome message to channel "' + message.channel.name + '"');

      message.channel.game.welcomeMessageSent = true;
      let thisEmbed = new MessageEmbed()
        .setTitle(message.channel.game.botData.hitler + ' Bot Active!')
        .setColor(0x00ff00)
        .setDescription(TEXT_WELCOME);
      message.channel.send(thisEmbed);

    }

    botStats.channels.push(message.channel.id);
  }else if (message.channel.game === undefined){
    // Return false to prevent errors
    return false;
  }

  // Make a shallow copy of the game for easy referencing
  let theGame = message.channel.game;
  /*
    testing
  */
  //theGame.generateGameBoard();
  //message.channel.send(theGame.gameBoardCnv);

  /*
      --- JOIN COMMAND
  */
  let joinCommand = theGame.botData.prefix + ' join';
  if (message.content === joinCommand) {

    // TESTING HERE
    //theGame.generateGameBoard();

    if (theGame.status.gameOver === true){
      // Game has ended, so reset ready for new game!
      theGame.reset();
      if (theGame.options.msgClearup){
        message.channel.bulkDelete(100);
      }
    }

    let thisUser = message.author.username;

    // PREVENT DUPLICATE JOINS
    if ( (theGame.players.nameArr.indexOf(thisUser) >= 0) && (!debugFlag) ){
      // This player has already joined - error!
      // Let the channel know
      let thisEmbed = new MessageEmbed()
        .setTitle('Join Error - already registered!')
        .setColor(COLOUR_HELP)
        .setDescription('Sorry, but you have already joined this game!\n\nDue to the way the voting and nominations work for this game, you are not permitted to join more than once!\n\nOnce everyone has joined, send the message:\n\n**' + theGame.botData.prefix + ' start**\n\n');

      message.channel.send(thisEmbed);


    }else {
      // Wrap the stuff below
      theGame.addUser(message.author.id, thisUser);

      console.log(tools.getDateStamp(),' Adding user ' + thisUser);

      // Let the channel know
      let thisEmbed = new MessageEmbed()
        .setTitle(thisUser + ' has joined the game!')
        .setColor(COLOUR_HELP)
        .setDescription('Once all players have joined the game (min 5, max 10) then kick things off by typing:\n\n**' + theGame.botData.prefix + ' start**\n\nThere are currently ' + theGame.players.count + ' players who have joined!');

      message.channel.send(thisEmbed);

    }


  }   // END JOIN COMMAND

  /*
      --- START COMMAND
  */
  // If the message is "hitler start"
  let startCommand = theGame.botData.prefix + ' start';
  if (message.content === startCommand) {

    if (theGame.players.count === 0){
      // No players - join first!
      message.channel.send('No players! Send a message saying:\n\n' + theGame.botData.prefix + ' join\n\nThis will set up the game!');

    }else{

      if (theGame.status.gameOver === true){
        // Game has ended, so reset ready for new game!
        theGame.reset();
        if (theGame.options.msgClearup){
          message.channel.bulkDelete(100);
        }
      }

      //console.log('Starting game...');
      theGame.gameStart();

    }


  } // END START COMMAND

  /*
      --- NOMINATE COMMAND
  */
  // If the message is "hitler nominate"
  let nominateCommand = theGame.botData.prefix + ' nominate';
  // If the message is "nominate", the author is the nominated president, and no chancellor nominated yet
  if (message.content.startsWith(nominateCommand)) {

    if (
      (message.author.username === theGame.government.nomPres) &&
      (theGame.government.nomChan === '')
    ) {

      // Using official docs code from:
      // https://discordjs.guide/miscellaneous/parsing-mention-arguments.html#implementation
      const withoutPrefix = message.content.slice(nominateCommand.length);
    	const split = withoutPrefix.split(/ +/);
    	const command = split[0];
    	const args = split.slice(1);

      let thisNomination = tools.getUserFromMention(args[0]);
      //console.log(thisNomination.username);
      if (!thisNomination){
        message.reply('No user mentioned! The ' + theGame.botData.president + ' should try again using the command:\n\n**' + nominateCommand + ' @username**\n\nEnsuring that you tag the user you wish to nominate as ' + theGame.botData.chancellor + '!');
      }else{

        // Check if this nominee was the previous Chancellor!
        // ALSO check if the nominee was the last president and player count > 5
        if (
          (thisNomination.username === theGame.government.prevChan) ||
          ( (thisNomination.username === theGame.government.prevPres) && (theGame.players.count > 5) )
        ){
          message.reply('Sorry, you cannot nominate a ' + theGame.botData.chancellor + ' who was the previous ' + theGame.botData.chancellor + '!\n\nPlease select another nominee!');
        }else{
          theGame.chancellorNominated(thisNomination.id, thisNomination.username);
          thisNomination = thisNomination.username;
          // Let the channel know
          let thisEmbed = new MessageEmbed()
            .setTitle(thisNomination + ' has been nominated as ' + theGame.botData.chancellor + '!')
            .setColor(COLOUR_HELP)
            .setDescription('OK so we now have our proposed government!\n\n**' + theGame.botData.president + ': ' + theGame.government.nomPres + '**\n\n**' + theGame.botData.chancellor + ': ' + theGame.government.nomChan + '**\n\nAll players should now vote on whether they approve these choices by **SENDING A MESSAGE TO THE BOT IN A PRIVATE MESSAGE**\n\n**Do not vote in this channel!**\n\nOnce all the votes have been received the results will be posted in this channel!');

          message.channel.send(thisEmbed);

          // Loop through and send a private reminder to the players
          for (let i = 0; i < theGame.players.idArr.length; i++){

            let thisPlayerID = theGame.players.idArr[i];
            let embedDesc = 'You should vote privately by sending a message here for the proposed government!\n\n**' + theGame.botData.president + ': ' + theGame.government.nomPres + '**\n\n**' + theGame.botData.chancellor + ': ' + theGame.government.nomChan + '**\n\nIt is easier to copy and paste your preferred response below to send it. If you are using the Discord app on mobile, just hold down on the message you want to send and then paste it into the "message" box below:';

            let thisEmbed = new MessageEmbed()
              .setTitle('Private Voting (' + message.channel.name + ')')
              .setColor(0x00ff00)
              .setDescription(embedDesc);

            let thisDiscordUser = client.users.cache.get(thisPlayerID);
            thisDiscordUser.send(thisEmbed);

            thisEmbed = new MessageEmbed()
              .setTitle('Vote for JA!')
              .setColor(0x00ff00)
              .setDescription('vote ja (' + message.channel.id + ')');
            thisDiscordUser.send(thisEmbed);

            thisEmbed = new MessageEmbed()
              .setTitle('Vote for NEIN!')
              .setColor(0xff0000)
              .setDescription('vote nein (' + message.channel.id + ')');
            thisDiscordUser.send(thisEmbed);

          }

        } // END IF Prev Nominee

      } // END IF !thisNomination

    }else{
        message.reply('Nomination error!\n\nEither you are not the ' + theGame.botData.president + ' or we already have a nomination for the ' + theGame.botData.chancellor + '!');
    } // END IF user = nomPres & nomChan = ''

  } // END NOMINATE COMMAND

  /*
      --- HELP COMMAND
  */
  // If the message is "hitler help"
  let helpCommand = theGame.botData.prefix + ' help';
  if (message.content.startsWith(helpCommand)) {

    let helpEmbed = new MessageEmbed()
      .setTitle(theGame.botData.hitler + ' Bot Help')
      .setColor(0x00ff00)
      .setDescription('The Bot works when you send messages - some of these messages should be sent in this channel, but some should be sent in private messages with the Bot.\n\n**To avoid the most common error, either change your settings to allow Direct/Private messages from Bots, OR send a Direct Message to the Bot before you start playing** (click the Bot name and send any message to the Bot, which will allow you to receive Direct Messages during the game)\n\nThe main commands (messages) to send during the game are as follows:\n\n' + theGame.botData.hitler + ' join\nSend this message in the main channel to register yourself as a player for the game.\n\n' + theGame.botData.hitler + ' start\nSend this message in the main channel to start the game once enough players have registered using the "join" command.\n\n' + theGame.botData.hitler + ' nominate @username\nThe ' + theGame.botData.president + ' should send this message in the main channel and it will nominate the player tagged in the message as the new ' + theGame.botData.chancellor + '.\n**NOTE: this command only works when the user has been tagged (@username) so ensure that you have correctly tagged your chosen user in this message!**\n\n' + theGame.botData.hitler + ' vote\nThis command should be used in a private (direct) message to the Bot, and you will receive further instructions directly on how to correctly (and privately) vote - this is a democracy after all!');
    message.reply(helpEmbed);

  }


  /*
      --- ISSUE COMMAND
  */
  // If the message is "hitler help"
  let issueCommand = theGame.botData.prefix + ' issue';
  if (message.content.startsWith(issueCommand)) {

    // Issue logged format will be:
    // hitler issue This is the issues as reported
    let strippedIssue = message.content.slice(issueCommand.length);

    let issueEmbed = new MessageEmbed()
      .setTitle(theGame.botData.hitler + ' Bot Issue Reported')
      .setColor(0x00ff00)
      .setDescription('Thank you for reporting this issue!\n\nThis has now been logged with the developer, who will try to fix this as soon as possible.');
    message.reply(issueEmbed);

    let reportEmbed = new MessageEmbed()
      .setTitle('Issue Logged by channel "' + message.channel.name + '"')
      .setColor(0xff0000)
      .setDescription(strippedIssue);

      client.channels.fetch(issuesChannelID)
        .then(channel => {
          channel.send(reportEmbed);
        })
        .catch(console.error);

  }


}); // End channel.message function

// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login(token);    // Update in config.json
