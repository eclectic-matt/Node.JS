const c_colours = require('../constants/colours.js');
const c_canvas = require('../constants/canvas.js');
const c_names = require('../constants/names.js');
const c_board = require('../constants/boardCards.js');
const c_game = require('../constants/game.js');
const c_text = require('../constants/text.js');

const Discord = require('discord.js');
const { client, MessageEmbed } = require('discord.js');

const { registerFont, createCanvas } = require('canvas');
registerFont('./fonts/Eskapade.ttf', { family: 'Eskapade'});
//registerFont('./fonts/ElectionTime.ttf', { family: 'ElectionTime'});
registerFont('./fonts/BenjaminFranklin.ttf', { family: 'BenjaminFranklin'});
registerFont('./fonts/anirm___.ttf', { family: 'anirm___'});
registerFont('./fonts/SFDistantGalaxy.ttf', { family: 'SFDistantGalaxy'});
registerFont('./fonts/RINGBEARER.ttf', { family: 'RINGBEARER'});

const t_std = require('../../core-tools/coreStandardTools.js');
const t_logs = require('../../core-tools/coreLogTools.js');

const gamesLogFN = '../secret-hitler-bot/logs/gamesLog.json';

module.exports = class SecretHitlerGame {

  /*
    Initialise the game - sets up variables
    unique to the channel where it has been added
  */
  constructor (channel, client){

    // Added the channel data for reference (not used)
    this.channel = channel;
    this.client = client;

    // A flag to show if operating in debug mode
    this.debugFlag = true;

    // A status flag for game overs & running
    this.status = {};
    this.status.gameOver = false;
    this.status.gameRunning = false;
    this.status.investigating = false;
    this.status.pickCandidate = false;

    // NOTE - these are not reset between games
    this.botData = {};
    // Setting bot values as variables so you can change the "theme"
    this.botData.prefix = c_names.PREFIX;
    this.botData.name = c_names.NAME;
    // The "title" of the chancellor and president
    this.botData.chancellor = c_names.CHANCELLOR;
    this.botData.president = c_names.PRESIDENT;
    // The "title" of Hitler
    this.botData.hitler = c_names.HITLER;
    // The "title" of the fascists and liberals
    this.botData.fascist = c_names.FASCIST;
    this.botData.liberal = c_names.LIBERAL;
    this.botData.yes = c_names.JA;
    this.botData.no = c_names.NEIN;
    this.botData.legislative = c_names.LEGISLATIVE;
    this.botData.government = c_names.GOVERNMENT;
    this.botData.player = c_names.PLAYER;

    // Theme based font sizes
    this.botData.fontName = c_names.FONT_NAME;
    this.botData.fontTeamHeader = c_names.FONT_TEAM_HEADER;
    this.botData.fontBoardActions = c_names.FONT_BOARD_ACTIONS;
    this.botData.fontCardHeader = c_names.FONT_CARD_HEADER;
    this.botData.fontHitlerInfo = c_names.FONT_HITLER_INFO;

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
    this.players.killedPlayers = [];

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
    this.policyDeck = t_std.shuffle(c_board.POLICY_CARDS);
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
    this.government.vetoRequested = false;

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
    this.status.investigating = false;
    this.status.pickCandidate = false;

    this.players.idArr = [];
    this.players.nameArr = [];
    this.players.secretRoles = [];
    this.players.votesArr = [];
    this.players.votesCount = 0;
    this.players.count = 0;
    this.players.hitler = '';
    this.players.fascists = [];
    this.players.killedPlayers = [];

    this.boardProgress.liberal = 0;
    this.boardProgress.fascist = 0;
    this.boardProgress.failure = 0;
    this.boardProgress.arr = [];

    this.gameBoardCnv = null;

    this.policyDeck = t_std.shuffle(c_board.POLICY_CARDS);
    this.policyOptions = [];

    this.government.currPres = '';
    this.government.currChan = '';
    this.government.presIndex = 0;
    this.government.prevPres = '';
    this.government.prevChan = '';
    this.government.nomPres = '';
    this.government.nomChan = '';
    this.government.vetoUnlocked = false;
    this.government.vetoRequested = false;

  }

  // Update the game theme with the values in this array
  changeTheme(arrTheme){
    this.botData.prefix = arrTheme.prefix;
    this.botData.name = arrTheme.name;
    // The "title" of the chancellor and president
    this.botData.chancellor = arrTheme.CHANCELLOR;
    this.botData.president = arrTheme.PRESIDENT;
    // The "title" of Hitler
    this.botData.hitler = arrTheme.HITLER;
    // The "title" of the fascists and liberals
    this.botData.fascist = arrTheme.FASCIST;
    this.botData.liberal = arrTheme.LIBERAL;
    this.botData.yes = arrTheme.JA;
    this.botData.no = arrTheme.NEIN;
    this.botData.legislative = arrTheme.LEGISLATIVE;
    this.botData.government = arrTheme.GOVERNMENT;
    this.botData.player = arrTheme.PLAYER;
    this.botData.fontName = arrTheme.FONT_NAME;
    this.botData.fontTeamHeader = arrTheme.FONT_TEAM_HEADER;
    this.botData.fontBoardActions = arrTheme.FONT_BOARD_ACTIONS;
    this.botData.fontCardHeader = arrTheme.FONT_CARD_HEADER;
    this.botData.fontHitlerInfo = arrTheme.FONT_HITLER_INFO;

    // TESTING ONLY - GENERATE A BOARD!
    this.boardProgress.liberal = 1;
    this.boardProgress.fascist = 1;
    this.players.count = 9;
    this.generateGameBoard();
    this.channel.send(this.gameBoardCnv);

  }

  // Add user to the next game 'bot join'
  addUser(id, name){
    // Use ids to ensure no duplicates
    this.players.idArr.push(id);
    // Add names for quick reference
    this.players.nameArr.push(name);
    this.players.count++;
    // Make empty space in the array (no vote received)
    if (!this.debugFlag){
      this.players.votesArr.push('');
    }

  }

  // Triggered when a user sends 'bot start'
  gameStart(client){

    // Check the player count is valid
    if (this.players.count < c_game.PLAYERS_MIN || this.players.count > c_game.PLAYERS_MAX){
      // Error! You must have between 5 and 11 players
      let thisEmbed = new MessageEmbed()
        .setTitle('Player Count Error!')
        .setColor(c_colours.COLOUR_HELP)
        .setDescription('Sorry, but this game requires between ' + c_game.PLAYERS_MIN + ' and ' + c_game.PLAYERS_MAX + ' players to work.\n\nTry again once enough players have joined the game!');
        this.channel.send(thisEmbed);

    }else{

      t_logs.addGameToLog(gamesLogFN, this.channel);
      let gamesStats = t_logs.getGameLogStats(gamesLogFN);

      console.log('New game being logged in channel "' + this.channel.name + '"');
      console.log('Active Games = ' + gamesStats.active);
      console.log('Total Games logged so far = ' + gamesStats.logged);

      this.status.gameRunning = true;
      // Assign secret identity and membership cards
      // Shuffle the ID array (this will match up to roles)
      let thePlayers = t_std.shuffle(this.players.idArr);
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
        let thisRole = c_board.PLAYER_ROLES[i];
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
        let thisRole = c_board.PLAYER_ROLES[i];

        let embedTitle = '';
        let embedDesc = '';
        let embedCol = c_colours.COLOUR_FASCIST;
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
            embedDesc = 'You are ' + this.botData.fascist + ' and so you know that:\n\n**' + this.botData.hitler + ' is: ' + this.players.hitler + '**\n\nYou are the only ' + this.botData.fascist + ' at this player count (5-6 players)';

          }else{
            // Fascists know who the fascists are, and hitler
            embedDesc = 'You are ' + this.botData.fascist + ' and so you know that:\n\n**' + this.botData.hitler + ' is: ' + this.players.hitler + '**\n\nYou also know that the only players on the ' + this.botData.fascist + ' team are:\n\n';
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
          embedCol = c_colours.COLOUR_LIBERAL;
          embedDesc = 'You are ' + this.botData.liberal + '\n\nYou do not know anyone else\'s secret role!';

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
        .setColor(c_colours.COLOUR_HELP)
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
        .setColor(c_colours.COLOUR_HELP)
        .setDescription('The first ' + this.botData.president + ' has been randomly assigned by the bot!\n\n**The first ' + this.botData.president + ' nominee is: ' + presNomineeName + '!**\n\nThis ' + this.botData.president + ' nominee should now nominate the first ' + this.botData.chancellor + ' by sending a message in THIS CHANNEL:\n\n**' + this.botData.prefix + ' nominate @username**\n\n(make sure the username has been mentioned/tagged in your message)');

      this.channel.send(thisEmbed);

    }
  }

  // Rest of Chancellor nomination handled in the "nominate" message received
  chancellorNominated(userId, userName){
    console.log('Nomination for Chancellor received as: ' + userName);
    this.government.nomChan = userName;
  }

  // TESTING FUNCTION FOR NOW
  processVote(playerID, vote, client){
    //console.log('Vote received for game in channel - ', this.channel.name);
    console.log('Vote received from ',playerID,' who voted: "' + vote + '"');
    let thisPlayerIndex = this.players.idArr.indexOf(playerID);
    if (thisPlayerIndex >= 0){
      // YES! This player should be voting!
      // Changed this for testing
      if ( !this.debugFlag ){
      //if ( (this.players.votesArr[thisPlayerIndex] !== '') && (!debugFlag) ){
        // Vote already logged - cheeky!
        let thisDiscordUser = client.users.cache.get(playerID);
        thisDiscordUser.send('You have already voted, you cheeky monkey!');
      }else{
        let thisDiscordUser = client.users.cache.get(playerID);
        thisDiscordUser.send('Thank you for your vote, now return to the main channel to see the results!');
        // Log this player's vote
        // Using this for testing (where I submit all the votes)
        if (!this.debugFlag){
          this.players.votesArr[thisPlayerIndex] = vote;
        }else{
          this.players.votesArr.push(vote);
        }

        this.players.votesCount++;
        //console.log(this.players.votesCount + ' votes received out of ' + this.players.count + ' players');
        if (this.players.votesCount === this.players.count){
          // ALL VOTES RECEIVED!
          this.processGovernmentVotes(this.players.votesArr, client);
        }
      }
    }else{
      // Player not recognised!
      let thisDiscordUser = client.users.cache.get(playerID);
      thisDiscordUser.send('Sorry, you are not recognised as a player :-(');
    }
  }

  // Update based on government votes
  processGovernmentVotes(votes, client){

    console.log('All votes received - processing results now!');
    let jaVotes = 0;
    let neinVotes = 0;
    for (let i = 0; i < votes.length; i++){
      //console.log('Processing vote (' + i + ') - ' + votes[i]);
      if (votes[i] === this.botData.yes){
        jaVotes++;
      }else{
        neinVotes++;
      }
    }

    // Let the channel know
    let thisEmbed = new MessageEmbed()
      .setTitle('The Voting Results are in...')
      .setColor(c_colours.COLOUR_HELP)
      .setDescription('All the votes have now been cast.\n\nThis ' + this.botData.government + ' received:\n\n' + jaVotes + ' votes for ' + this.botData.yes + '\n\n' + neinVotes + ' votes for ' + this.botData.no);
    this.channel.send(thisEmbed);

    // MAJORITY YES needed
    if (jaVotes > neinVotes){

      // Government elected!
      this.government.currChan = this.government.nomChan;
      this.government.currPres = this.government.nomPres;
      // Reset the failure tracker
      this.boardProgress.failure = 0;

      // Let the channel know
      thisEmbed = new MessageEmbed()
        .setTitle('Government Elected!')
        .setColor(c_colours.COLOUR_HELP)
        .setDescription('Please stand in salute at your newly-elected ' + this.botData.government + '!\n\n**' + this.botData.president + ': ' + this.government.currPres + '**\n\n**' + this.botData.chancellor + ': ' + this.government.currChan + '**\n\nThey are now entering the ' + this.botData.legislative + ' and will decide on a policy to enact (' + this.botData.government + ' - check your private message from the Bot)');
      this.channel.send(thisEmbed);

      // Check if the Chancellor is Hitler and 3 fascist policies enacted
      if (
        (this.government.currChan === this.players.hitler) &&
        (this.boardProgress.fascist >= 3)
      ){
        let thisEmbed = new MessageEmbed()
          .setTitle('Bad News Everyone...')
          .setColor(c_colours.COLOUR_FASCIST)
          .setDescription('Introducing your new ' + this.botData.chancellor + '...\n\n**It\'s ' + this.botData.hitler + '!**\n\nAs ' + this.botData.hitler + ' was elected when 3 ' + this.botData.fascist + ' policies had been enacted, that means game over!');
        this.channel.send(thisEmbed);
        this.gameOver(this.botData.fascist);
        return false;
      }

      // Now allocate policy cards to the President
      this.policyPhaseOne(client);

    }else{
      // Government rejected!
      this.boardProgress.failure++;
      if (this.boardProgress.failure === c_game.FAILURES_MAX){
        // Government in chaos! Top policy automatically enacted!
        this.chaosPolicy();
      }
      // Move the nominated president round to the next player

    }

  }

  // Used if the government fails 3 times in a row
  chaosPolicy(){
    // Remove the top policy off the deck
    let thePolicy = this.policyDeck.splice(0,1);
    let chaosEmbed = new MessageEmbed()
      .setTitle('3 Elections Failures - ' + thePolicy + ' policy enacted!')
      .setColor(c_colours.COLOUR_HELP)
      .setDescription('There have now been 3 failed elections in a row!\n\nAs a result, the populace have decided to force a ' + thePolicy + ' policy to be enacted! The following special rules also apply:\n\n* Any board actions which would have been triggered are ignored for this policy.\n* All players are now eligible to be ' + this.botData.chancellor + '.\n* The election failure tracker resets back to 0.');
    this.channel.send(chaosEmbed);

    // Push this on to the board & update
    this.boardProgress.arr.push(thePolicy);
    // Reset election tracker
    this.boardProgress.failure = 0;

    switch (thePolicy){

      case this.botData.fascist:
        this.boardProgress.fascist++;
        break;

      case this.botData.liberal:
        this.boardProgress.liberal++;
        break;
    }

    // Check if game over
    if (this.boardProgress.liberal === c_game.BOARD_LIBERAL_COUNT){
      this.gameOver(this.botData.liberal);
      // Send the final game board if game over
      this.channel.send(this.gameBoardCnv);
    }else if (this.boardProgress.fascist === c_game.BOARD_FASCIST_COUNT){
      this.gameOver(this.botData.fascist);
      // Send the final game board if game over
      this.channel.send(this.gameBoardCnv);
    }else{
      // Remove prevPres, prevChan
      this.government.prevPres = '';
      this.government.prevChan = '';
      //this.generateGameBoard();
      this.roundEnd();
    }


  }

  /*
    Draw pile < 3 so shuffle together
  */
  shuffleDeck(){

    this.policyDeck = t_std.shuffle(c_board.POLICY_CARDS);
    let deckEmbed = new MessageEmbed()
      .setTitle('Card deck has fewer than 3 cards - shuffling')
      .setColor(c_colours.COLOUR_HELP)
      .setDescription('The deck of policy cards has run out - now shuffling the entire deck together ready to form the new draw deck.');
    this.channel.send(deckEmbed);
  }

  // Send the President the top 3 policies from the deck
  policyPhaseOne(){

    // Get the President ID
    let presID = this.getUserIDfromUsername(this.government.currPres);
    let presUser = this.client.users.cache.get(presID);
    // Shuffle the policy deck if fewer than 3 cards
    if (this.policyDeck.length < 3){
      this.shuffleDeck();
    }
    // Policy options will remain Fascist/Liberal
    this.policyOptions = this.policyDeck.splice(0,3);
    let policyNames = [];
    for (let i = 0; i < this.policyOptions.length; i++){
      if (this.policyOptions[i] === 'Fascist'){
        policyNames[i] = this.botData.fascist;
      }else{
        policyNames[i] = this.botData.liberal;
      }
    }
    //console.log('Phase One Policies ',this.policyOptions);
    let thisEmbed = new MessageEmbed()
      .setTitle(this.botData.president + ' - ' + this.botData.legislative)
      .setColor(c_colours.COLOUR_HELP)
      .setDescription('You must now DISCARD one of the following policies from the list below.\n\n**You should not say anything or give any indication of what the policies below are!**\n\nThe remaining two policies will be sent to the ' + this.botData.chancellor + ' who will select which of those two policies to enact.\n\nThe three policies available are as follows:\n\nPOLICY 1 - ' + policyNames[0] + '\nPOLICY 2 - ' + policyNames[1] + '\nPOLICY 3 - ' + policyNames[2] + '\n\nIt is easier to copy and paste your preferred response below to send it. If you are using the Discord app on mobile, just hold down on the message you want to send and then paste it into the "message" box below:');
    presUser.send(thisEmbed);

    thisEmbed = new MessageEmbed()
      .setTitle('DISCARD policy 1')
      .setColor(c_colours.COLOUR_HELP)
      .setDescription('discard policy 1 (' + this.channel.id + ')');
    presUser.send(thisEmbed);
    thisEmbed = new MessageEmbed()
      .setTitle('DISCARD policy 2')
      .setColor(c_colours.COLOUR_HELP)
      .setDescription('discard policy 2 (' + this.channel.id + ')');
    presUser.send(thisEmbed);
    thisEmbed = new MessageEmbed()
      .setTitle('DISCARD policy 3')
      .setColor(c_colours.COLOUR_HELP)
      .setDescription('discard policy 3 (' + this.channel.id + ')');
    presUser.send(thisEmbed);

  }

  // Send the remaining 2 policies to the Chancellor
  policyPhaseTwo(discardID, client){

    // Quick IF in case returning to this function from a DECLINED veto
    if (discardID !== ''){
      // Note discardID is 1/2/3 but relates to policyOptions[id - 1];
      console.log('Policy Phase 2 started',discardID);
      // Now splice that index from the policyOptions
      this.policyOptions.splice(discardID - 1, 1);
    }

    let policyNames = [];
    for (let i = 0; i < this.policyOptions.length; i++){
      if (this.policyOptions[i] === 'Fascist'){
        policyNames[i] = this.botData.fascist;
      }else{
        policyNames[i] = this.botData.liberal;
      }
    }

    let presID = this.getUserIDfromUsername(this.government.currPres);
    let presUser = this.client.users.cache.get(presID);
    presUser.send('Thank you for selecting which policy to discard, now return to the main channel to see the results!');

    // Now send the remaining policies to the Chancellor
    console.log('Phase Two Policies ',this.policyOptions);
    let chanID = this.getUserIDfromUsername(this.government.currChan);
    let chanUser = client.users.cache.get(chanID);
    let thisEmbed = new MessageEmbed()
      .setTitle(this.botData.chancellor + ' - ' + this.botData.legislative)
      .setColor(c_colours.COLOUR_HELP)
      .setDescription('You must now DISCARD one of the following policies from the list below.\n\n**You should not say anything or give any indication of what the policies below are!**\n\n**The remaining policy will be enacted and shown to the other players.**\n\nThe two policies available are as follows:\n\nPOLICY 1 - ' + policyNames[0] + '\nPOLICY 2 - ' + policyNames[1] + '\n\nIt is easier to copy and paste your preferred response below to send it. If you are using the Discord app on mobile, just hold down on the message you want to send and then paste it into the "message" box below:');
    chanUser.send(thisEmbed);

    thisEmbed = new MessageEmbed()
      .setTitle('DISCARD policy 1')
      .setColor(c_colours.COLOUR_HELP)
      .setDescription('discard policy 1 (' + this.channel.id + ')');
    chanUser.send(thisEmbed);

    thisEmbed = new MessageEmbed()
      .setTitle('DISCARD policy 2')
      .setColor(c_colours.COLOUR_HELP)
      .setDescription('discard policy 2 (' + this.channel.id + ')');
    chanUser.send(thisEmbed);

    if (this.government.vetoUnlocked){
      thisEmbed = new MessageEmbed()
        .setTitle('Veto Available')
        .setColor(c_colours.COLOUR_HELP)
        .setDescription('Note: the veto power is available and if you do not like either of the policy options above, you can request a veto with the ' + this.botData.president + ' by sending the following message:');
        chanUser.send(thisEmbed);
        chanUser.send('veto ' + this.channel.id);
    }
  }

  // Discard that policy and enact the remaining policy
  policyEnact(discardID){

    let chanID = this.getUserIDfromUsername(this.government.currChan);
    let chanUser = this.client.users.cache.get(chanID);
    chanUser.send('Thank you for selecting which policy to discard, now return to the main channel to see the results!');

    console.log('Policy Enact discard',discardID);
    // Note discardID is 1/2 but relates to policyOptions[id - 1];
    this.policyOptions.splice(discardID - 1, 1);
    let enactedPolicy = this.policyOptions[0];
    console.log('The enacted policy will be:', enactedPolicy);
    this.boardProgress.arr.push(enactedPolicy);
    this.boardProgress.failure = 0;

    // Get the board actions for this player count
    // Not needed for liberals but didn't want 3 nested switches
    let boardActions = [];
    let boardDesc = [];
    switch (this.players.count){
      case 5:
      case 6:
        boardActions = c_board.BOARD_ACTIONS[0];
        boardDesc = c_board.GAME_BOARD[1];
        break;
      case 7:
      case 8:
        boardActions = c_board.BOARD_ACTIONS[1];
        boardDesc = c_board.GAME_BOARD[2];
        break;
      case 9:
      case 10:
        boardActions = c_board.BOARD_ACTIONS[2];
        boardDesc = c_board.GAME_BOARD[3];
        break;
    }

    // Now process the enacted policy
    let embedCol = c_colours.COLOUR_FASCIST;
    switch (enactedPolicy){

      case 'Fascist':

        this.boardProgress.fascist++;
        this.generateGameBoard();

        // Let the channel know which policy was enacted - the updated board will follow
        let fascistEmbed = new MessageEmbed()
          .setTitle(this.botData.fascist + ' policy enacted!')
          .setColor(embedCol)
          .setDescription('**The elected ' + this.botData.government + ' have enacted a ' + this.botData.fascist + ' policy.**\n\nThe updated game board is shown below and any actions on this game board space will now be carried out.');
        this.channel.send(fascistEmbed);

        let thisAction = boardActions[this.boardProgress.fascist - 1];
        if (thisAction !== ''){

          console.log('Evaluating board action');
          // I know this is risky, but will get board actions applied effectively
          eval(thisAction);

          // Change the wording for boardDesc so that botData used
          let thisBoardDesc = boardDesc[this.boardProgress.fascist - 1].replace(/President/g, this.botData.president).replace(/Fascist/g, this.botData.fascist);

          let actionEmbed = new MessageEmbed()
            .setTitle('Board Action Takes Place')
            .setColor(c_colours.COLOUR_FASCIST)
            .setDescription('Enacting this policy resulted in the following action being taken:\n\n**' + thisBoardDesc + '**');

          this.channel.send(actionEmbed);

        }else{
          console.log('No board action - straight to round end');
          /*
          if (this.boardProgress.fascist === BOARD_FASCIST_COUNT){
            this.gameOver(this.botData.fascist);
          }else{
            this.roundEnd();
          }
          */
          // In theory, the action on the board will be evalated if game over
          this.roundEnd();
        }
        break;

      case 'Liberal':

        embedCol = c_colours.COLOUR_LIBERAL;
        this.boardProgress.liberal++;
        this.generateGameBoard();
        // Let the channel know which policy was enacted - the updated board will follow
        let liberalEmbed = new MessageEmbed()
          .setTitle(this.botData.liberal + ' policy enacted!')
          .setColor(embedCol)
          .setDescription('**The elected ' + this.botData.government + ' have enacted a ' + this.botData.liberal + ' policy.**\n\nThe updated game board is shown below and any actions on this game board space will now be carried out.');
        this.channel.send(liberalEmbed);
        // Check if game over
        if (this.boardProgress.liberal === c_game.BOARD_LIBERAL_COUNT){
          this.gameOver(this.botData.liberal);
        }else{
          this.roundEnd();
        }
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
      console.log('Inside round end callback');

      // Don't increment when pick candidate is active
      if (!this.status.pickCandidate){
        // Increment the President index
        this.government.presIndex++;
        if (this.government.presIndex >= this.players.idArr.length){
          this.government.presIndex = 0;
        }
        let presNomineeID = this.players.idArr[this.government.presIndex];
        let presNomineeName = this.players.nameArr[this.government.presIndex];
        this.government.nomPres = presNomineeName;
      }else{
        // Don't increment, as the presIndex will be incremented next round
        this.status.pickCandidate = false;
      }

      // Assign the previous president and chancellor (to prevent voting)
      this.government.prevPres = this.government.currPres;
      this.government.prevChan = this.government.currChan;
      // Clear the nominated Chancellor to allow nominations again
      this.government.nomChan = '';
      //  Reset voting variables ready for next round
      this.players.votesCount = 0;
      this.players.votesArr = [];

      // Let the channel know
      let thisEmbed = new MessageEmbed()
        .setTitle('The ' + this.botData.president + ' role has been passed to - ' + this.government.nomPres + '!')
        .setColor(c_colours.COLOUR_HELP)
        .setDescription('The ' + this.botData.president + ' role has been passed on!\n\n**The new ' + this.botData.president + ' nominee is: ' + this.government.nomPres + '!**\n\nThis ' + this.botData.president + ' nominee should now nominate the first ' + this.botData.chancellor + ' by typing:\n\n**' + this.botData.prefix + ' nominate @username**\n\n(make sure the username has been mentioned/tagged in your message)');

      this.channel.send(thisEmbed);

    });

  }

  // Outputs the visual game board
  generateGameBoard(){

    /*
    testing

    this.players.count = 5;
    this.boardProgress.liberal = 4;
    this.boardProgress.fascist = 5;
    this.boardProgress.failure = 3;
    */

    const canvas = createCanvas(c_canvas.CNV_WIDTH, c_canvas.CNV_HEIGHT);
  	const ctx = canvas.getContext('2d');

    // Measuring title widths
    ctx.font = this.botData.fontTeamHeader + 'px "' + this.botData.fontName + '"';
    let libTitleWidth = ctx.measureText(this.botData.liberal.toUpperCase()).width * 1.25;
    let libHeadBlockWidth = (c_canvas.CNV_WIDTH - libTitleWidth) / 2;
    //let testContextWidth = ctx.measureText(this.botData.liberal.toUpperCase()).width;
    //let testCustomWidth = t_std.measureTextWidth(ctx, this.botData.liberal.toUpperCase(), this.botData.fontName, this.botData.fontTeamHeader);
    //console.log('Context width: ',testContextWidth);
    //console.log('Custom width: ',testCustomWidth);

    let fasTitleWidth = ctx.measureText(this.botData.fascist.toUpperCase()).width + 50;
    let fasHeadBlockWidth = (c_canvas.CNV_WIDTH - fasTitleWidth) / 2;

    // Liberal BG
    ctx.fillStyle = c_colours.CTX_COL_LIBS_BG;
    ctx.fillRect(0, 0, c_canvas.CNV_WIDTH, c_canvas.CNV_HEIGHT / 2);
    // Liberal Title Blocks
    ctx.fillStyle = c_colours.CTX_COL_LIBS_BOR;
    // Changing this to match font width
    //ctx.fillRect(0, 0, c_canvas.CNV_WIDTH / 3, c_canvas.HEADER_HEIGHT);
    //ctx.fillRect((2 * c_canvas.CNV_WIDTH) / 3, 0, c_canvas.CNV_WIDTH / 3, c_canvas.HEADER_HEIGHT);
    ctx.fillRect(0, 0, libHeadBlockWidth, c_canvas.HEADER_HEIGHT);
    ctx.fillRect((libHeadBlockWidth + libTitleWidth), 0, libHeadBlockWidth, c_canvas.HEADER_HEIGHT);

    ctx.fillRect(0, 0, c_canvas.CNV_WIDTH / 3, c_canvas.HEADER_HEIGHT);
    // Liberal Side Blocks
    ctx.fillRect(0, 0, c_canvas.LIB_BORDER_WIDTH, c_canvas.CNV_HEIGHT / 2);
    ctx.fillRect(c_canvas.LIB_BORDER_WIDTH + (5 * c_canvas.SLOT_WIDTH), 0, c_canvas.LIB_BORDER_WIDTH, c_canvas.CNV_HEIGHT / 2);
    // Liberal Fail Blocks
    ctx.fillRect(0, c_canvas.HEADER_HEIGHT + c_canvas.SLOT_HEIGHT, c_canvas.FAIL_BORDER_WIDTH, c_canvas.HEADER_HEIGHT);
    ctx.fillRect(c_canvas.FAIL_BORDER_WIDTH + (4 * c_canvas.SLOT_WIDTH), c_canvas.HEADER_HEIGHT + c_canvas.SLOT_HEIGHT, c_canvas.FAIL_BORDER_WIDTH, c_canvas.HEADER_HEIGHT);
    // Liberal strip
    ctx.beginPath();
    ctx.strokeStyle = c_colours.CTX_COL_LIBS;
    ctx.lineWidth = c_canvas.STRIP_WIDTH;
    ctx.rect(c_canvas.STRIP_MARGIN, c_canvas.STRIP_MARGIN, c_canvas.CNV_WIDTH - (2 * c_canvas.STRIP_MARGIN), (c_canvas.CNV_HEIGHT / 2) - (2 * c_canvas.STRIP_MARGIN));
    ctx.stroke();

    // Fascist BG
    ctx.fillStyle = c_colours.CTX_COL_FASC_BG;
    ctx.fillRect(0, c_canvas.CNV_HEIGHT / 2, c_canvas.CNV_WIDTH, c_canvas.CNV_HEIGHT / 2);
    // Fascist Title Blocks
    ctx.fillStyle = c_colours.CTX_COL_FASC_BOR;
    // Changing this to match font width
    //ctx.fillRect(0, c_canvas.CNV_HEIGHT / 2, c_canvas.CNV_WIDTH / 3, c_canvas.HEADER_HEIGHT);
    //ctx.fillRect((2 * c_canvas.CNV_WIDTH) / 3, c_canvas.CNV_HEIGHT / 2, c_canvas.CNV_WIDTH / 3, c_canvas.HEADER_HEIGHT);
    ctx.fillRect(0, c_canvas.CNV_HEIGHT / 2, fasHeadBlockWidth, c_canvas.HEADER_HEIGHT);
    ctx.fillRect((fasHeadBlockWidth + fasTitleWidth), c_canvas.CNV_HEIGHT / 2, fasHeadBlockWidth, c_canvas.HEADER_HEIGHT);

    // Fascist Side Blocks
    ctx.fillRect(0, c_canvas.CNV_HEIGHT / 2, c_canvas.FAS_BORDER_WIDTH, c_canvas.CNV_HEIGHT / 2);
    ctx.fillRect(c_canvas.FAS_BORDER_WIDTH + (6 * c_canvas.SLOT_WIDTH), c_canvas.CNV_HEIGHT / 2, c_canvas.FAS_BORDER_WIDTH, c_canvas.CNV_HEIGHT / 2);
    // Fascist Hitler Info Text Block
    ctx.fillRect(0, c_canvas.CNV_HEIGHT / 2 + c_canvas.HEADER_HEIGHT + c_canvas.SLOT_HEIGHT, c_canvas.CNV_WIDTH, c_canvas.HEADER_HEIGHT);
    // Fascist strip
    ctx.beginPath();
    ctx.strokeStyle = c_colours.CTX_COL_FASC;
    ctx.rect(c_canvas.STRIP_MARGIN, (c_canvas.CNV_HEIGHT / 2) + c_canvas.STRIP_MARGIN, c_canvas.CNV_WIDTH - (2 * c_canvas.STRIP_MARGIN), (c_canvas.CNV_HEIGHT / 2) - (2 * c_canvas.STRIP_MARGIN));
    ctx.stroke();

    // Draw the borders
    ctx.beginPath();
    ctx.strokeStyle = c_colours.CTX_COL_TEXT;
    ctx.lineWidth = c_canvas.BORDER_LINES_WIDTH;
    // LIBERAL SLOT BORDER
    ctx.rect(0, c_canvas.HEADER_HEIGHT, c_canvas.CNV_WIDTH, (c_canvas.SLOT_HEIGHT + c_canvas.HEADER_HEIGHT) );
    // FAILURE TRACK BORDER
    ctx.rect(0, (c_canvas.SLOT_HEIGHT + c_canvas.HEADER_HEIGHT), c_canvas.CNV_WIDTH, (c_canvas.SLOT_HEIGHT + c_canvas.HEADER_HEIGHT + c_canvas.HEADER_HEIGHT) );
    // FASCIST SLOT BORDER
    ctx.rect(0, c_canvas.TEAM_HEIGHT + c_canvas.HEADER_HEIGHT, c_canvas.CNV_WIDTH, (c_canvas.TEAM_HEIGHT + c_canvas.SLOT_HEIGHT + c_canvas.HEADER_HEIGHT) );
    // HITLER INFO BORDER
    ctx.rect(0, (c_canvas.TEAM_HEIGHT + c_canvas.SLOT_HEIGHT + c_canvas.HEADER_HEIGHT), c_canvas.CNV_WIDTH, (c_canvas.TEAM_HEIGHT + c_canvas.SLOT_HEIGHT + c_canvas.HEADER_HEIGHT + c_canvas.HEADER_HEIGHT) );
    ctx.stroke();
    ctx.closePath();

    // Output Team Headings
    //ctx.font = '40px "Eskapade"';
    //ctx.font = this.botData.fontTeamHeader + 'px "Eskapade"';
    ctx.font = this.botData.fontTeamHeader + 'px "' + this.botData.fontName + '"';
    ctx.textAlign = "center";
    ctx.fillStyle = c_colours.CTX_COL_TEXT;
    ctx.fillText(this.botData.liberal.toUpperCase(), c_canvas.CNV_WIDTH / 2, c_canvas.HEADER_HEIGHT - 10);
    ctx.fillText(this.botData.fascist.toUpperCase(), c_canvas.CNV_WIDTH / 2, c_canvas.TEAM_HEIGHT + c_canvas.HEADER_HEIGHT - 10);


    let boardActions = c_board.GAME_BOARD[0];
    // Output liberal slots
    let xStart = c_canvas.LIB_BORDER_WIDTH;
    // Heights always the same
    let y1 = c_canvas.HEADER_HEIGHT;
    //ctx.font = 'bold 14px sans-serif';
    ctx.font = 'bold ' + this.botData.fontBoardActions + 'px sans-serif';
    for (let i = 0; i < c_game.BOARD_LIBERAL_COUNT; i++){
      let x1 = xStart + (c_canvas.SLOT_WIDTH * i);
      ctx.beginPath();
      ctx.rect(x1, y1, c_canvas.SLOT_WIDTH, c_canvas.SLOT_HEIGHT);
      ctx.stroke();
      ctx.closePath();
      let slotText = boardActions[i].replace(/Liberal/, this.botData.liberal);
      //t_std.wrapText(ctx, boardActions[i].toUpperCase(), x1 + Math.floor(c_canvas.SLOT_WIDTH / 2), y1 + 50, c_canvas.SLOT_WIDTH - 15, 20);
      t_std.wrapText(ctx, slotText.toUpperCase(), x1 + Math.floor(c_canvas.SLOT_WIDTH / 2), y1 + 50, c_canvas.SLOT_WIDTH - 15, 20);
    }

    // Output cards over the filled slots
    let libSlots = this.boardProgress.liberal;
    // Nowt to do if no slots filled
    if (libSlots !== 0){
      for (let i = 0; i < libSlots; i++){
        let x1 = xStart + (c_canvas.SLOT_WIDTH * i) + 1;
        // Clear card BG
        ctx.fillStyle = c_colours.CTX_COL_BG;
        ctx.fillRect(x1, y1 + 1, c_canvas.SLOT_WIDTH - 2, c_canvas.SLOT_HEIGHT - 2);
        // Liberal Colour Strip
        ctx.fillStyle = c_colours.CTX_COL_LIBS;
        ctx.fillRect(x1 + (2 * c_canvas.STRIP_WIDTH), y1 + 1 + (2 * c_canvas.STRIP_WIDTH), c_canvas.SLOT_WIDTH - 2 - (4 * c_canvas.STRIP_WIDTH), c_canvas.SLOT_HEIGHT - 2 - (4 * c_canvas.STRIP_WIDTH));
        // Clear rect over the top
        ctx.fillStyle = c_colours.CTX_COL_BG;
        ctx.fillRect(x1 + c_canvas.CARD_BORDER, y1 + c_canvas.CARD_BORDER, c_canvas.SLOT_WIDTH - (2 * c_canvas.CARD_BORDER), c_canvas.SLOT_HEIGHT - (2 * c_canvas.CARD_BORDER));
        // Bird icon
        ctx.fillStyle = c_colours.CTX_COL_LIBS;
        let xLogo = x1 + (c_canvas.SLOT_WIDTH / 3);
        let yLogo = y1 + c_canvas.CARD_BORDER + 5;
        // Main wings/outline
        ctx.beginPath();
        ctx.moveTo(xLogo, yLogo);
        ctx.lineTo(xLogo + 10, yLogo + 10);   // 1
        ctx.lineTo(xLogo + 15, yLogo + 25);   // 2
        ctx.lineTo(xLogo + 30, yLogo + 10);   // 3
        ctx.lineTo(xLogo + 40, yLogo - 3);    // 4
        ctx.lineTo(xLogo + 20, yLogo + 50);   // 5
        ctx.lineTo(xLogo + 40, yLogo + 65);   // 6
        ctx.lineTo(xLogo + 20, yLogo + 70);   // 7
        ctx.lineTo(xLogo + 15, yLogo + 50);   // 8
        ctx.lineTo(xLogo + 10, yLogo + 25);   // 9
        ctx.lineTo(xLogo + 5, yLogo + 10);    // 10
        ctx.lineTo(xLogo, yLogo);             // 11
        ctx.fill();
        ctx.closePath();
        // Body circle
        ctx.arc(xLogo + 10, yLogo + 40, 14, 0, 2 * Math.PI);
        // Head circle
        ctx.arc(xLogo - 3, yLogo + 32, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
        // Card text (center aligned)
        ctx.fillStyle = c_colours.CTX_COL_LIBS;
        //ctx.font = 'bold 26px "Eskapade"';
        ctx.font = 'bold ' + this.botData.fontCardHeader + 'px "' + this.botData.fontName + '"';
        // Special wrapper check for "Order of the Phoenix"
        if (ctx.measureText(this.botData.liberal.toUpperCase()).width > ( c_canvas.SLOT_WIDTH - (2 * c_canvas.CARD_BORDER))){
          t_std.wrapText(ctx, this.botData.liberal.toUpperCase(), x1 + Math.floor(c_canvas.SLOT_WIDTH / 2), y1 + (c_canvas.SLOT_HEIGHT / 2), c_canvas.SLOT_WIDTH - 15, 15);
        }else{
          ctx.fillText(this.botData.liberal.toUpperCase(), x1 + (c_canvas.SLOT_WIDTH / 2), y1 + (c_canvas.SLOT_HEIGHT / 2) + 17);
        }
        // Dashed line
        ctx.beginPath();
        ctx.strokeStyle = c_colours.CTX_COL_LIBS;
        ctx.setLineDash([2, 10]);
        ctx.moveTo( x1 + c_canvas.CARD_BORDER, y1 + (c_canvas.SLOT_HEIGHT / 2) + 20);
        ctx.lineTo( x1 + c_canvas.SLOT_WIDTH - c_canvas.CARD_BORDER, y1 + (c_canvas.SLOT_HEIGHT / 2) + 20);
        ctx.stroke();
        ctx.closePath();
        // Article
        ctx.font = '14px serif';
        ctx.fillText('ARTICLE', x1 + (c_canvas.SLOT_WIDTH / 3) + 5, y1 + (c_canvas.SLOT_HEIGHT / 2) + 40);
        // Text lines
        ctx.beginPath();
        ctx.setLineDash([]);
        // Line next to article
        ctx.moveTo( x1 + (c_canvas.SLOT_WIDTH / 2) + 20, y1 + (c_canvas.SLOT_HEIGHT / 2) + 35);
        ctx.lineTo( x1 + c_canvas.SLOT_WIDTH - (c_canvas.CARD_BORDER + 5), y1 + (c_canvas.SLOT_HEIGHT / 2) + 35);
        // Lines underneath
        ctx.moveTo( x1 + c_canvas.CARD_BORDER + 5, y1 + (c_canvas.SLOT_HEIGHT / 2) + 50);
        ctx.lineTo( x1 + c_canvas.SLOT_WIDTH - (c_canvas.CARD_BORDER + 5), y1 + (c_canvas.SLOT_HEIGHT / 2) + 50);
        ctx.moveTo( x1 + c_canvas.CARD_BORDER + 5, y1 + (c_canvas.SLOT_HEIGHT / 2) + 65);
        ctx.lineTo( x1 + c_canvas.SLOT_WIDTH - (c_canvas.CARD_BORDER + 5), y1 + (c_canvas.SLOT_HEIGHT / 2) + 65);
        ctx.moveTo( x1 + c_canvas.CARD_BORDER + 5, y1 + (c_canvas.SLOT_HEIGHT / 2) + 80);
        ctx.lineTo( x1 + c_canvas.SLOT_WIDTH - (c_canvas.CARD_BORDER + 5), y1 + (c_canvas.SLOT_HEIGHT / 2) + 80);
        ctx.stroke();
        ctx.closePath();
      }
    }

    // Output the failure track
    xStart = c_canvas.FAIL_BORDER_WIDTH;
    // Heights always the same
    y1 = c_canvas.SLOT_HEIGHT + c_canvas.HEADER_HEIGHT;
    //ctx.font = '30px sans-serif';
    ctx.fillStyle = c_colours.CTX_COL_TEXT;
    for (let i = 0; i <= c_game.BOARD_FAIL_COUNT; i++){
      let x1 = xStart + (c_canvas.SLOT_WIDTH * i);
      ctx.beginPath();
      ctx.rect(x1, y1, c_canvas.SLOT_WIDTH, c_canvas.HEADER_HEIGHT);
      ctx.stroke();
      ctx.closePath();
      ctx.strokeStyle = c_colours.CTX_COL_TEXT;
      // Put the slot number in the box
      if (i === 0){
        // wrapText(context, text, x, y, maxWidth, lineHeight)
        ctx.font = 'bold 12px sans-serif';
        t_std.wrapText(ctx, 'ELECTION TRACKER', x1 + Math.floor(c_canvas.SLOT_WIDTH / 2), y1 + 21, c_canvas.SLOT_WIDTH - 20, 12);
      }else if (i === c_game.BOARD_FAIL_COUNT){
        ctx.font = 'bold 12px sans-serif';
        ctx.beginPath();
        ctx.arc(x1 + (c_canvas.SLOT_WIDTH / 4), y1 + (c_canvas.HEADER_HEIGHT / 2), (c_canvas.HEADER_HEIGHT / 2) - 10, 0, 2 * Math.PI);
        ctx.stroke();
        t_std.wrapText(ctx, 'REVEAL & ENACT TOP POLICY', x1 + Math.floor(2 * c_canvas.SLOT_WIDTH / 3) + 5, y1 + 15, 2 * c_canvas.SLOT_WIDTH / 3, 12);
      }else{
        ctx.font = 'bold 12px sans-serif';
        ctx.beginPath();
        ctx.arc(x1 + (c_canvas.SLOT_WIDTH / 4), y1 + (c_canvas.HEADER_HEIGHT / 2), (c_canvas.HEADER_HEIGHT / 2) - 10, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillText( String('FAIL'), x1 + Math.floor( 3 * c_canvas.SLOT_WIDTH / 4), y1 + 27);
      }

    }

    // Output cards over failure track slots
    let failSlots = this.boardProgress.failure;
    if (failSlots !== 0){
      for (let i = 0; i < failSlots; i++){
        let x1 = xStart + (c_canvas.SLOT_WIDTH * (i + 1) ) + 1;
        ctx.fillStyle = c_colours.CTX_COL_LIBS_BOR;
        ctx.beginPath();
        ctx.arc(x1 + (c_canvas.SLOT_WIDTH / 4), y1 + (c_canvas.HEADER_HEIGHT / 2), (c_canvas.HEADER_HEIGHT / 2) - 10, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    let fascistText = '';
    boardActions = '';
    switch (this.players.count){
      case 5:
      case 6:
        fascistText = c_text.TEXT_FIVESIX;
        boardActions = c_board.GAME_BOARD[1];
        break;
      case 7:
      case 8:
        fascistText = c_text.TEXT_SEVENEIGHT;
        boardActions = c_board.GAME_BOARD[2];
        break;
      case 9:
      case 10:
        fascistText = c_text.TEXT_NINETEN;
        boardActions = c_board.GAME_BOARD[3];
        break;
    }

    // Output fascist slots
    xStart = c_canvas.FAS_BORDER_WIDTH;
    // Heights always the same
    y1 = c_canvas.TEAM_HEIGHT + c_canvas.HEADER_HEIGHT;
    //ctx.font = 'bold 14px sans-serif';
    ctx.font = 'bold ' + this.botData.fontBoardActions + 'px sans-serif';
    ctx.fillStyle = c_colours.CTX_COL_TEXT;
    for (let i = 0; i < c_game.BOARD_FASCIST_COUNT; i++){
      let x1 = xStart + (c_canvas.SLOT_WIDTH * i);
      ctx.beginPath();
      ctx.rect(x1, y1, c_canvas.SLOT_WIDTH, c_canvas.SLOT_HEIGHT);
      ctx.stroke();
      ctx.closePath();
      let slotText = boardActions[i].replace(/Fascist/, this.botData.fascist).replace(/President/g, this.botData.president).replace(/Player/g, this.botData.player);
      //t_std.wrapText(ctx, boardActions[i].toUpperCase(), x1 + Math.floor(c_canvas.SLOT_WIDTH / 2), y1 + 50, c_canvas.SLOT_WIDTH - 15, 20);
      t_std.wrapText(ctx, slotText.toUpperCase(), x1 + Math.floor(c_canvas.SLOT_WIDTH / 2), y1 + 50, c_canvas.SLOT_WIDTH - 15, 20);
    }

    // Output cards over the filled slots
    let fascSlots = this.boardProgress.fascist;
    // Nowt to do if no slots filled
    if (fascSlots !== 0){
      for (let i = 0; i < fascSlots; i++){
        ctx.fillStyle = c_colours.CTX_COL_FASC;
        ctx.beginPath();
        let x1 = xStart + (c_canvas.SLOT_WIDTH * i) + 1;
        // Clear card BG
        ctx.fillStyle = c_colours.CTX_COL_BG;
        ctx.fillRect(x1, y1 + 1, c_canvas.SLOT_WIDTH - 2, c_canvas.SLOT_HEIGHT - 2);
        // Liberal Colour Strip
        ctx.fillStyle = c_colours.CTX_COL_FASC;
        ctx.fillRect(x1 + (2 * c_canvas.STRIP_WIDTH), y1 + 1 + (2 * c_canvas.STRIP_WIDTH), c_canvas.SLOT_WIDTH - 2 - (4 * c_canvas.STRIP_WIDTH), c_canvas.SLOT_HEIGHT - 2 - (4 * c_canvas.STRIP_WIDTH));
        // Clear rect over the top
        ctx.fillStyle = c_colours.CTX_COL_BG;
        ctx.fillRect(x1 + c_canvas.CARD_BORDER, y1 + c_canvas.CARD_BORDER, c_canvas.SLOT_WIDTH - (2 * c_canvas.CARD_BORDER), c_canvas.SLOT_HEIGHT - (2 * c_canvas.CARD_BORDER));
        // Skull icon
        ctx.fillStyle = c_colours.CTX_COL_FASC;
        // Main circle
        let xCirc = x1 + (c_canvas.SLOT_WIDTH / 2);
        let yCirc = y1 + (c_canvas.SLOT_HEIGHT / 4);
        let rCirc = (c_canvas.SLOT_WIDTH / 4);
        ctx.beginPath();
        ctx.arc(xCirc, yCirc, rCirc, 0 , 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
        // Jaw
        ctx.fillRect(xCirc - (rCirc / 2), yCirc + (rCirc / 2), rCirc, rCirc - 5);
        // Eyes
        ctx.fillStyle = c_colours.CTX_COL_BG;
        ctx.beginPath();
        ctx.arc(xCirc - 18, yCirc, 9, 0 , 2 * Math.PI);
        ctx.fill();
        ctx.arc(xCirc + 18, yCirc, 9, 0 , 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
        // Nose
        ctx.beginPath();
        ctx.moveTo(xCirc, yCirc);
        ctx.lineTo(xCirc + 5, yCirc + 10);
        ctx.lineTo(xCirc - 5, yCirc + 10);
        ctx.lineTo(xCirc, yCirc);
        ctx.fill();
        ctx.closePath();
        // Card text (center aligned)
        ctx.fillStyle = c_colours.CTX_COL_FASC;
        //ctx.font = 'bold 26px "Eskapade"';
        ctx.font = 'bold ' + this.botData.fontCardHeader + 'px "' + this.botData.fontName + '"';
        ctx.fillText(this.botData.fascist.toUpperCase(), x1 + (c_canvas.SLOT_WIDTH / 2), y1 + (c_canvas.SLOT_HEIGHT / 2) + 17);
        // Dashed line
        ctx.beginPath();
        ctx.strokeStyle = c_colours.CTX_COL_FASC;
        ctx.setLineDash([2, 10]);
        ctx.moveTo( x1 + c_canvas.CARD_BORDER, y1 + (c_canvas.SLOT_HEIGHT / 2) + 20);
        ctx.lineTo( x1 + c_canvas.SLOT_WIDTH - c_canvas.CARD_BORDER, y1 + (c_canvas.SLOT_HEIGHT / 2) + 20);
        ctx.stroke();
        ctx.closePath();
        // Article
        ctx.font = '14px serif';
        ctx.fillText('ARTICLE', x1 + (c_canvas.SLOT_WIDTH / 3) + 5, y1 + (c_canvas.SLOT_HEIGHT / 2) + 40);
        // Text lines
        ctx.beginPath();
        ctx.setLineDash([]);
        // Line next to article
        ctx.moveTo( x1 + (c_canvas.SLOT_WIDTH / 2) + 20, y1 + (c_canvas.SLOT_HEIGHT / 2) + 35);
        ctx.lineTo( x1 + c_canvas.SLOT_WIDTH - (c_canvas.CARD_BORDER + 5), y1 + (c_canvas.SLOT_HEIGHT / 2) + 35);
        // Lines underneath
        ctx.moveTo( x1 + c_canvas.CARD_BORDER + 5, y1 + (c_canvas.SLOT_HEIGHT / 2) + 50);
        ctx.lineTo( x1 + c_canvas.SLOT_WIDTH - (c_canvas.CARD_BORDER + 5), y1 + (c_canvas.SLOT_HEIGHT / 2) + 50);
        ctx.moveTo( x1 + c_canvas.CARD_BORDER + 5, y1 + (c_canvas.SLOT_HEIGHT / 2) + 65);
        ctx.lineTo( x1 + c_canvas.SLOT_WIDTH - (c_canvas.CARD_BORDER + 5), y1 + (c_canvas.SLOT_HEIGHT / 2) + 65);
        ctx.moveTo( x1 + c_canvas.CARD_BORDER + 5, y1 + (c_canvas.SLOT_HEIGHT / 2) + 80);
        ctx.lineTo( x1 + c_canvas.SLOT_WIDTH - (c_canvas.CARD_BORDER + 5), y1 + (c_canvas.SLOT_HEIGHT / 2) + 80);
        ctx.stroke();
        ctx.closePath();

      }
    }

    // Fascist Hitler Info Inner Block
    ctx.fillStyle = c_colours.CTX_COL_FASC_BG;
    let hitlerInfoText = fascistText.replace(/FASCIST/g, this.botData.fascist.toUpperCase()).replace(/HITLER/g, this.botData.hitler.toUpperCase());
    //ctx.font = '16px serif';
    ctx.font = this.botData.fontHitlerInfo + 'px serif';
    //let infoWid = ctx.measureText(fascistText).width + 10;
    let infoWid = ctx.measureText(hitlerInfoText).width + 10;
    ctx.fillRect((c_canvas.CNV_WIDTH - infoWid) / 2, c_canvas.CNV_HEIGHT / 2 + c_canvas.HEADER_HEIGHT + c_canvas.SLOT_HEIGHT + 7, infoWid, c_canvas.HEADER_HEIGHT - 20);
    ctx.fillStyle = c_colours.CTX_COL_TEXT;
    //ctx.fillText(fascistText, Math.floor(c_canvas.CNV_WIDTH / 2), c_canvas.TEAM_HEIGHT + c_canvas.HEADER_HEIGHT + c_canvas.SLOT_HEIGHT + 27);
    ctx.fillText(hitlerInfoText, Math.floor(c_canvas.CNV_WIDTH / 2), c_canvas.TEAM_HEIGHT + c_canvas.HEADER_HEIGHT + c_canvas.SLOT_HEIGHT + 27);

  	let attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'game-board.png');

    this.gameBoardCnv = attachment;

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
    let presUser = this.client.users.cache.get(presID);
    let policyNames = [];
    for (let i = 0; i < 3; i++){
      if (this.policyDeck[i] === 'Fascist'){
        policyNames[i] = this.botData.fascist;
      }else{
        policyNames[i] = this.botData.liberal;
      }
    }
    //let topPolicies = 'Policy 1: ' + this.policyDeck[0] + '\n\nPolicy 2: ' + this.policyDeck[1] + '\n\nPolicy 3: ' + this.policyDeck[2] + '\n\n';
    let topPolicies = 'Policy 1: ' + policyNames[0] + '\n\nPolicy 2: ' + policyNames[1] + '\n\nPolicy 3: ' + policyNames[2] + '\n\n';
    let presEmbed = new MessageEmbed()
      .setTitle('Examine Power')
      .setColor(c_colours.COLOUR_HELP)
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
      .setColor(c_colours.COLOUR_HELP)
      .setDescription('You must now choose a player to investigate.\n\nYou will be shown their party membership card - i.e. not "' + this.botData.hitler + '" but instead just "' + this.botData.fascist + '" or "' + this.botData.liberal + '".\n\nIt is easier to copy and paste your preferred response below to send it. If you are using the Discord app on mobile, just hold down on the message you want to send and then paste it into the "message" box below:');
    let presID = this.getUserIDfromUsername(this.government.currPres);
    let presUser = this.client.users.cache.get(presID);
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
    let thisRole = c_board.PLAYER_ROLES[roleIndex];
    if ( (thisRole === 'Hitler') || (thisRole === 'Fascist') ){
      thisRole = this.botData.fascist;
    }else{
      thisRole = this.botData.liberal;
    }
    let investigateEmbed = new MessageEmbed()
      .setTitle('Investigation Result')
      .setColor(c_colours.COLOUR_HELP)
      .setDescription('The results of your investigation are here!\n\n**The Party Membership card for ' + playerName + ' shows they are a ' + thisRole + '**');
    let presID = this.getUserIDfromUsername(this.government.currPres);
    let presUser = this.client.users.cache.get(presID);
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
      .setTitle('Pick ' + this.botData.president + ' Candidate Power')
      .setColor(c_colours.COLOUR_HELP)
      .setDescription('You must now pick the next candidate for ' + this.botData.president + '. There are no limits to who you choose to nominate to be ' + this.botData.president + ', i.e. even players who were ' + this.botData.chancellor + ' this turn can be nominated, however you cannot pick yourself. You are welcome to discuss your decision with the rest of the group. Choose a player from the list below.\n\nIt is easier to copy and paste your preferred response below to send it. If you are using the Discord app on mobile, just hold down on the message you want to send and then paste it into the "message" box below:');
    let presID = this.getUserIDfromUsername(this.government.currPres);
    let presUser = this.client.users.cache.get(presID);
    presUser.send(pickEmbed);
    let names = this.players.nameArr;
    let pIDs = this.players.idArr;
    for (let i = 0; i < names.length; i++){
      // Can't nominate themselves
      if (pIDs[i] !== presID){
        presUser.send('pick candidate ' + (i + 1) + ' - "' + names[i] + '" (' + this.channel.id + ')');
      }
    }
  }

  // Get the selected player and process that result
  powerPickCandidateResult(playerName){
    console.log('Power - President pick candidate result');
    // Turn this off in roundEnd
    //this.status.pickCandidate = false;
    // Translate the player name into an index in the player array
    let thisID = this.getUserIDfromUsername(playerName);
    console.log('Candidate selected ', playerName,' which is index ',thisID);
    this.government.nomPres = playerName;

    let pickEmbed = new MessageEmbed()
      .setTitle('New ' + this.botData.president + ' Picked!')
      .setColor(c_colours.COLOUR_HELP)
      .setDescription('The new ' + this.botData.president + ' has been hand-picked by the outgoing ' + this.botData.president + '!');
    this.channel.send(pickEmbed);
    this.roundEnd();
  }

  /*
    The President must kill a player
  */
  // Ask the President which player to kill
  powerPresidentKillStart(){
    console.log('Power - President kill start');
    this.status.killPower = true;
    let killEmbed = new MessageEmbed()
      .setTitle('Kill Player Power')
      .setColor(c_colours.COLOUR_HELP)
      .setDescription('You must now kill another player, whether you want to or not. You are welcome to discuss your decision with the rest of the group. Choose a player from the list below.\n\nIt is easier to copy and paste your preferred response below to send it. If you are using the Discord app on mobile, just hold down on the message you want to send and then paste it into the "message" box below:');
    let presID = this.getUserIDfromUsername(this.government.currPres);
    let presUser = this.client.users.cache.get(presID);
    presUser.send(killEmbed);
    let names = this.players.nameArr;
    let pIDs = this.players.idArr;
    for (let i = 0; i < names.length; i++){
      // Can't kill themselves
      if (pIDs[i] !== presID){
        presUser.send('kill player ' + (i + 1) + ' - "' + names[i] + '" (' + this.channel.id + ')');
      }
    }

  }

  // Get the selected player and kill them!
  powerPresidentKillResult(playerName){
    console.log('Power - President kill result');
    this.status.killPower = false;
    let killedID = this.getUserIDfromUsername(playerName);
    let killedIndex = this.players.idArr.indexOf(killedID);
    // Check if this player was Hitler
    if (killedID === this.players.secretRoles[0]){
      // This player was Hitler! Let the channel know
      let killEmbed = new MessageEmbed()
        .setTitle('Player Killed - ' + playerName)
        .setColor(c_colours.COLOUR_HELP)
        .setDescription('The ' + this.botData.president + ' was forced to kill a player.\n\nThe unfortunate player who was out of the game is:\n\n**' + playerName + '**');
      this.channel.send(killEmbed);
      killEmbed = new MessageEmbed()
        .setTitle('Surprise Surprise... they were ' + this.botData.hitler + '!')
        .setColor(c_colours.COLOUR_HELP)
        .setDescription('The killed player was ' + this.botData.hitler + '!');
      this.channel.send(killEmbed);
      // Then end the game!
      this.gameOver(this.botData.liberal);
    }else{
      // Add this ID to a list of killed players
      this.players.killedPlayers.push(killedID);
      // Slice out of idArr, nameArr, secretRoles
      this.players.idArr.splice(killedIndex, 1);
      this.players.nameArr.splice(killedIndex, 1);
      let secretIndex = this.players.secretRoles.indexOf(killedID);
      this.players.secretRoles.splice(secretIndex, 1);
      // Update players.count (NO! Used for board actions - so do not update this)
      //this.players.count--;
      let killEmbed = new MessageEmbed()
        .setTitle('Player Killed - ' + playerName)
        .setColor(c_colours.COLOUR_HELP)
        .setDescription('The ' + this.botData.president + ' was forced to kill a player.\n\nThe unfortunate player who was out of the game is:\n\n**' + playerName + '**');
      this.channel.send(killEmbed);

      this.roundEnd();
    }
  }

  /*
    Veto power is unlocked
  */
  powerVetoUnlocked(){
    this.government.vetoUnlocked = true;
    let thisEmbed = new MessageEmbed()
      .setTitle('Veto Power Unlocked')
      .setColor(c_colours.COLOUR_HELP)
      .setDescription('The Veto Power has been unlocked for future legislative sessions.\n\nThe ' + this.botData.president + ' and ' + this.botData.chancellor + ' can jointly agree to veto the policy choices, which will then result in a failed session (increasing the failure track).\n\n**How the Veto works**\nOnce the ' + this.botData.president + ' has discarded one of the policies and passed them to the ' + this.botData.chancellor + ', the ' + this.botData.chancellor + ' may then ask to veto those two options. If the ' + this.botData.president + ' agrees to the veto, the policies are discarded and the election tracker is advanced one step. If the ' + this.botData.president + ' does not agree, then the ' + this.botData.chancellor + ' must enact one of the two policy options as usual.');
    this.channel.send(thisEmbed);
    //NOT NEEDED - as veto will trigger with presKill
    //this.roundEnd();
  }

  /*
    GAME OVER!
  */
  gameOver(winTeam){

    this.status.gameOver = true;
    this.status.gameRunning = false;

    t_logs.addGameToLog(gamesLogFN, this.channel, true);
    let gamesStats = t_logs.getGameLogStats(gamesLogFN);
    console.log('Game Over in channel "' + this.channel.name + '"');
    console.log('Active Games = ' + gamesStats.active);
    console.log('Total Games finished so far = ' + gamesStats.finished);

    let embedCol = c_colours.COLOUR_LIBERAL;
    if (winTeam === this.botData.fascist){
      embedCol = c_colours.COLOUR_FASCIST;
    }
    let thisEmbed = new MessageEmbed()
      .setTitle('Game Over - ' + winTeam + ' Win!')
      .setColor(embedCol)
      .setDescription('The ' + winTeam + ' were the winners!');
    this.channel.send(thisEmbed);
    this.reset();
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
