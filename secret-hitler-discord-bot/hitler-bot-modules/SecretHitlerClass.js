class SecretHitlerGame {

  /*
    Initialise the game - sets up variables
    unique to the channel where it has been added
  */
  constructor (channel){

    // Added the channel data for reference (not used)
    this.channel = channel;

    // A flag to show the channel an introduction
    this.welcomeMessageSent = false;

    // The number of channels the bot gets added to
    console.log(tools.getDateStamp());
    global.botStats.channelsAdded++;
    console.log(tools.getDateStamp(),' New channel added in "' + this.channel.name + '". Channels added so far = ',global.botStats.channelsAdded);

    // A status flag for game overs & running
    this.status = {};
    this.status.gameOver = false;
    this.status.gameRunning = false;
    this.status.investigating = false;
    this.status.pickCandidate = false;

    // NOTE - these are not reset between games
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
    this.policyDeck = tools.shuffle(POLICY_CARDS);
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

    this.policyDeck = tools.shuffle(POLICY_CARDS);
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

      global.botStats.gamesLogged++;
      global.botStats.activeGames++;
      this.status.gameRunning = true;
      // Assign secret identity and membership cards
      // Shuffle the ID array (this will match up to roles)
      let thePlayers = tools.shuffle(this.players.idArr);
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
    // Remove the top policy off the deck
    let thePolicy = this.policyDeck.splice(0,1);
    let chaosEmbed = new MessageEmbed()
      .setTitle('3 Elections Failures - ' + thePolicy + ' policy enacted!')
      .setColor(COLOUR_HELP)
      .setDescription('There have now been 3 failed elections in a row!\n\nAs a result, the populace have decided to force a ' + thePolicy + ' policy to be enacted! The following special rules also apply:\n\n* Any board actions which would have been triggered are ignored for this policy.\n* All players are now eligible to be Chancellor.\n* The election failure tracker resets back to 0.');
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
    if (this.boardProgress.liberal === BOARD_LIBERAL_COUNT){
      this.gameOver(this.botData.liberal);
      // Send the final game board if game over
      this.channel.send(this.gameBoardCnv);
    }else if (this.boardProgress.fascist === BOARD_FASCIST_COUNT){
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

    this.policyDeck = tools.shuffle(POLICY_CARDS);
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

    // Quick IF in case returning to this function from a DECLINED veto
    if (discardID !== ''){
      // Note discardID is 1/2/3 but relates to policyOptions[id - 1];
      console.log('Policy Phase 2 started',discardID);
      // Now splice that index from the policyOptions
      this.policyOptions.splice(discardID - 1, 1);
    }

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
    this.boardProgress.failure = 0;

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
        // Check if game over
        if (this.boardProgress.liberal === BOARD_LIBERAL_COUNT){
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

      // Let the channel know
      let thisEmbed = new MessageEmbed()
        .setTitle('The ' + this.botData.president + ' role has been passed to - ' + this.government.nomPres + '!')
        .setColor(COLOUR_HELP)
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

    const canvas = createCanvas(CNV_WIDTH, CNV_HEIGHT);
  	const ctx = canvas.getContext('2d');

    // Liberal BG
    ctx.fillStyle = CTX_COL_LIBS_BG;
    ctx.fillRect(0, 0, CNV_WIDTH, CNV_HEIGHT / 2);
    // Liberal Title Blocks
    ctx.fillStyle = CTX_COL_LIBS_BOR;
    ctx.fillRect(0, 0, CNV_WIDTH / 3, HEADER_HEIGHT);
    ctx.fillRect((2 * CNV_WIDTH) / 3, 0, CNV_WIDTH / 3, HEADER_HEIGHT);
    // Liberal Side Blocks
    ctx.fillRect(0, 0, LIB_BORDER_WIDTH, CNV_HEIGHT / 2);
    ctx.fillRect(LIB_BORDER_WIDTH + (5 * SLOT_WIDTH), 0, LIB_BORDER_WIDTH, CNV_HEIGHT / 2);
    // Liberal Fail Blocks
    ctx.fillRect(0, HEADER_HEIGHT + SLOT_HEIGHT, FAIL_BORDER_WIDTH, HEADER_HEIGHT);
    ctx.fillRect(FAIL_BORDER_WIDTH + (4 * SLOT_WIDTH), HEADER_HEIGHT + SLOT_HEIGHT, FAIL_BORDER_WIDTH, HEADER_HEIGHT);
    // Liberal strip
    ctx.beginPath();
    ctx.strokeStyle = CTX_COL_LIBS;
    ctx.lineWidth = STRIP_WIDTH;
    ctx.rect(STRIP_MARGIN, STRIP_MARGIN, CNV_WIDTH - (2 * STRIP_MARGIN), (CNV_HEIGHT / 2) - (2 * STRIP_MARGIN));
    ctx.stroke();

    // Fascist BG
    ctx.fillStyle = CTX_COL_FASC_BG;
    ctx.fillRect(0, CNV_HEIGHT / 2, CNV_WIDTH, CNV_HEIGHT / 2);
    // Fascist Title Blocks
    ctx.fillStyle = CTX_COL_FASC_BOR;
    ctx.fillRect(0, CNV_HEIGHT / 2, CNV_WIDTH / 3, HEADER_HEIGHT);
    ctx.fillRect((2 * CNV_WIDTH) / 3, CNV_HEIGHT / 2, CNV_WIDTH / 3, HEADER_HEIGHT);
    // Fascist Side Blocks
    ctx.fillRect(0, CNV_HEIGHT / 2, FAS_BORDER_WIDTH, CNV_HEIGHT / 2);
    ctx.fillRect(FAS_BORDER_WIDTH + (6 * SLOT_WIDTH), CNV_HEIGHT / 2, FAS_BORDER_WIDTH, CNV_HEIGHT / 2);
    // Fascist Hitler Info Text Block
    ctx.fillRect(0, CNV_HEIGHT / 2 + HEADER_HEIGHT + SLOT_HEIGHT, CNV_WIDTH, HEADER_HEIGHT);
    // Fascist strip
    ctx.beginPath();
    ctx.strokeStyle = CTX_COL_FASC;
    ctx.rect(STRIP_MARGIN, (CNV_HEIGHT / 2) + STRIP_MARGIN, CNV_WIDTH - (2 * STRIP_MARGIN), (CNV_HEIGHT / 2) - (2 * STRIP_MARGIN));
    ctx.stroke();

    // Draw the borders
    ctx.beginPath();
    ctx.strokeStyle = CTX_COL_TEXT;
    ctx.lineWidth = BORDER_LINES_WIDTH;
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
    ctx.font = '40px "Eskapade"';
    ctx.textAlign = "center";
    ctx.fillStyle = CTX_COL_TEXT;
    ctx.fillText(this.botData.liberal.toUpperCase(), CNV_WIDTH / 2, HEADER_HEIGHT - 10);
    ctx.fillText(this.botData.fascist.toUpperCase(), CNV_WIDTH / 2, TEAM_HEIGHT + HEADER_HEIGHT - 10);


    let boardActions = GAME_BOARD[0];
    // Output liberal slots
    let xStart = LIB_BORDER_WIDTH;
    // Heights always the same
    let y1 = HEADER_HEIGHT;
    ctx.font = 'bold 14px sans-serif';
    for (let i = 0; i < BOARD_LIBERAL_COUNT; i++){
      let x1 = xStart + (SLOT_WIDTH * i);
      ctx.beginPath();
      ctx.rect(x1, y1, SLOT_WIDTH, SLOT_HEIGHT);
      ctx.stroke();
      ctx.closePath();
      tools.wrapText(ctx, boardActions[i].toUpperCase(), x1 + Math.floor(SLOT_WIDTH / 2), y1 + 50, SLOT_WIDTH - 15, 20);
    }

    // Output cards over the filled slots
    let libSlots = this.boardProgress.liberal;
    // Nowt to do if no slots filled
    if (libSlots !== 0){
      for (let i = 0; i < libSlots; i++){
        let x1 = xStart + (SLOT_WIDTH * i) + 1;
        // Clear card BG
        ctx.fillStyle = CTX_COL_BG;
        ctx.fillRect(x1, y1 + 1, SLOT_WIDTH - 2, SLOT_HEIGHT - 2);
        // Liberal Colour Strip
        ctx.fillStyle = CTX_COL_LIBS;
        ctx.fillRect(x1 + (2 * STRIP_WIDTH), y1 + 1 + (2 * STRIP_WIDTH), SLOT_WIDTH - 2 - (4 * STRIP_WIDTH), SLOT_HEIGHT - 2 - (4 * STRIP_WIDTH));
        // Clear rect over the top
        ctx.fillStyle = CTX_COL_BG;
        ctx.fillRect(x1 + CARD_BORDER, y1 + CARD_BORDER, SLOT_WIDTH - (2 * CARD_BORDER), SLOT_HEIGHT - (2 * CARD_BORDER));
        // Bird icon
        ctx.fillStyle = CTX_COL_LIBS;
        let xLogo = x1 + (SLOT_WIDTH / 3);
        let yLogo = y1 + CARD_BORDER + 5;
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
        ctx.fillStyle = CTX_COL_LIBS;
        //ctx.font = 'small-caps bold 18px serif';
        ctx.font = 'bold 26px "Eskapade"';
        ctx.fillText('LIBERAL', x1 + (SLOT_WIDTH / 2), y1 + (SLOT_HEIGHT / 2) + 17);
        // Dashed line
        ctx.beginPath();
        ctx.strokeStyle = CTX_COL_LIBS;
        ctx.setLineDash([2, 10]);
        ctx.moveTo( x1 + CARD_BORDER, y1 + (SLOT_HEIGHT / 2) + 20);
        ctx.lineTo( x1 + SLOT_WIDTH - CARD_BORDER, y1 + (SLOT_HEIGHT / 2) + 20);
        ctx.stroke();
        ctx.closePath();
        // Article
        ctx.font = '14px serif';
        ctx.fillText('ARTICLE', x1 + (SLOT_WIDTH / 3) + 5, y1 + (SLOT_HEIGHT / 2) + 40);
        // Text lines
        ctx.beginPath();
        ctx.setLineDash([]);
        // Line next to article
        ctx.moveTo( x1 + (SLOT_WIDTH / 2) + 20, y1 + (SLOT_HEIGHT / 2) + 35);
        ctx.lineTo( x1 + SLOT_WIDTH - (CARD_BORDER + 5), y1 + (SLOT_HEIGHT / 2) + 35);
        // Lines underneath
        ctx.moveTo( x1 + CARD_BORDER + 5, y1 + (SLOT_HEIGHT / 2) + 50);
        ctx.lineTo( x1 + SLOT_WIDTH - (CARD_BORDER + 5), y1 + (SLOT_HEIGHT / 2) + 50);
        ctx.moveTo( x1 + CARD_BORDER + 5, y1 + (SLOT_HEIGHT / 2) + 65);
        ctx.lineTo( x1 + SLOT_WIDTH - (CARD_BORDER + 5), y1 + (SLOT_HEIGHT / 2) + 65);
        ctx.moveTo( x1 + CARD_BORDER + 5, y1 + (SLOT_HEIGHT / 2) + 80);
        ctx.lineTo( x1 + SLOT_WIDTH - (CARD_BORDER + 5), y1 + (SLOT_HEIGHT / 2) + 80);
        ctx.stroke();
        ctx.closePath();
      }
    }

    // Output the failure track
    xStart = FAIL_BORDER_WIDTH;
    // Heights always the same
    y1 = SLOT_HEIGHT + HEADER_HEIGHT;
    //ctx.font = '30px sans-serif';
    ctx.fillStyle = CTX_COL_TEXT;
    for (let i = 0; i <= BOARD_FAIL_COUNT; i++){
      let x1 = xStart + (SLOT_WIDTH * i);
      ctx.beginPath();
      ctx.rect(x1, y1, SLOT_WIDTH, HEADER_HEIGHT);
      ctx.stroke();
      ctx.closePath();
      ctx.strokeStyle = CTX_COL_TEXT;
      // Put the slot number in the box
      if (i === 0){
        // wrapText(context, text, x, y, maxWidth, lineHeight)
        ctx.font = 'bold 12px sans-serif';
        tools.wrapText(ctx, 'ELECTION TRACKER', x1 + Math.floor(SLOT_WIDTH / 2), y1 + 21, SLOT_WIDTH - 20, 12);
      }else if (i === BOARD_FAIL_COUNT){
        ctx.font = 'bold 12px sans-serif';
        ctx.beginPath();
        ctx.arc(x1 + (SLOT_WIDTH / 4), y1 + (HEADER_HEIGHT / 2), (HEADER_HEIGHT / 2) - 10, 0, 2 * Math.PI);
        ctx.stroke();
        tools.wrapText(ctx, 'REVEAL & ENACT TOP POLICY', x1 + Math.floor(2 * SLOT_WIDTH / 3) + 5, y1 + 15, 2 * SLOT_WIDTH / 3, 12);
      }else{
        ctx.font = 'bold 12px sans-serif';
        ctx.beginPath();
        ctx.arc(x1 + (SLOT_WIDTH / 4), y1 + (HEADER_HEIGHT / 2), (HEADER_HEIGHT / 2) - 10, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillText( String('FAIL'), x1 + Math.floor( 3 * SLOT_WIDTH / 4), y1 + 27);
      }

    }

    // Output cards over failure track slots
    let failSlots = this.boardProgress.failure;
    if (failSlots !== 0){
      for (let i = 0; i < failSlots; i++){
        let x1 = xStart + (SLOT_WIDTH * (i + 1) ) + 1;
        ctx.fillStyle = CTX_COL_LIBS_BOR;
        ctx.beginPath();
        ctx.arc(x1 + (SLOT_WIDTH / 4), y1 + (HEADER_HEIGHT / 2), (HEADER_HEIGHT / 2) - 10, 0, 2 * Math.PI);
        ctx.fill();
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
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = CTX_COL_TEXT;
    for (let i = 0; i < BOARD_FASCIST_COUNT; i++){
      let x1 = xStart + (SLOT_WIDTH * i);
      ctx.beginPath();
      ctx.rect(x1, y1, SLOT_WIDTH, SLOT_HEIGHT);
      ctx.stroke();
      ctx.closePath();
      tools.wrapText(ctx, boardActions[i].toUpperCase(), x1 + Math.floor(SLOT_WIDTH / 2), y1 + 50, SLOT_WIDTH - 15, 20);
    }

    // Output cards over the filled slots
    let fascSlots = this.boardProgress.fascist;
    // Nowt to do if no slots filled
    if (fascSlots !== 0){
      for (let i = 0; i < fascSlots; i++){
        ctx.fillStyle = CTX_COL_FASC;
        ctx.beginPath();
        let x1 = xStart + (SLOT_WIDTH * i) + 1;
        // Clear card BG
        ctx.fillStyle = CTX_COL_BG;
        ctx.fillRect(x1, y1 + 1, SLOT_WIDTH - 2, SLOT_HEIGHT - 2);
        // Liberal Colour Strip
        ctx.fillStyle = CTX_COL_FASC;
        ctx.fillRect(x1 + (2 * STRIP_WIDTH), y1 + 1 + (2 * STRIP_WIDTH), SLOT_WIDTH - 2 - (4 * STRIP_WIDTH), SLOT_HEIGHT - 2 - (4 * STRIP_WIDTH));
        // Clear rect over the top
        ctx.fillStyle = CTX_COL_BG;
        ctx.fillRect(x1 + CARD_BORDER, y1 + CARD_BORDER, SLOT_WIDTH - (2 * CARD_BORDER), SLOT_HEIGHT - (2 * CARD_BORDER));
        // Skull icon
        ctx.fillStyle = CTX_COL_FASC;
        // Main circle
        let xCirc = x1 + (SLOT_WIDTH / 2);
        let yCirc = y1 + (SLOT_HEIGHT / 4);
        let rCirc = (SLOT_WIDTH / 4);
        ctx.beginPath();
        ctx.arc(xCirc, yCirc, rCirc, 0 , 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
        // Jaw
        ctx.fillRect(xCirc - (rCirc / 2), yCirc + (rCirc / 2), rCirc, rCirc - 5);
        // Eyes
        ctx.fillStyle = CTX_COL_BG;
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
        ctx.fillStyle = CTX_COL_FASC;
        ctx.font = 'bold 26px "Eskapade"';
        ctx.fillText('FASCIST', x1 + (SLOT_WIDTH / 2), y1 + (SLOT_HEIGHT / 2) + 17);
        // Dashed line
        ctx.beginPath();
        ctx.strokeStyle = CTX_COL_FASC;
        ctx.setLineDash([2, 10]);
        ctx.moveTo( x1 + CARD_BORDER, y1 + (SLOT_HEIGHT / 2) + 20);
        ctx.lineTo( x1 + SLOT_WIDTH - CARD_BORDER, y1 + (SLOT_HEIGHT / 2) + 20);
        ctx.stroke();
        ctx.closePath();
        // Article
        ctx.font = '14px serif';
        ctx.fillText('ARTICLE', x1 + (SLOT_WIDTH / 3) + 5, y1 + (SLOT_HEIGHT / 2) + 40);
        // Text lines
        ctx.beginPath();
        ctx.setLineDash([]);
        // Line next to article
        ctx.moveTo( x1 + (SLOT_WIDTH / 2) + 20, y1 + (SLOT_HEIGHT / 2) + 35);
        ctx.lineTo( x1 + SLOT_WIDTH - (CARD_BORDER + 5), y1 + (SLOT_HEIGHT / 2) + 35);
        // Lines underneath
        ctx.moveTo( x1 + CARD_BORDER + 5, y1 + (SLOT_HEIGHT / 2) + 50);
        ctx.lineTo( x1 + SLOT_WIDTH - (CARD_BORDER + 5), y1 + (SLOT_HEIGHT / 2) + 50);
        ctx.moveTo( x1 + CARD_BORDER + 5, y1 + (SLOT_HEIGHT / 2) + 65);
        ctx.lineTo( x1 + SLOT_WIDTH - (CARD_BORDER + 5), y1 + (SLOT_HEIGHT / 2) + 65);
        ctx.moveTo( x1 + CARD_BORDER + 5, y1 + (SLOT_HEIGHT / 2) + 80);
        ctx.lineTo( x1 + SLOT_WIDTH - (CARD_BORDER + 5), y1 + (SLOT_HEIGHT / 2) + 80);
        ctx.stroke();
        ctx.closePath();

      }
    }

    // Fascist Hitler Info Inner Block
    ctx.fillStyle = CTX_COL_FASC_BG;
    ctx.font = '16px serif';
    let infoWid = ctx.measureText(fascistText).width + 10;
    ctx.fillRect((CNV_WIDTH - infoWid) / 2, CNV_HEIGHT / 2 + HEADER_HEIGHT + SLOT_HEIGHT + 7, infoWid, HEADER_HEIGHT - 20);
    ctx.fillStyle = CTX_COL_TEXT;
    ctx.fillText(fascistText, Math.floor(CNV_WIDTH / 2), TEAM_HEIGHT + HEADER_HEIGHT + SLOT_HEIGHT + 27);

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
      .setDescription('You must now pick the next Presidential candidate. There are no limits to who you choose to nominate for the Presidency, i.e. even players who were Chancellor this turn can be nominated, however you cannot pick yourself. You are welcome to discuss your decision with the rest of the group. Choose a player from the list below.\n\nIt is easier to copy and paste your preferred response below to send it. If you are using the Discord app on mobile, just hold down on the message you want to send and then paste it into the "message" box below:');
    let presID = this.getUserIDfromUsername(this.government.currPres);
    let presUser = client.users.cache.get(presID);
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
      .setTitle('New President Picked!')
      .setColor(0x00ff00)
      .setDescription('The new President has been hand-picked by the outgoing President!');
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
      .setColor(0x00ff00)
      .setDescription('You must now kill another player, whether you want to or not. You are welcome to discuss your decision with the rest of the group. Choose a player from the list below.\n\nIt is easier to copy and paste your preferred response below to send it. If you are using the Discord app on mobile, just hold down on the message you want to send and then paste it into the "message" box below:');
    let presID = this.getUserIDfromUsername(this.government.currPres);
    let presUser = client.users.cache.get(presID);
    presUser.send(pickEmbed);
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
        .setColor(0xff0000)
        .setDescription('The ' + this.botData.president + ' was forced to kill a player.\n\nThe unfortunate player who was out of the game is:\n\n**' + playerName + '**');
      this.channel.send(killEmbed);
      killEmbed = new MessageEmbed()
        .setTitle('Surprise Surprise... they were ' + this.botData.hitler + '!')
        .setColor(0x00ff00)
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
      // Update players.count
      this.players.count--;
      let killEmbed = new MessageEmbed()
        .setTitle('Player Killed - ' + playerName)
        .setColor(0xff0000)
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

    this.status.gameOver = true;
    this.status.gameRunning = false;
    global.botStats.activeGames--;
    let embedCol = 0x0000ff;
    if (winTeam === this.botData.fascist){
      embedCol = 0xff0000;
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

module.exports = SecretHitlerGame
