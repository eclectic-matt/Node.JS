'use strict';

/**
 * The Werewolf Bot which handles games of Werewolf via Discord text chat
**/

/*
  SECRET CONSTANTS
*/
// Client ID (for invite links) https://discordapp.com/oauth2/authorize?&client_id=693234311347961887&scope=bot&permissions=8
const CLIENT_ID = 693234311347961887;
// HIDE THIS! Before uploading to Github or sharing!
const YOUR_BOT_TOKEN = 'NjkzMjM0MzExMzQ3OTYxODg3.Xn6HXQ.ac0yhZ7xvo0fWEUgLnNjMGeRCyk';


/*
  NODE IMPORTS AND DISCORD BOT SETUP
*/
// Import the discord.js module
const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const Canvas = require('canvas');

// Create an instance of a Discord client
const client = new Client();

/*
  MAIN CONSTANTS NEEDED FOR THE BOT
  Separating these out for specific constants
  This should help the bot be more portable
  and customisable for other people
*/
// COMMANDS
const PREFIX = 'werewolf';
const CMD_JOIN = 'join';
const CMD_START = 'start';
// ROLES - up to 6 players (SMALL) and then 7+ (LARGE)
const ROLES_SMALL = ['Werewolf', 'Werewolf', 'Villager', 'Seer', 'Robber', 'Troublemaker', 'Villager', 'Villager', 'Villager'];
const ROLES_LARGE = ['Seer', 'Doctor', 'Werewolf', 'Werewolf', 'Villager', 'Villager', 'Villager'];
/*
  TEXT CONSTANTS
  Using separate text constants for portability
*/
const TEXT_HELP = 'This is the help text';


function makeWerewolfChannel(message, werewolves){

    let server = message.guild;
    let wwChannelName = 'Werewolf Channel';

    // Need to set this to private instantly
    // Then add those assigned the werewolf role
    let wwChannel = member.guild.channels.cache.find(ch => ch.name === wwChannelName);


    // First, check if this channel already exists
    if (wwChannel === undefined){

      // Hopefully these steps will be pretty much instant
      message.channel.werewolfChannel = server.createChannel(name, "text");
      werewolfChannel.overwritePermissions(message.guild.roles.find('name', '@everyone'), { // Disallow Everyone to see, join, invite, or speak
         'CREATE_INSTANT_INVITE' : false,        'VIEW_CHANNEL': false,
         'CONNECT': false,                       'SPEAK': false
      });

      // Then invite all those who have been assigned the werewolf role

      for (let i = 0; i < werewolves.length; i++){
        let thisName = werewolves[i];
        werewolfChannel.overwritePermissions(message.guild.roles.find(thisName, permsName),   {//Explicitely allow the role to see, join and speak
            'VIEW_CHANNEL': true,                   'CONNECT': true
        });
      }

    }

}

var botStats = {};
botStats.channelsAdded = 0;
botStats.gamesLogged = -1;

class WerewolfGame {

  /*
    Initialise the game - sets up variables
    unique to the channel where it has been added
  */
  constructor (channel){

    // The number of channels the bot gets added to
    botStats.channelsAdded++;
    //let newDate = new Date();
    //console.log(newDate.tolocaleString(),'New game added - games logged so far = ',botStats.channelsAdded);
    console.log(Date.now(),' New game added - games logged so far = ',botStats.channelsAdded);

    // Added the channel data for reference (not used)
    this.channel = channel;

    /* UPDATE FROM HERE */
    this.players = [];
    this.playerCount = this.players.length;

    this.gameType = 'One Night';  // Default - Standard at 7+

    // The options for this channel's game
    this.options = {};
    // Force a game of "One Night" (automatically assigned based on player count)
    this.options.forceOneNight = false;
    // Clear channel messages when resetting game?
    this.options.msgClearup = false;
    // Allow players to manually clear the channel
    this.options.clearAllowed = false;

  }

  /*
    Reset the game variables to start a new game
  */
  reset(){

    this.werewolves = [];
    this.players = [];

  }

  getPlayerCount(){
    return this.players.length;
  }

  assignRoles(){
    let thePlayers = this.players;
    thePlayers = shuffle(thePlayers);

  }

}

/*
  HELPER FUNCTIONS
*/

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


/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
client.on('ready', () => {
  console.log('Werewolf Bot - ready for action!');
  console.log(' ');
});

// Create an event listener for new guild members
client.on('guildMemberAdd', member => {
  // Send the message to a designated channel on a server:
  const channel = member.guild.channels.cache.find(ch => ch.name === 'member-log');
  // Do nothing if the channel wasn't found on this server
  if (!channel) return;
  // Send the message, mentioning the member
  channel.send(`Welcome to the server, ${member}!\n\nYou are in a room with the Werewolf bot!\n\nSend a message with the following command to learn how to use the bot\n\n**werewolf help**`);
});


// Create an event listener for messages
client.on('message', message => {

  if (message.channel.game == undefined){
    // Set up the game object in this channel
    console.log('New game setup');
    message.channel.game = new WerewolfGame(message.channel);
  }

  /*
      --- START COMMAND
  */
  // If the message is "werewolf start"
  if (message.content === (PREFIX + ' ' + CMD_START)) {

    //console.log(message.guild.members.cache);
    //let users = message.guild.members.filter(member => member.presence.status === "online");
    let users = message.guild.members.cache;
    console.log(users);

    users.forEach(user => {
      console.log('Showing User ',user.username);
    });

    for (let i = 0; i < users.length; i++){
      console.log('Showing User ',i,users[i].username);
    }
    /*if (message.channel.game.teams.gameOverFlag === true){
      // Game has ended, so reset ready for new game!
      message.channel.game.reset();
      if (message.channel.game.options.msgClearup){
        message.channel.bulkDelete(100);
      }
    }else {*/
      //let theWerewolves = message.channel.cache.users;
      //makeWerewolfChannel(message, theWerewolves);
    //}

  }

}); // End channel.message function

// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login(YOUR_BOT_TOKEN);
