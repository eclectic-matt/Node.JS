'use strict';

/**
 * The Codenames Bot which handles games of codenames via Discord text chat
 */

// Client ID (for invite links)
const CLIENT_ID = 693209558272966686;
//https://discordapp.com/oauth2/authorize?&client_id=693209558272966686&scope=bot&permissions=8

// Import the discord.js module
const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const Canvas = require('canvas');

const { prefix, token, name } = require('./config.json');

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

const CTX_COL_TEXT = '#000000'; // BLACK
const CTX_COL_FASC = '#bd1e21'; // RED
const CTX_COL_LIBS = '#1e4ebd'; // BLUE
const CTX_COL_BG = '#bdb586';   // CREAM


/*
  GAME CONSTANTS
*/
const PLAYERS_MIN = 5;
const PLAYERS_MAX = 10;
const POLICIES_LIBERAL_COUNT = 6;
const POLICIES_FASCIST_COUNT = 11;
const BOARD_LIBERAL_COUNT = 5;
const BOARD_FASCIST_COUNT = 6;
const BOARD_FAIL_COUNT = 4;

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

const TEXT_HELP = '**Game rules**';

var botStats = {};
botStats.channelsAdded = 0;
botStats.gamesLogged = 0;
botStats.activeGames = 0;
// Need this for private message returns to match to games
botStats.channels = [];

class SecretHitlerGame {

  /*
    Initialise the game - sets up variables
    unique to the channel where it has been added
  */
  constructor (channel){

    // Added the channel data for reference (not used)
    this.channel = channel;

    // The number of channels the bot gets added to
    botStats.channelsAdded++;
    console.log(getDateStamp(),' New channel added in "' + this.channel.name + '". Channels added so far = ',botStats.channelsAdded);

    // A status flag for game overs & running
    this.status = {};
    this.status.gameOver = false;
    this.status.gameRunning = false;
    this.status.investigating = false;
    this.status.pickCandidate = false;

    this.botData = {};
    // Setting bot values as variables so you can change the "theme"
    this.botData.prefix = PREFIX;
    // The "title" of the chancellor and president
    this.botData.chancellor = CHANCELLOR;
    this.botData.president = PRESIDENT;
    // The "title" of Hitler
    this.botData.hitler = HITLER;
    // The "title" of the fascists and liberals
    this.botData.fascist = FASCIST;
    this.botData.liberal = LIBERAL;
    this.botData.yes = JA;
    this.botData.no = NEIN;

    // An object holding player info
    this.players = {};
    // Array holding the player IDs
    this.players.idArr = [];
    // Array holding player names (usernames)
    this.players.nameArr = [];
    // Secret roles (just idArr shuffled but kept separate for investigations)
    this.players.secretRoles = [];
    // Array holding the VOTES of players (prevent duplicates)
    this.players.votesArr = [];
    // Count of VALID votes received
    this.players.votesCount = 0;
    // The number of players
    this.players.count = 0;
    // The player who is Hitler (shuffled arr[0])
    this.players.hitler = '';
    // The array of fascist players (for other players)
    this.players.fascists = [];

    // The current board progess (lib/fas/fails recorded)
    this.boardProgress = {};
    this.boardProgress.liberal = 0;
    this.boardProgress.fascist = 0;
    // This counts if 3 gvmt votes have failed in a row (chaos ensues)
    this.boardProgress.failure = 0;
    // Then a record of the lib/fas policies enacted
    this.boardProgress.arr = [];

    // The image for the game board
    this.gameBoardCnv = null;

    // The deck of policy cards
    this.policyDeck = shuffle(POLICY_CARDS);
      //console.log(this.policyDeck);
    // To be sent between Pres and Chan
    this.policyOptions = [];

    // An object holding the current government members
    this.government = {};
    // The current president and chancellor
    this.government.currPres = '';
    this.government.currChan = '';
    // The index of the player currently president (increments)
    this.government.presIndex = 0;
    // The previous president and chancellor (prevent voting)
    this.government.prevPres = '';
    this.government.prevChan = '';
    // The NOMINATED president and chancellor (not elected)
    this.government.nomPres = '';
    this.government.nomChan = '';
    this.government.vetoUnlocked = false;

    // The options for this channel's game
    this.options = {};
    // Duplicate spymasters allowed? Both as same user
    this.options.dupSpymasterAllowed = true;
    // Clear channel messages when resetting game?
    this.options.msgClearup = false;
    // Allow players to manually clear the channel
    this.options.clearAllowed = false;

  }

  /*
    GAME FUNCTIONS
  */

  // Reset the game variables to start a new game
  reset(){

    this.status.gameOver = false;
    this.status.gameRunning = false;

    this.players.idArr = [];
    this.players.nameArr = [];
    this.players.votesArr = [];
    this.players.votesCount = 0;
    this.players.count = 0;
    this.players.hitler = '';
    this.players.fascists = [];

    this.boardProgress.liberal = 0;
    this.boardProgress.fascist = 0;
    this.boardProgress.failure = 0;
    this.boardProgress.arr = [];

    this.gameBoardCnv = null;

    this.policyDeck = shuffle(POLICY_CARDS);
    this.policyOptions = [];

    this.government.currPres = '';
    this.government.currChan = '';
    this.government.presIndex = 0;
    this.government.prevPres = '';
    this.government.prevChan = '';
    this.government.nomPres = '';
    this.government.nomChan = '';
    this.government.vetoUnlocked = false;

  }

  // Add user to the next game 'bot join'
  addUser(id, name){
    // Use ids to ensure no duplicates
    this.players.idArr.push(id);
    // Add names for quick reference
    this.players.nameArr.push(name);
    this.players.count++;
    // Make empty space in the array (no vote received)
    if (!debugFlag){
      this.players.votesArr.push('');
    }

  }

  // Triggered when a user sends 'bot start'
  gameStart(){

    // Check the player count is valid
    if (this.players.count < PLAYERS_MIN || this.players.count > PLAYERS_MAX){
      // Error! You must have between 5 and 11 players
      let thisEmbed = new MessageEmbed()
        .setTitle('Player Count Error!')
        .setColor(0x00ff00)
        .setDescription('Sorry, but this game requires between ' + PLAYERS_MIN + ' and ' + PLAYERS_MAX + ' players to work.\n\nTry again once enough players have joined the game!');
        this.channel.send(thisEmbed);

    }else{

      botStats.gamesLogged++;
      botStats.activeGames++;
      this.status.gameRunning = true;
      // Assign secret identity and membership cards
      // Shuffle the ID array (this will match up to roles)
      let thePlayers = shuffle(this.players.idArr);
      this.players.secretRoles = thePlayers;
      // Hitler will be the first player, from PLAYER_ROLES[0]
      let hitlerId = this.players.idArr.indexOf(thePlayers[0]);
      //this.players.idArr.find(id => id === thePlayers[0]);
      this.players.hitler = this.players.nameArr[hitlerId];
      console.log('Hitler will be ', this.players.hitler);
      // Then loop through the players
      for (let i = 0; i < this.players.count; i++){
        let thisPlayerID = thePlayers[i];
        let thisPlayerIndex = this.players.idArr.indexOf(thisPlayerID);
        //let thisPlayerName = this.players.nameArr.find(id => id === thisPlayerID);
        let thisPlayerName = this.players.nameArr[thisPlayerIndex];
        let thisRole = PLAYER_ROLES[i];
        if (thisRole === 'Fascist'){
          this.players.fascists.push(thisPlayerName);
        }
      }
      // OK, now to send a message to each of the players
      for (let i = 0; i < this.players.count; i++){
        let thisPlayerID = thePlayers[i];
        let thisPlayerIndex = this.players.idArr.indexOf(thisPlayerID);
        //let thisPlayerName = this.players.nameArr.find(id => id === thisPlayerID);
        let thisPlayerName = this.players.nameArr[thisPlayerIndex];
        let thisRole = PLAYER_ROLES[i];

        let embedTitle = '';
        let embedDesc = '';
        let embedCol = COLOUR_FASCIST;
        if (thisRole === 'Hitler'){

          embedTitle = 'Your Secret Role is - ' + this.botData.hitler;

          if (this.players.count < 7){
            // Hitler knows who the fascist is (only one!)
            embedDesc = 'You are ' + this.botData.hitler + ' and the ' + this.botData.fascist + ' is:\n\n' + this.players.fascists[0];

          }else{
            // Hitler does NOT know who the fascist is
            embedDesc = 'You are ' + this.botData.hitler + ' but you are not allowed to know who the ' + this.botData.fascist + 's are! (7-players or more)';

          }

        }else if (thisRole === 'Fascist'){

          // Fascists know who the fascists are, and hitler
          embedTitle = 'Your Secret Role is - ' + this.botData.fascist;

          if (this.players.count < 7){
            // There is only 1 fascist at this player count (yourself)
            embedDesc = 'You are a ' + this.botData.fascist + ' and so you know that:\n\n**' + this.botData.hitler + ' is: ' + this.players.hitler + '**\n\nYou are the only ' + this.botData.fascist + ' at this player count (5-6 players)';

          }else{
            // Fascists know who the fascists are, and hitler
            embedDesc = 'You are a ' + this.botData.fascist + ' and so you know that:\n\n**' + this.botData.hitler + ' is: ' + this.players.hitler + '**\n\nYou also know that the only players on the ' + this.botData.fascist + ' team are:\n\n';
            for (var j = 0; j < this.players.fascists.length; j++){
              // Skip if this is your name!
              if (this.players.fascists[j] !== thisPlayerName){
                embedDesc += this.players.fascists[j] + '\n\n';
              }
            }

          }


        }else if (thisRole === 'Liberal'){

          embedTitle = 'Your Secret Role is - ' + this.botData.liberal;
          // You... know.... NOTHING!
          embedCol = COLOUR_LIBERAL;
          embedDesc = 'You are a ' + this.botData.liberal + '\n\nYou do not know anyone else\'s secret role!';

        }

        let thisEmbed = new MessageEmbed()
          .setTitle(embedTitle)
          .setColor(embedCol)
          .setDescription(embedDesc);

        let thisDiscordUser = client.users.cache.get(thisPlayerID);

        thisDiscordUser.send(thisEmbed);

      }

      // Roles assigned - remind players to check direct bot messages
      let thisEmbed = new MessageEmbed()
        .setTitle('Game Started - Secret Roles Assigned!')
        .setColor(COLOUR_HELP)
        .setDescription('You have all been assigned your secret roles! This will be in a private (direct) message from the ' + this.botData.hitler + ' Bot!\n\n**Do Not Share This Information With Anyone!**\n\nThe first ' + this.botData.president + ' shall now be assigned randomly - see below...');

      this.channel.send(thisEmbed);

      this.generateGameBoard();

      // Assign the first President randomly
      let randomIndex = Math.floor(Math.random() * this.players.idArr.length);
      console.log('Nominee Index',randomIndex);
      // The index for this player - to increment each round
      this.government.presIndex = randomIndex;
      let presNomineeID = this.players.idArr[randomIndex];
      let presNomineeName = this.players.nameArr[randomIndex];
      this.government.nomPres = presNomineeName;

      // Let the channel know
      thisEmbed = new MessageEmbed()
        .setTitle(this.botData.president + ' randomly assigned - ' + presNomineeName + '!')
        .setColor(COLOUR_HELP)
        .setDescription('The first ' + this.botData.president + ' has been randomly assigned by the bot!\n\n**The first ' + this.botData.president + ' nominee is: ' + presNomineeName + '!**\n\nThis ' + this.botData.president + ' nominee should now nominate the first ' + this.botData.chancellor + ' by typing:\n\n**' + this.botData.prefix + ' nominate @username**\n\n(make sure the username has been mentioned/tagged in your message)');

      this.channel.send(thisEmbed);

    }
  }

  // Rest of Chancellor nomination handled in the "nominate" message received
  chancellorNominated(userId, userName){
    console.log('Nomination for Chancellor received as: ' + userName);
    this.government.nomChan = userName;
  }

  // TESTING FUNCTION FOR NOW
  processVote(playerID, vote){
    //console.log('Vote received for game in channel - ', this.channel.name);
    console.log('Vote received from ',playerID,' who voted: "' + vote + '"');
    let thisPlayerIndex = this.players.idArr.indexOf(playerID);
    if (thisPlayerIndex >= 0){
      // YES! This player should be voting!
      // Changed this for testing
      if ( !debugFlag ){
      //if ( (this.players.votesArr[thisPlayerIndex] !== '') && (!debugFlag) ){
        // Vote already logged - cheeky!
        let thisDiscordUser = client.users.cache.get(playerID);
        thisDiscordUser.send('You have already voted, you cheeky monkey!');
      }else{
        // Log this player's vote
        // Using this for testing (where I submit all the votes)
        if (!debugFlag){
          this.players.votesArr[thisPlayerIndex] = vote;
        }else{
          this.players.votesArr.push(vote);
        }

        this.players.votesCount++;
        //console.log(this.players.votesCount + ' votes received out of ' + this.players.count + ' players');
        if (this.players.votesCount === this.players.count){
          // ALL VOTES RECEIVED!
          this.processGovernmentVotes(this.players.votesArr);
        }
      }
    }else{
      // Player not recognised!
      let thisDiscordUser = client.users.cache.get(playerID);
      thisDiscordUser.send('Sorry, you are not recognised as a player :-(');
    }
  }

  // Update based on government votes
  processGovernmentVotes(votes){

    console.log('All votes received - processing results now!');
    let jaVotes = 0;
    let neinVotes = 0;
    for (let i = 0; i < votes.length; i++){
      //console.log('Processing vote (' + i + ') - ' + votes[i]);
      if (votes[i] === 'ja'){
        jaVotes++;
      }else{
        neinVotes++;
      }
    }

    // Let the channel know
    let thisEmbed = new MessageEmbed()
      .setTitle('The Voting Results are in...')
      .setColor(COLOUR_HELP)
      .setDescription('All the votes have now been cast.\n\nThis government received:\n\n' + jaVotes + ' votes for JA!\n\n' + neinVotes + ' votes for NEIN!');
    this.channel.send(thisEmbed);

    // MAJORITY YES needed
    if (jaVotes > neinVotes){

      // Government elected!
      // Let the channel know
      thisEmbed = new MessageEmbed()
        .setTitle('Government Elected!')
        .setColor(COLOUR_HELP)
        .setDescription('Please stand in salute at your newly-elected government!\n\n**President: ' + this.government.nomPres + '**\n\n**Chancellor: ' + this.government.nomChan + '**\n\nThey are now entering the Legislative session and will decide on a policy to enact (government - check your private message from the Bot)');
      this.channel.send(thisEmbed);

      this.government.currChan = this.government.nomChan;
      this.government.currPres = this.government.nomPres;
      // Reset the failure tracker
      this.boardProgress.failure = 0;

      // Check if the Chancellor is Hitler and 3 fascist policies enacted
      if (
        (this.government.currChan === this.players.hitler) &&
        (this.boardProgress.fascist >= 3)
      ){
        let thisEmbed = new MessageEmbed()
          .setTitle('Bad News Everyone...')
          .setColor(0xff0000)
          .setDescription('Introducing your new ' + this.botData.chancellor + '...\n\n**It\'s ' + this.botData.hitler + '!**');
        this.channel.send(thisEmbed);
        this.gameOver(this.botData.fascist);
      }

      // Now allocate policy cards to the President
      this.policyPhaseOne();

    }else{
      // Government rejected!
      this.boardProgress.failure++;
      if (this.boardProgress.failure === FAILURES_MAX){
        // Government in chaos! Top policy automatically enacted!
        this.chaosPolicy();
      }
      // Move the nominated president round to the next player

    }

  }

  // Used if the government fails 3 times in a row
  chaosPolicy(){

  }

  /*
    Draw pile < 3 so shuffle together
  */
  shuffleDeck(){

    this.policyDeck = shuffle(POLICY_CARDS);
    let deckEmbed = new MessageEmbed()
      .setTitle('Card deck has fewer than 3 cards - shuffling')
      .setColor(COLOUR_HELP)
      .setDescription('The deck of policy cards has run out - now shuffling the entire deck together ready to form the new draw deck.');
    this.channel.send(deckEmbed);
  }

  // Send the President the top 3 policies from the deck
  policyPhaseOne(){

    // Get the President ID
    let presID = this.getUserIDfromUsername(this.government.currPres);
    let presUser = client.users.cache.get(presID);
    // Shuffle the policy deck if fewer than 3 cards
    if (this.policyDeck.length < 3){
      this.shuffleDeck();
    }
    this.policyOptions = this.policyDeck.splice(0,3);
    console.log('Phase One Policies ',this.policyOptions);
    let thisEmbed = new MessageEmbed()
      .setTitle(this.botData.president + ' - Legislative Session')
      .setColor(COLOUR_HELP)
      .setDescription('You must now DISCARD one of the following policies from the list below.\n\n**You should not say anything or give any indication of what the policies below are!**\n\nThe remaining two policies will be sent to the ' + this.botData.chancellor + ' who will select which of those two policies to enact.\n\nThe three policies available are as follows:\n\nPOLICY 1 - ' + this.policyOptions[0] + '\nPOLICY 2 - ' + this.policyOptions[1] + '\nPOLICY 3 - ' + this.policyOptions[2] + '\n\nIt is easier to copy and paste your preferred response below to send it. If you are using the Discord app on mobile, just hold down on the message you want to send and then paste it into the "message" box below:');
    presUser.send(thisEmbed);
    presUser.send('discard policy 1 (' + this.channel.id + ')');
    presUser.send('discard policy 2 (' + this.channel.id + ')');
    presUser.send('discard policy 3 (' + this.channel.id + ')');

  }

  // Send the remaining 2 policies to the Chancellor
  policyPhaseTwo(discardID){

    // Note discardID is 1/2/3 but relates to policyOptions[id - 1];
    console.log('Policy Phase 2 started',discardID);
    // Now splice that index from the policyOptions
    this.policyOptions.splice(discardID - 1, 1);
    // Now send the remaining policies to the Chancellor
    console.log('Phase Two Policies ',this.policyOptions);
    let chanID = this.getUserIDfromUsername(this.government.currChan);
    let chanUser = client.users.cache.get(chanID);
    let thisEmbed = new MessageEmbed()
      .setTitle(this.botData.chancellor + ' - Legislative Session')
      .setColor(COLOUR_HELP)
      .setDescription('You must now DISCARD one of the following policies from the list below.\n\n**You should not say anything or give any indication of what the policies below are!**\n\n**The remaining policy will be enacted and shown to the other players.**\n\nThe two policies available are as follows:\n\nPOLICY 1 - ' + this.policyOptions[0] + '\nPOLICY 2 - ' + this.policyOptions[1] + '\n\nIt is easier to copy and paste your preferred response below to send it. If you are using the Discord app on mobile, just hold down on the message you want to send and then paste it into the "message" box below:');
    chanUser.send(thisEmbed);
    chanUser.send('discard policy 1 (' + this.channel.id + ')');
    chanUser.send('discard policy 2 (' + this.channel.id + ')');
    if (this.government.vetoUnlocked){
      thisEmbed = new MessageEmbed()
        .setTitle('Veto Available')
        .setColor(COLOUR_HELP)
        .setDescription('Note: the veto power is available and if you do not like either of the policy options above, you can request a veto with the ' + this.botData.president + ' by sending the following message:');
        chanUser.send(thisEmbed);
        chanUser.send('veto ' + this.channel.id);
    }
  }

  // Discard that policy and enact the remaining policy
  policyEnact(discardID){

    console.log('Policy Enact discard',discardID);
    // Note discardID is 1/2 but relates to policyOptions[id - 1];
    this.policyOptions.splice(discardID - 1, 1);
    let enactedPolicy = this.policyOptions[0];
    console.log('The enacted policy will be: ', enactedPolicy);
    this.boardProgress.arr.push(enactedPolicy);

    // Get the board actions for this player count
    // Not needed for liberals but didn't want 3 nested switches
    let boardActions = [];
    switch (this.players.count){
      case 5:
      case 6:
        boardActions = BOARD_ACTIONS[0];
        break;
      case 7:
      case 8:
        boardActions = BOARD_ACTIONS[1];
        break;
      case 9:
      case 10:
        boardActions = BOARD_ACTIONS[2];
        break;
    }
    // Now process the enacted policy
    let embedCol = 0xff0000;
    switch (enactedPolicy){

      case this.botData.fascist:

        this.boardProgress.fascist++;
        this.generateGameBoard();

        // Let the channel know which policy was enacted - the updated board will follow
        let fascistEmbed = new MessageEmbed()
          .setTitle(enactedPolicy + ' policy enacted!')
          .setColor(embedCol)
          .setDescription('**The elected government have enacted a ' + enactedPolicy + ' policy.**\n\nThe updated game board is shown below and any actions on this game board space will now be carried out.');
        this.channel.send(fascistEmbed);

        let thisAction = boardActions[this.boardProgress.fascist];
        if (thisAction !== ''){
          console.log('Evaluating board action');
          // I know this is risky, but will get board actions applied effectively
          eval(thisAction);

          /*
            OK, next tricky bit to sort out
            How do you process actions - like nominating the next president,
            or killing a player... and THEN continue by incrementing the presIndex?

            EASY - HAVE A ROUND END FUNCTION - eegit!
          */
        }else{
          console.log('No board action - straight to round end');
          this.roundEnd();
        }
        break;

      case this.botData.liberal:

        embedCol = 0x0000ff;
        this.boardProgress.liberal++;
        this.generateGameBoard();
        // Let the channel know which policy was enacted - the updated board will follow
        let liberalEmbed = new MessageEmbed()
          .setTitle(enactedPolicy + ' policy enacted!')
          .setColor(embedCol)
          .setDescription('**The elected government have enacted a ' + enactedPolicy + ' policy.**\n\nThe updated game board is shown below and any actions on this game board space will now be carried out.');
        this.channel.send(liberalEmbed);
        this.roundEnd();
        break;
    }

  }

  /*
    This should happen after any president actions have completed!
  */
  roundEnd(){

    console.log('Round end now');

    //https://gist.github.com/y21/a599ef74c8746341dbcbd32093a69eb8#resolving-promises
    // Send the game board with a callback to ensure they arrive in order
    this.channel.send(this.gameBoardCnv).then((newMessage) => {

      // Now the remainder of round end
      console.log('Inside round end callback - expect "this" errors');

      // Increment the President index
      this.government.presIndex++;
      if (this.government.presIndex >= this.players.idArr.length){
        this.government.presIndex = 0;
      }

      let presNomineeID = this.players.idArr[this.government.presIndex];
      let presNomineeName = this.players.nameArr[this.government.presIndex];
      this.government.nomPres = presNomineeName;

      // Assign the previous president and chancellor (to prevent voting)
      this.government.prevPres = this.government.currPres;
      this.government.prevChan = this.government.currChan;

      // Let the channel know
      let thisEmbed = new MessageEmbed()
        .setTitle('The ' + this.botData.president + ' role has been passed to - ' + presNomineeName + '!')
        .setColor(COLOUR_HELP)
        .setDescription('The first ' + this.botData.president + ' has been randomly assigned by the bot!\n\n**The first ' + this.botData.president + ' nominee is: ' + presNomineeName + '!**\n\nThis ' + this.botData.president + ' nominee should now nominate the first ' + this.botData.chancellor + ' by typing:\n\n**' + this.botData.prefix + ' nominate @username**\n\n(make sure the username has been mentioned/tagged in your message)');

      this.channel.send(thisEmbed);

    });

  }

  // Outputs the visual game board
  generateGameBoard(){

    const canvas = Canvas.createCanvas(CNV_WIDTH, CNV_HEIGHT);
  	const ctx = canvas.getContext('2d');

  	ctx.strokeStyle = CTX_COL_TEXT;
    ctx.fillStyle = CTX_COL_BG;

    ctx.fillRect(0, 0, CNV_WIDTH, CNV_HEIGHT);
    ctx.beginPath();

    // Draw the borders
    // LIBERAL SLOT BORDER
    ctx.rect(0, HEADER_HEIGHT, CNV_WIDTH, (SLOT_HEIGHT + HEADER_HEIGHT) );
    // FAILURE TRACK BORDER
    ctx.rect(0, (SLOT_HEIGHT + HEADER_HEIGHT), CNV_WIDTH, (SLOT_HEIGHT + HEADER_HEIGHT + HEADER_HEIGHT) );
    // FASCIST SLOT BORDER
    ctx.rect(0, TEAM_HEIGHT + HEADER_HEIGHT, CNV_WIDTH, (TEAM_HEIGHT + SLOT_HEIGHT + HEADER_HEIGHT) );
    // HITLER INFO BORDER
    ctx.rect(0, (TEAM_HEIGHT + SLOT_HEIGHT + HEADER_HEIGHT), CNV_WIDTH, (TEAM_HEIGHT + SLOT_HEIGHT + HEADER_HEIGHT + HEADER_HEIGHT) );
    ctx.stroke();
    ctx.closePath();

    // Output Team Headings
    ctx.font = '40px serif';
    ctx.textAlign = "center";
    ctx.fillStyle = CTX_COL_TEXT;
    ctx.fillText(this.botData.liberal, CNV_WIDTH / 2, HEADER_HEIGHT - 10);
    ctx.fillText(this.botData.fascist, CNV_WIDTH / 2, TEAM_HEIGHT + HEADER_HEIGHT - 10);

    let boardActions = GAME_BOARD[0];
    // Output liberal slots
    let xStart = LIB_BORDER_WIDTH;
    // Heights always the same
    let y1 = HEADER_HEIGHT;
    ctx.font = '16px sans-serif';
    for (let i = 0; i < BOARD_LIBERAL_COUNT; i++){
      let x1 = xStart + (SLOT_WIDTH * i);
      ctx.beginPath();
      ctx.rect(x1, y1, SLOT_WIDTH, SLOT_HEIGHT);
      ctx.stroke();
      ctx.closePath();
      wrapText(ctx, boardActions[i], x1 + Math.floor(SLOT_WIDTH / 2), y1 + 50, SLOT_WIDTH - 10, 20);
    }

    // Output cards over the filled slots
    let libSlots = this.boardProgress.liberal;
    ctx.fillStyle = CTX_COL_LIBS;
    // Nowt to do if no slots filled
    if (libSlots !== 0){
      for (let i = 0; i < libSlots; i++){
        let x1 = xStart + (SLOT_WIDTH * i) + 1;
        ctx.fillRect(x1, y1 + 1, SLOT_WIDTH - 2, SLOT_HEIGHT - 2);
      }
    }

    // Output the failure track
    xStart = FAIL_BORDER_WIDTH;
    // Heights always the same
    y1 = SLOT_HEIGHT + HEADER_HEIGHT;
    ctx.font = '30px sans-serif';
    ctx.fillStyle = CTX_COL_TEXT;
    for (let i = 0; i < BOARD_FAIL_COUNT; i++){
      let x1 = xStart + (SLOT_WIDTH * i);
      ctx.beginPath();
      ctx.rect(x1, y1, SLOT_WIDTH, HEADER_HEIGHT);
      ctx.stroke();
      ctx.closePath();
      // Put the slot number in the box
      if (i === 0){
        ctx.fillText('Fails->', x1 + Math.floor(SLOT_WIDTH / 2), y1 + 35 );
      }else{
        ctx.fillText( String('Fail ' + i), x1 + Math.floor(SLOT_WIDTH / 2), y1 + 35 );
      }

    }

    // Output cards over failure track slots
    let failSlots = this.boardProgress.failure;
    ctx.fillStyle = CTX_COL_FASC;
    if (failSlots !== 0){
      for (let i = 0; i < failSlots; i++){
        let x1 = xStart + (SLOT_WIDTH * (i + 1) ) + 1;
        ctx.fillRect(x1, y1 + 1, SLOT_WIDTH - 2, HEADER_HEIGHT - 2);
      }
    }

    let fascistText = '';
    boardActions = '';
    switch (this.players.count){
      case 5:
      case 6:
        fascistText = TEXT_FIVESIX;
        boardActions = GAME_BOARD[1];
        break;
      case 7:
      case 8:
        fascistText = TEXT_SEVENEIGHT;
        boardActions = GAME_BOARD[2];
        break;
      case 9:
      case 10:
        fascistText = TEXT_NINETEN;
        boardActions = GAME_BOARD[3];
        break;
    }

    // Output fascist slots
    xStart = FAS_BORDER_WIDTH;
    // Heights always the same
    y1 = TEAM_HEIGHT + HEADER_HEIGHT;
    ctx.font = '16px sans-serif';
    ctx.fillStyle = CTX_COL_TEXT;
    for (let i = 0; i < BOARD_FASCIST_COUNT; i++){
      let x1 = xStart + (SLOT_WIDTH * i);
      ctx.beginPath();
      ctx.rect(x1, y1, SLOT_WIDTH, SLOT_HEIGHT);
      ctx.stroke();
      ctx.closePath();
      wrapText(ctx, boardActions[i], x1 + Math.floor(SLOT_WIDTH / 2), y1 + 50, SLOT_WIDTH - 10, 20);
    }

    // Output cards over the filled slots
    let fascSlots = this.boardProgress.fascist;
    ctx.fillStyle = CTX_COL_FASC;
    // Nowt to do if no slots filled
    if (fascSlots !== 0){
      for (let i = 0; i < fascSlots; i++){
        let x1 = xStart + (SLOT_WIDTH * i) + 1;
        ctx.fillRect(x1, y1 + 1, SLOT_WIDTH - 2, SLOT_HEIGHT - 2);
      }
    }

    ctx.font = 'italic 16px serif';
    ctx.fillStyle = CTX_COL_TEXT;
    ctx.fillText(fascistText, Math.floor(CNV_WIDTH / 2), TEAM_HEIGHT + HEADER_HEIGHT + SLOT_HEIGHT + 30);

  	let attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'game-board.png');

    this.gameBoardCnv = attachment;
    // Not outputting yet, do this in round end so messages stay together
    //this.channel.send(this.gameBoardCnv);

  }

  /*
    The President examines the top 3 cards of the policy deck
  */
  powerPresidentExamine(){
    console.log('Power - President Examine');
    if (this.policyDeck.length < 3){
      this.shuffleDeck();
    }
    let presID = this.getUserIDfromUsername(this.government.currPres);
    let presUser = client.users.cache.get(presID);
    let topPolicies = 'Policy 1: ' + this.policyDeck[0] + '\n\nPolicy 2: ' + this.policyDeck[1] + '\n\nPolicy 3: ' + this.policyDeck[2] + '\n\n';
    let presEmbed = new MessageEmbed()
      .setTitle('Examine Power')
      .setColor(0x00ff00)
      .setDescription('The top 3 policy cards from the deck are as follows:\n\n**' + topPolicies + '**');
    presUser.send(presEmbed);
    this.roundEnd();
  }

  /*
    The President investigates a players' secret identity card
  */
  // Ask the president which player to investigate
  powerInvestigateStart(){
    console.log('Power - President investigate start');
    this.status.investigating = true;
    // Ask the president which player to investigate
    // List the players by index for them to pick
    // Pick from players.nameArr
    // Match that up to players.secretRoles in result function
    let investigateEmbed = new MessageEmbed()
      .setTitle('Investigation Power')
      .setColor(0x00ff00)
      .setDescription('You must now choose a player to investigate.\n\nYou will be shown their party membership card - i.e. not "' + this.botData.hitler + '" but instead just "' + this.botData.fascist + '" or "' + this.botData.liberal + '".\n\nIt is easier to copy and paste your preferred response below to send it. If you are using the Discord app on mobile, just hold down on the message you want to send and then paste it into the "message" box below:');
    let presID = this.getUserIDfromUsername(this.government.currPres);
    let presUser = client.users.cache.get(presID);
    presUser.send(investigateEmbed);
    let names = this.players.nameArr;
    for (let i = 0; i < names.length; i++){
      presUser.send('investigate player ' + (i + 1) + ' - "' + names[i] + '" (' + this.channel.id + ')');
    }

  }

  // Get the playerIndex to be investigate and send the identity to the President
  powerInvestigateResult(playerName){
    console.log('Power - President investigate result');
    this.status.investigating = false;
    // Translate the player name into an index in the player array
    let thisID = this.getUserIDfromUsername(playerName);
    console.log('Investigating ', playerName,' which is index ',thisID);
    let roleIndex = this.players.secretRoles.indexOf(thisID);
    let thisRole = PLAYER_ROLES[roleIndex];
    if ( (thisRole === 'Hitler') || (thisRole === 'Fascist') ){
      thisRole = this.botData.fascist;
    }else{
      thisRole = this.botData.liberal;
    }
    let investigateEmbed = new MessageEmbed()
      .setTitle('Investigation Result')
      .setColor(0x00ff00)
      .setDescription('The results of your investigation are here!\n\n**The Party Membership card for ' + playerName + ' shows they are a ' + thisRole + '**');
    let presID = this.getUserIDfromUsername(this.government.currPres);
    let presUser = client.users.cache.get(presID);
    presUser.send(investigateEmbed);
    this.roundEnd();
  }

  /*
    The President picks the next Presidential Candidate
  */
  // Ask the President which player should be the next President nominee
  powerPickCandidateStart(){
    console.log('Power - President pick candidate start');
    this.status.pickCandidate = true;
    let pickEmbed = new MessageEmbed()
      .setTitle('Pick Presidential Candidate Power')
      .setColor(0x00ff00)
      .setDescription('You must now pick the next Presidential candidate. There are no limits to who you choose to nominate for the Presidency. Choose a player from the list below.\n\nIt is easier to copy and paste your preferred response below to send it. If you are using the Discord app on mobile, just hold down on the message you want to send and then paste it into the "message" box below:');
    let presID = this.getUserIDfromUsername(this.government.currPres);
    let presUser = client.users.cache.get(presID);
    presUser.send(pickEmbed);
    let names = this.players.nameArr;
    for (let i = 0; i < names.length; i++){
      presUser.send('pick candidate ' + (i + 1) + ' - "' + names[i] + '" (' + this.channel.id + ')');
    }
  }

  // Get the selected player and process that result
  powerPickCandidateResult(playerName){
    console.log('Power - President pick candidate result');
    this.status.pickCandidate = false;
    // Translate the player name into an index in the player array
    let thisID = this.getUserIDfromUsername(playerName);
    console.log('Candidate selected ', playerName,' which is index ',thisID);
    this.government.nomPres = playerName;
    /*
    This can just be output to the main channel announcing the new president

    let pickEmbed = new MessageEmbed()
      .setTitle('')
      .setColor(0x00ff00)
      .setDescription('The results of your investigation are here!\n\n**The Party Membership card for ' + playerName + ' shows they are a ' + thisRole + '**');

    this.channel.send(pickEmbed);*/
    this.roundEnd();
  }

  /*
    The President must kill a player
  */
  // Ask the President which player to kill
  powerPresidentKillStart(){
    console.log('Power - President kill start');
  }

  // Get the selected player and kill them!
  powerPresidentKillResult(playerIndex){
    console.log('Power - President kill result');
    this.roundEnd();
  }

  /*
    Veto power is unlocked
  */
  powerVetoUnlocked(){
    this.government.vetoUnlocked = true;
    let thisEmbed = new MessageEmbed()
      .setTitle('Veto Power Unlocked')
      .setColor(0x00ff00)
      .setDescription('The Veto Power has been unlocked for future legislative sessions.\n\nThe ' + this.botData.president + ' and ' + this.botData.chancellor + ' can jointly agree to veto the policy choices, which will then result in a failed session (increasing the failure track).\n\n**How the Veto works**\nOnce the ' + this.botData.president + ' has discarded one of the policies and passed them to the ' + this.botData.chancellor + ', the ' + this.botData.chancellor + ' may then ask to veto those two options. If the ' + this.botData.president + ' agrees to the veto, the policies are discarded and the election tracker is advanced one step. If the ' + this.botData.president + ' does not agree, then the ' + this.botData.chancellor + ' must enact one of the two policy options as usual.');
    this.channel.send(thisEmbed);
    //NOT NEEDED - as veto will trigger with presKill
    //this.roundEnd();
  }

  /*
    GAME OVER!
  */
  gameOver(winTeam){

    botStats.activeGames--;
    let embedCol = 0x0000ff;
    if (winTeam === this.botData.fascist){
      embedCol = 0xff0000;
    }
    let thisEmbed = new MessageEmbed()
      .setTitle('Game Over - ' + winTeam + ' Win!')
      .setColor(embedCol)
      .setDescription('The ' + winTeam + ' were the winners!');
    this.channel.send(thisEmbed);
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

// Gets a timestamp (used for logging only)
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

// https://www.html5canvastutorials.com/tutorials/html5-canvas-wrap-text-tutorial/
function wrapText(context, text, x, y, maxWidth, lineHeight) {
  var words = text.split(' ');
  var line = '';

  for(var n = 0; n < words.length; n++) {
    var testLine = line + words[n] + ' ';
    var metrics = context.measureText(testLine);
    var testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    }
    else {
      line = testLine;
    }
  }
  context.fillText(line, x, y);
}

/*
 The ready event is vital, it means that only _after_ this will your bot start reacting to information received from Discord
*/
client.on('ready', () => {
  console.log(getDateStamp(),'Secret Hitler Bot - ready for action!');
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

    }else if (message.startsWith('investigate')){

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

    } // END IF startsWith()

  } // END IF message.guild === null

  // If the game has not been set up yet, and it is not from a DM
  if (message.channel.game === undefined && message.guild !== null){
    // Set up the game object in this channel
    console.log(getDateStamp(),'New game setup');
    message.channel.game = new SecretHitlerGame(message.channel);
    botStats.channels.push(message.channel.id);
  }else if (message.channel.game === undefined){
    // Return false to prevent errors
    return false;
  }

  // Make a shallow copy of the game for easy referencing
  let theGame = message.channel.game;

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

      console.log(getDateStamp(),' Adding user ' + thisUser);

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

      let thisNomination = getUserFromMention(args[0]);
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


}); // End channel.message function

// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login(token);    // Update in config.json
