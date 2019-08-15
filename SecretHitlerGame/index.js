
// Using an express app to handle routing/file serving
var express = require('express');
// Using socket to handle bi-direct real-time comm
var socket = require('socket.io');
// The port to be used for this
var port = process.env.PORT || 1932;
  // Hard-coded the local IP for convenience/fewer modules required
  //var myLocalIP = '192.168.0.3';
// Use npm install ip
// https://github.com/indutny/node-ip
var ip = require('ip');
var myLocalIP = ip.address();

/*
// Variables to hold connection list and users list
var connections = [];
var users = [];
// Player Roles list - secret roles
var playerRoles = [];
// Public Roles (president/chancellor)
var publicRoles = [];
*/
// Holds the user information
var userObj = {};
// Holds the connections list (IP addresses)
userObj.connections = [];
// Holds the names of users logged in
userObj.users = [];
// Holds the SORTED list of players for games
userObj.players = [];
// Holds the public (government) roles
userObj.publicRoles = []; //['cur pres', 'cur chan', 'pre pres', 'pre chan'];
// Holds the secret (party member) roles
userObj.secretRoles = []; //['Liberal', 'Liberal', 'Liberal', 'Fascist', 'Hitler' ];

// Player responses - ready & votes
var playerResponses = {};
playerResponses.state = 'ready';
playerResponses.responses = [];
playerResponses.votes = [];
// The current game state (not used at present)
var gameState = 'login';
// config object for the game
var gameConfig = {};
// Limit on the number of players
gameConfig.limit = 10;

// App setup
var app = express();
var server = app.listen(port, myLocalIP, function(){
    console.log(`Server running on IP ${myLocalIP}`);
    console.log(`Listening for requests on port ${port}`);
});

/*
  -----------------
  STATIC FILES
  -----------------
*/
app.use(express.static('/'));

// --- CLIENT FILES
// No path, serve index.html (client)
app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/index.html');
});
// Client JS functions
app.get('/client.js', function(req, res){
  res.sendFile(__dirname + '/client/client.js');
});
// Font used by client and board
app.get('/farisea-dark.ttf', function(req, res){
  res.sendFile(__dirname + '/client/farisea-dark.ttf');
});
// Stylesheet for the client
app.get('/style.css', function(req, res){
  res.sendFile(__dirname + '/client/style.css');
});
// Stylesheet for the client
app.get('/favicon.ico', function(req, res){
  res.sendFile(__dirname + '/client/favicon.ico');
});

// --- BOARD FILES
// Board Index HTML file
app.get('/board', function(req, res){
  res.sendFile(__dirname + '/board/index.html');
});
// Board Index File
app.get('/board.js', function(req, res){
  res.sendFile(__dirname + '/board/board.js');
});
// Board CSS
app.get('/board/style.css', function(req, res){
  res.sendFile(__dirname + '/board/style.css');
});

/*
// Font used by client and board
app.get('/board/farisea-dark.ttf', function(req, res){
  res.sendFile(__dirname + '/board/farisea-dark.ttf');
});
*/
// Font Awesome
app.get('/fontawesome-all.min.js', function(req, res){
  res.sendFile(__dirname + '/board/fontawesome-all.min.js');
});


// Socket setup & pass server
var io = socket(server);

io.on('connection', (socket) => {

  var ipAndPort = myLocalIP + ":" + port;
  io.sockets.emit('board init', ipAndPort);

  // Get the IP of the socket which has connected
  var clientIp = socket.request.connection.remoteAddress;
  console.log('Checking Client IP: ' + clientIp);
  // Flag for new connection
  var newConnection = true;

  // Loop through the connections
  for (let i = 0; i < userObj.connections.length; i++){

    //console.log('Checking Connection %s', i);
    var thisIp = userObj.connections[i].request.connection.remoteAddress;

    // Check if this is an existing player
    if (thisIp === clientIp){

      newConnection = false;
      // Existing user! confirm this user
      //console.log('Existing user');
      socket.username = userObj.users[i];
      userObj.connections[i] = socket;
      //users[i] = socket.username;
      console.log('Existing user matched: %s users connected', userObj.users.length);

      // Send the current game state to this user
      // On the client side, this will load the appropriate section
      if (gameState === 'nominateChancellor'){
        // The nomination section is different for different roles
        io.to(socket.id).emit('server roundStart', userObj.publicRoles, policyCards);
      }else{
        // All other game states should be directly joinable
        io.to(socket.id).emit('server rejoin', gameState);
      }

    }
  }

  if (newConnection){
    // Add this socket to the connections array
    userObj.connections.push(socket);
    console.log('New Socket Connected: %s sockets connected', userObj.connections.length);
  }

  /*
    -------------------
    Socket Disconnected
    -------------------
  */
  socket.on('disconnect', function(){

    // Check if this socket had assigned username
    if (!socket.username) return;

    // Remove this socket from the connections array
    userObj.connections.splice(userObj.connections.indexOf(socket), 1);
    console.log('Socket disconnected: %s sockets connected', userObj.connections.length);

    // If so, remove this socket from the users array
    userObj.users.splice(userObj.users.indexOf(socket.username), 1);
    console.log('User disconnected: %s users connected', userObj.users.length);

  });


  /*
    ---------------------
    New user added (name)
    ---------------------
  */
  socket.on('user added', function(data, callback){

    console.log('New user added', data);
    // The callback is fired on the client side once confirmed
    // This hides the login section and shows message section
    callback(true);
    // Assign this new username to the socket
    socket.username = data;
    // Add this user to the users array
    userObj.users.push(socket.username);
    // Then call the updateUsernames function to emit the new users array
    updateUsernames();

  });

  // Function to emit usernames to all sockets
  function updateUsernames(){

    // Push the new users array out to all users
    io.sockets.emit('server shareUsers', userObj.users);
    // Also push out to the board (using separate events for now)
    io.sockets.emit('board users', userObj.users);

  }

  /*
    ---------------------------
    Game started - assign roles
    ---------------------------
  */
  socket.on('user startGame', function(){

    var userCount = userObj.users.length;

    if ( (userCount < cardPack.minPlayers) || (userCount > cardPack.maxPlayers) ){

      console.log('Player count error');
      // Socket ID works here as only first player can start game
      io.to(socket.id).emit('server playerCount', userCount);
      return false;

    }else{

      assignSecretRoles();
      io.sockets.emit('server shareRoles', {roles: userObj.secretRoles, users: userObj.players});
      /*
      // TESTING - Only share secret role to individual sockets
      let connCount = userObj.connections.length;
      for (let i = 0; i < connCount; i++){


        io.to(userObj.connections[i].id).emit('server shareSecretRole', {roles: thisRole });

      }
      */

    }

  });

  /*
    --------------------
    User confirmed ready
    --------------------
  */
  socket.on('user ready', function(user){

    if (playerResponses.responses.indexOf(user) >= 0){ return false; }
    playerResponses.responses.push(user);
    var respCount = playerResponses.responses.length;
    var userCount = userObj.users.length;
    var respRemaining = userCount - respCount;
    //console.log(respCount, userCount, respRemaining);

    // If all responses have been submitted
    if (respRemaining === 0){

      // All players ready - start the game!
      console.log('All players ready!');
      // Shuffle cards, assign presidency
      finaliseGameSetup();
      // The game state moves to nominate chancellor
      gameState = 'nominateChancellor';

      // FOR TESTING PURPOSES
      boardProgress.liberal = 2;
      boardProgress.fascist = 1;
      boardProgress.failure = 2;
      // Tell the game board to show the game board for now
      io.sockets.emit('board roundStart', boardProgress);

    }else{

      // Still waiting for more players to respond
      console.log('Player ' + user + ' is ready');
      console.log(`Still waiting for ${respRemaining} responses`);

    }

  });


  /*
    --------------------
    Player submits vote
    --------------------
  */
  socket.on('user vote', function(vote, user){
      processVote(vote, user);
  });

  /*
    ---------------------
    New feature - socket request for each player's secret role
    ---------------------
  */
  socket.on('user requestSecretRole', function(){

    console.log('User ' + socket.username + ' has requested their secret role');

    let yourSecretRole = getSecretRoleFromIndex(matchSocketToPlayerIndex(socket.username));
    console.log('Matched Secret Role for ' + socket.username + ' is ' + yourSecretRole);

    // Return the associated SECRET ROLE
    io.to(socket.id).emit('server shareSecretRole', yourSecretRole);

  });

  /*
    -------------------------
    User nominates chancellor
    -------------------------
  */
  socket.on('user nominate', function(user){

    console.log('The President has nominated ' + user + ' to be the Chancellor');
    userObj.publicRoles[1] = user;
    playerResponses.state = 'voting';
    playerResponses.responses = [];
    playerResponses.votes = [];
    // Voting begins
    io.sockets.emit('server shareNomination', userObj.publicRoles);
  });

// END io.on('connection')
});


/**
  * @desc matches a username against a playerIndex
  * @param string username - can be pulled from socket.username
  * @return int playerIndex - the matched index in the player array
*/
function matchSocketToPlayerIndex(username){

  //let playerIndex = -1;
  let playerIndex = userObj.players.indexOf(username);
  return playerIndex === -1 ? false : playerIndex;
  /*
  // Match this PLAYER
  for (let i = 0; i < userObj.players.length; i++){
    if (username === userObj.players[i]){
      playerIndex = i;
    }
  }
  if (playerIndex === -1){
    return false;
  }else{
    return playerIndex;
  }
  */
}


/**
  * @desc returns a secret role from a playerIndex
  * @param int playerIndex - the index in the player array
  * @return string secretRole - the secret role for this player
*/
function getSecretRoleFromIndex(playerIndex){
  return userObj.secretRoles[playerIndex];
}


/**
  * @desc randomises the player array and assigns roles
  * @param none - uses the userObj.users array
  * @return none - mutates global vars userObj.players and userObj.secretRoles
*/
function assignSecretRoles(){

  let userCount = userObj.users.length;
  // Randomise the players list !THIS SHOULD BE UPDATED
  userObj.players = userObj.users.slice();
  shuffle(userObj.players);
  let theseCards = cardPack.playerCards[userCount - 5];

  // Add liberals
  liberalCount = theseCards[0];
  for (let i = 0; i < liberalCount; i++){
    userObj.secretRoles[i] = 'liberal';
  }

  // Add fascists
  fascistCount = theseCards[1];
  for (let i = liberalCount; i < (liberalCount + fascistCount); i++){
    userObj.secretRoles[i] = 'fascist';
  }

  // Add Hitler - the last of the shuffled users
  userObj.secretRoles[userObj.players.length - 1] = 'hitler';

  //console.log(playerRoles);
  console.log('Players = ' + userObj.players);
  console.log('Roles = ' + userObj.secretRoles);

  gameState = 'showRole';

}

/**
  * @desc receives a vote and handles the vote system
  * @param string vote - either JA or NEIN
  * @param string user - the user who has voted
  * @return none - fires other functions as appropriate
*/
function processVote(vote, user){

  // Check if this player has already voted
  if (playerResponses.responses.indexOf(user) >= 0){ return false; }
  // If not, add this user to the list
  playerResponses.responses.push(user);
  // Also add the vote to the list
  playerResponses.votes.push(vote);
  // Show the votes (visible once a player has submitted their vote)
  io.sockets.emit('server voteReceived', vote, user);
  gameState = 'governmentVote';
  // The number of responses received
  var respCount = playerResponses.responses.length;
  // The number of votes expected - USING PLAYERS AS SOME USERS MAY BE KILLED OFF
  var userCount = userObj.players.length;
  // The number of responses still awaited
  var respRemaining = userCount - respCount;

  // If all votes have been submitted
  if (respRemaining === 0){

    // All players voted - calculate result!
    console.log('All players have voted!');
    // Admin sees all votes
    console.log(playerResponses.votes);

    // Start the counting!
    let positiveVotes = 0;
    // Threshold votes shows the majority
    let thresholdVotes = Math.ceil(userObj.players.length / 2);
    // If there are an even number of voters, add 1
    if (userCount % 2 === 0){
      thresholdVotes++;
    }

    // Count the JA votes received
    positiveVotes = playerResponses.votes.filter(function(x){ return x === "ja"; }).length;

    // If the number of votes meets the threshold, the government is elected
    if (positiveVotes >= thresholdVotes){
      //console.log('Government received ' + positiveVotes + ' out of ' + userCount + ' so government elected!');
      // Track elected pres/chancellor to exclude them from the next election!
      //io.sockets.emit('server govElected', positiveVotes);
      governmentElected(positiveVotes, userCount);
    }else{
      //console.log('Government received ' + positiveVotes + ' out of ' + userCount + ' so government fails!');
      // Increase election failure tracker
      // Move on to next president and restart round
      //io.sockets.emit('server govRejected', positiveVotes);
      governmentRejected(positiveVotes, userCount);
    }

  }else{
    console.log('Player ' + user + ' has voted ' + vote);
    console.log(`Still waiting for ${respRemaining} responses`);
  }

}

// Shuffle cards, assign president, start game
function finaliseGameSetup(){

  policyCards = shuffle(cardPack.policyCards.cards);

  // Assign the Presidency to the first player
  if (userObj.publicRoles[0] === undefined){
    // No previous president - assign to player 0
    userObj.publicRoles[0] = userObj.players[0];
    console.log('No previous president - assigning to ' + userObj.publicRoles[0]);
  }else{
    var searchingForPres = false;
    var prevPresIdx = userObj.players.indexOf(userObj.publicRoles[0]);
    while (searchingForPres){
      if (prevPresIdx >= userObj.players.length){
        // Gone past the last player - start again!
        console.log('Presidency moves to start of list');
        prevPresIdx = 0;
      }
      // Check if this index is excluded from the presidency
      if ( (userObj.players[prevPresIdx] === userObj.publicRoles[2]) || (userObj.players[prevPresIdx] === userObj.publicRoles[3]) ){
        // This player has just been pres/chan
        console.log('Player ' + userObj.players[prevPresIdx] + ' is excluded!');
        // Increment the index
        prevPresIdx++;
      }else{
        // This president should be fine!
        searchingForPres = false;
        // Assign this user the presidency!
        userObj.publicRoles[0] = userObj.players[prevPresIdx];
        //console.log('The President has now been assigned to ' + userObj.publicRoles[0]);
      }
    }

  }

  console.log('The President is now ' + userObj.publicRoles[0]);
  console.log(policyCards);
  io.sockets.emit('server roundStart', userObj.publicRoles, policyCards);
}

function governmentElected(positiveVotes, userCount){
  console.log('Government Elected with ' + positiveVotes + ' out of ' + userCount);
  // Track elected pres/chancellor to exclude them from the next election!
  userObj.publicRoles[2] = userObj.publicRoles[0];
  userObj.publicRoles[3] = userObj.publicRoles[1];
  //io.sockets.emit('server govElected', positiveVotes);

}

function governmentRejected(positiveVotes, userCount){
  console.log('Government Elected ' + positiveVotes + ' out of ' + userCount);
  // Increase election failure tracker

  // Move on to next president and restart round
  //io.sockets.emit('server govRejected', positiveVotes);
}


/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 * Link - https://stackoverflow.com/a/6274381
 */
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}


const cardPack = {};

cardPack.minPlayers = 5;
cardPack.maxPlayers = 10;

cardPack.policyCards = {};
cardPack.policyCards.liberal = 6;
cardPack.policyCards.fascist = 11;
cardPack.policyCards.cards = ['Liberal', 'Liberal', 'Liberal', 'Liberal', 'Liberal', 'Liberal', 'Fascist', 'Fascist', 'Fascist', 'Fascist', 'Fascist', 'Fascist', 'Fascist', 'Fascist', 'Fascist', 'Fascist', 'Fascist' ];

// to get, use playerCards[count - 5];
cardPack.playerCards = [];
cardPack.playerCards[0] = [3,1,1];  // 5 players
cardPack.playerCards[1] = [4,1,1];  // 6 players
cardPack.playerCards[2] = [4,2,1];  // 7 players
cardPack.playerCards[3] = [5,2,1];  // 8 players
cardPack.playerCards[4] = [5,3,1];  // 9 players
cardPack.playerCards[5] = [6,3,1];  // 10 players

const gameBoard = {};
gameBoard.liberal = {};
gameBoard.liberal.slotDescriptions = [null, null, null, null, 'Liberals win'];
gameBoard.liberal.slotActions = [null, null,  null, null, 'libsWin'];
gameBoard.fascist = {};
gameBoard.fascist.slotDescriptions = [null, null, 'The President examines the top three cards', 'The President must kill a player', 'The President must kill a player. Veto power is unlocked', 'Fascists win'];
gameBoard.fascist.slotActions = [null, null, 'presExamine', 'presKill', 'presKill', 'fascWin'];

var boardProgress = {};
boardProgress.liberal = 0;
boardProgress.fascist = 0;
boardProgress.failure = 0;
