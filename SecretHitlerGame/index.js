
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

// Variables to hold connection list and users list
var connections = [];
var users = [];
// Player Roles list - secret roles
var playerRoles = [];
// Public Roles (president/chancellor)
var publicRoles = [];
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
  res.sendFile(__dirname + '/farisea-dark.ttf');
});
// Stylesheet for the client
app.get('/style.css', function(req, res){
  res.sendFile(__dirname + '/client/style.css');
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
// Font used by client and board
app.get('/board/farisea-dark.ttf', function(req, res){
  res.sendFile(__dirname + '/board/farisea-dark.ttf');
});
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
  for (let i = 0; i < connections.length; i++){

    //console.log('Checking Connection %s', i);
    var thisIp = connections[i].request.connection.remoteAddress;
    //console.log('Connection IP is: ' + thisIp);

    // Check if this is an existing player
    if (thisIp === clientIp){

      newConnection = false;
      // Existing user! confirm this user
      //console.log('Existing user');
      socket.username = users[i];
      connections[i] = socket;
      //users[i] = socket.username;
      console.log('Existing user matched: %s users connected', users.length);

      // Send the current game state to this user
      // On the client side, this will load the appropriate section
      if (gameState === 'nominateChancellor'){
        // The nomination section is different for different roles
        io.to(socket.id).emit('server roundStart', publicRoles, policyCards);
      }else{
        // All other game states should be directly joinable
        io.to(socket.id).emit('server rejoin', gameState);
      }

    }
  }

  if (newConnection){
    // Add this socket to the connections array
    connections.push(socket);
    console.log('New Socket Connected: %s sockets connected', connections.length);
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
    connections.splice(connections.indexOf(socket), 1);
    console.log('Socket disconnected: %s sockets connected', connections.length);

    // If so, remove this socket from the users array
    users.splice(users.indexOf(socket.username), 1);
    console.log('User disconnected: %s users connected', users.length);

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
    users.push(socket.username);
    // Then call the updateUsernames function to emit the new users array
    updateUsernames();
  });

  // Function to emit usernames to all sockets
  function updateUsernames(){
    // Push the new users array out to all users
    io.sockets.emit('server shareUsers', users);
    io.sockets.emit('board users', users);
  }

  /*
    ---------------------------
    Game started - assign roles
    ---------------------------
  */
  socket.on('user startGame', function(){
    var userCount = users.length;
    if ( (userCount < cardPack.minPlayers) || (userCount > cardPack.maxPlayers) ){
      console.log('Player count error');
      io.to(socket.id).emit('server playerCount', userCount);
      return false;
    }else{
      // Randomise the users list
      shuffle(users);
      let theseCards = cardPack.playerCards[userCount - 5];

      // Add liberals
      liberalCount = theseCards[0];
      for (let i = 0; i < liberalCount; i++){
        playerRoles[i] = 'liberal';
      }

      // Add fascists
      fascistCount = theseCards[1];
      for (let i = liberalCount; i < (liberalCount + fascistCount); i++){
        playerRoles[i] = 'fascist';
      }

      // Add Hitler - the last of the shuffled users
      playerRoles[users.length - 1] = 'hitler';

      //console.log(playerRoles);
      console.log(users);

      io.sockets.emit('server shareRoles', {roles: playerRoles, users: users});
      gameState = 'showRole';

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
    var userCount = users.length;
    var respRemaining = userCount - respCount;
    //console.log(respCount, userCount, respRemaining);
    if (respRemaining === 0){
      // All players ready - start the game!
      console.log('All players ready!');
      finaliseGameSetup();
      gameState = 'nominateChancellor';
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
    // The number of votes expected
    var userCount = users.length;
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
      let thresholdVotes = Math.ceil(users.length / 2);
      // If there are an even number of voters, add 1
      if (userCount % 2 === 0){
        thresholdVotes++;
      }

      // Count the JA votes received
      positiveVotes = playerResponses.votes.filter(function(x){ return x === "ja"; }).length;

      // If the number of votes meets the threshold, the government is elected
      if (positiveVotes >= thresholdVotes){
        console.log('Government received ' + positiveVotes + ' out of ' + userCount + ' so government elected!');
        // Track elected pres/chancellor to exclude them from the next election!
        io.sockets.emit('server govElected', positiveVotes);
      }else{
        console.log('Government received ' + positiveVotes + ' out of ' + userCount + ' so government fails!');
        // Increase election failure tracker
        // Move on to next president and restart round
        io.sockets.emit('server govRejected', positiveVotes);
      }

    }else{
      console.log('Player ' + user + ' has voted ' + vote);
      console.log(`Still waiting for ${respRemaining} responses`);
    }
  });

  /*
    -------------------------
    User nominates chancellor
    -------------------------
  */
  socket.on('user nominate', function(user){

    console.log('The President has nominated ' + user + ' to be the Chancellor');
    publicRoles[1] = user;
    playerResponses.state = 'voting';
    playerResponses.responses = [];
    playerResponses.votes = [];
    // Voting begins
    io.sockets.emit('server shareNomination', publicRoles);
  });


});


// Shuffle cards, assign president, start game
function finaliseGameSetup(){

  policyCards = shuffle(cardPack.policyCards.cards);
  // Assign the first user to President
  publicRoles.push(users[0]);
  console.log('The President is now ' + users[0]);
  console.log(policyCards);
  io.sockets.emit('server roundStart', publicRoles, policyCards);
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
