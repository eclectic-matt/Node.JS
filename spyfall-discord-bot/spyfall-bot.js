'use strict';

/**
 * The Codenames Bot which handles games of codenames via Discord text chat
 */

// Client ID (for invite links)
const CLIENT_ID = 0001;
//https://discordapp.com/oauth2/authorize?&client_id=693209558272966686&scope=bot&permissions=8

// Import the discord.js module
const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const Canvas = require('canvas');

const { prefix, token, name } = require('./config.json');

// Create an instance of a Discord client
const client = new Client();

/*
  BOT CONSTANTS
*/
const PREFIX = prefix;  // Update in config.json
const COMM_JOIN = 'join';
const COMM_START = 'start';
const COMM_NOMINATE = 'nominate';

const COLOUR_HELP = 0x00ff00;
const COLOUR_FASCIST = 0xff0000;
const COLOUR_LIBERAL = 0x0000ff;

/*
  GAME CONSTANTS
*/
const PLAYERS_MIN = 3;
const PLAYERS_MAX = 8;
const ROUNDS_MAX = 3;
const ROUND_MINS = 8;

// IF THE SPY WINS
const POINTS_SPY_WIN = 2;
// Points if the spy guesses the location (+ win points)
const POINTS_SPY_GUESS = 2;
// Players accuse an innocent (+ win points)
const POINTS_SPY_INNOCENT = 2;

// IF THE NON-SPIES WIN
const POINTS_NONSPY_WIN = 1;  // Each player
// The player who initiated the vote (+ win point)
const POINTS_NONSPY_ACCUSER = 1;

// LOCATIONS_ROLES[random][0] = Random Location
// LOCATIONS_ROLES[random][1][random] = Random Role
const LOCATIONS_ROLES = [
  [
    'Airplane',
    ['Spy', 'First Class Passenger',	'Air Marshall',	'Mechanic',	'Economy Passenger',	'Flight Attendant',	'Captain',	'Co-Pilot']
  ],
  [
    'Bank',
    ['Spy', 'Armored Car Driver',	'Manager',	'Consultant',	'Customer',	'Robber',	'Security Guard',	'Teller']
  ],
  [
    'Beach',
    ['Beach Waitress',	'Kite Surfer',	'Lifeguard',	'Theif',	'Beach Goer',	'Beach Photographer',	'Ice Cream Truck Driver']
  ]
];

const GAME_STATES = [
  'preGame', 'gameStart', 'roundStart', 'questions', 'timerEnd', 'roundEnd', 'gameEnd'
];

/*
  TEXT CONSTANTS
*/
const TEXT_HELP = '**Game rules**';

var botStats = {};
botStats.channelsAdded = 0;
botStats.gamesLogged = -1;
botStats.gamesActive = 0;

class SpyfallGame {

  /*
    Initialise the game - sets up variables
    unique to the channel where it has been added
  */
  constructor (channel){

    // The number of channels the bot gets added to
    botStats.channelsAdded++;

    console.log(getDateStamp(),' New game added - games logged so far = ',botStats.channelsAdded);

    // Added the channel data for reference (not used)
    this.channel = channel;

    // A status flag for game overs & running
    this.status = {};
    this.status.gameOver = false;
    this.status.gameRunning = false;

    this.botData = {};
    // Setting bot values as variables so you can change the "theme"
    this.botData.prefix = PREFIX;
    // The number of rounds to end after
    this.botData.roundsMax = ROUNDS_MAX;
    // The number of minutes before rounds end
    this.botData.roundMins = ROUND_MINS;

    // An object holding player info
    this.players = {};
    // Array holding the player IDs
    this.players.idArr = [];
    // Array holding player names (usernames)
    this.players.nameArr = [];
    // Player roles for this round
    this.players.roles = [];
    // Array holding players points
    this.players.points = [];
    // Array of whether each player has accused this round
    this.players.accuser = [];
    // The number of players
    this.players.count = 0;

    // The current location
    this.location = '';

  }

  /*
    GAME FUNCTIONS
  */

  // Reset the game variables to start a new game
  resetGame(){

    this.status.gameOver = false;
    this.status.gameRunning = false;

    this.players.idArr = [];
    this.players.nameArr = [];
    this.players.roles = [];
    this.players.points = [];
    this.players.accuser = [];
    this.players.count = 0;

    this.location = '';

  }

  // Reset the location and player roles ready for the next round
  resetRound(){

    this.players.roles = [];
    this.players.accuser = [];
    this.location = '';

  }

  // Add user to the next game 'bot join'
  addUser(id, name){
    // Use ids to ensure no duplicates
    this.players.idArr.push(id);
    // Add names for quick reference
    this.players.nameArr.push(name);
    this.players.count++;
  }

  // Triggered when a user sends 'bot start'
  gameStart(){

    // Check the player count is valid
    if (this.players.count < PLAYERS_MIN || this.players.count > PLAYERS_MAX){
      // Error! You must have between 3 and 8 players

    }else{

      this.status.gameRunning = true;
      this.roundStart();

    }

  }

  // Select location, allocate roles, send to players
  roundStart(){

    // Assign secret identity and membership cards
    // Shuffle the ID array (this will match up to roles)
    let thePlayers = shuffle(this.players.idArr);

  }


  /* HELPER FUNCTIONS WITHIN GAME */
  getUsernameFromUserID(id){
    let thisPlayerIndex = this.players.idArr.indexOf(id);
    return this.players.nameArr[thisPlayerIndex];
  }

  getUserIDfromUsername(username){
    let thisPlayerIndex = this.players.nameArr.indexOf(username);
    return this.players.idArr[thisPlayerIndex];
  }

}

// Function to shuffle array
//https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

// Generic - get user object from mention (can then get user.id or user.username)
function getUserFromMention(mention) {
	if (!mention) return false;

	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);

		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}

		return client.users.cache.get(mention);
	}
}

function getDateStamp(){
  let date_ob = new Date();
  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  let hours = ("0" + date_ob.getHours()).slice(-2);
  let minutes = ("0" + date_ob.getMinutes()).slice(-2);
  let seconds = date_ob.getSeconds();
  let dStr = hours + ":" + minutes + ":" + seconds + " " + date + "/" + month + "/" + year;
  return dStr;
}

/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
client.on('ready', () => {
  console.log('Spyfall Bot - ready for action!');
  //console.log(' ');
});

// Create an event listener for messages
client.on('message', message => {

  // If the game has not been set up yet, and it is not from a DM
  if (message.channel.game === undefined && message.guild !== null){
    // Set up the game object in this channel
    console.log(getDateStamp(),'New game setup');
    message.channel.game = new SpyfallGame(message.channel);
  }else if (message.channel.game === undefined){
    // Return false to prevent errors
    return false;
  }

  /*
      --- JOIN COMMAND
  */
  let joinCommand = message.channel.game.botData.prefix + ' join';
  if (message.content === joinCommand) {

    if (message.channel.game.status.gameOver === true){
      // Game has ended, so reset ready for new game!
      message.channel.game.resetGame();
      if (message.channel.game.options.msgClearup){
        message.channel.bulkDelete(100);
      }
    }

    if (message.channel.game.status.gameRunning === true){
      message.channel.send('You cannot join now - a game is running!');
      return false;
    }

    let thisUser = message.author.username;
    /*
      ADD THIS IN WHEN OUT OF TESTING - PREVENT DUPLICATES
      if (message.game.players.nameArr.indexOf(thisUser) >= 0){
        // This player has already joined - error!

      }else {
        // Wrap the stuff below

      }
    */
    message.channel.game.addUser(message.author.id, thisUser);

    console.log(getDateStamp(),' Adding user ' + thisUser);

    // Let the channel know
    let thisEmbed = new MessageEmbed()
      .setTitle(thisUser + ' has joined the game!')
      .setColor(COLOUR_HELP)
      .setDescription('Once all players have joined the game (min ' + PLAYERS_MIN + ', max ' + PLAYERS_MAX + ') then kick things off by typing:\n\n**' + message.channel.game.botData.prefix + ' start**\n\nThere are currently ' + message.channel.game.players.count + ' players who have joined!');

    message.channel.send(thisEmbed);

  }

  /*
      --- START COMMAND
  */
  // If the message is "hitler start"
  let startCommand = message.channel.game.botData.prefix + ' start';
  if (message.content === startCommand) {

    if (message.channel.game.players.count === 0){
      // No players - join first!
      message.channel.send('No players! Send a message saying:\n\n' + message.channel.game.botData.prefix + ' join\n\nThis will set up the game!');

    }else{

      if (message.channel.game.status.gameOver === true){
        // Game has ended, so reset ready for new game!
        message.channel.game.reset();
        if (message.channel.game.options.msgClearup){
          message.channel.bulkDelete(100);
        }
      }

      //console.log('Starting game...');
      message.channel.game.gameStart();

    }

  }

  /*
      --- NOMINATE COMMAND
  */
  // If the message is "hitler nominate"
  let nominateCommand = message.channel.game.botData.prefix + ' nominate';
  // If the message is "nominate", the author is the nominated president, and no chancellor nominated yet
  if (message.content.startsWith(nominateCommand)) {

    if (
      (message.author.username === message.channel.game.government.nomPres) &&
      (message.channel.game.government.nomChan === '')
    ) {

      // Using official docs code from:
      // https://discordjs.guide/miscellaneous/parsing-mention-arguments.html#implementation
      const withoutPrefix = message.content.slice(nominateCommand.length);
    	const split = withoutPrefix.split(/ +/);
    	const command = split[0];
    	const args = split.slice(1);

      let thisNomination = getUserFromMention(args[0]);
      //console.log(thisNomination.username);
      if (!thisNomination){
        message.reply('No user mentioned! The ' + message.channel.game.botData.president + ' should try again using the command:\n\n**' + nominateCommand + ' @username**\n\nEnsuring that you tag the user you wish to nominate as ' + message.channel.game.botData.chancellor + '!');
      }else{

        message.channel.game.chancellorNominated(thisNomination.id, thisNomination.username);
        thisNomination = thisNomination.username;
        // Let the channel know
        let thisEmbed = new MessageEmbed()
          .setTitle(thisNomination + ' has been nominated as ' + message.channel.game.botData.chancellor + '!')
          .setColor(COLOUR_HELP)
          .setDescription('OK so we now have our proposed government!\n\n**' + message.channel.game.botData.president + ': ' + message.channel.game.government.nomPres + '**\n\n**' + message.channel.game.botData.chancellor + ': ' + message.channel.game.government.nomChan + '**\n\nAll players should now vote on whether they approve these choices by **SENDING A MESSAGE TO THE BOT IN A PRIVATE MESSAGE**\n\n**Do not vote in this channel!**\n\nOnce all the votes have been received the results will be posted in this channel!');

        message.channel.send(thisEmbed);
      }
    }else{
        message.reply('Nomination error!\n\nEither you are not the ' + message.channel.game.botData.president + ' or we already have a nomination for the ' + message.channel.game.botData.chancellor + '!');
    }

  } // End nominate command

}); // End channel.message function

// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login(token);    // Update in config.json
