
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
var gameState = 'init';
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

// Static files
app.use(express.static('/'));
// No path, serve index.html
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
// Client JS functions
app.get('/client.js', function(req, res){
  res.sendFile(__dirname + '/client.js');
});
// Font used in file
app.get('/farisea-dark.ttf', function(req, res){
  res.sendFile(__dirname + '/farisea-dark.ttf');
});

// Socket setup & pass server
var io = socket(server);
io.on('connection', (socket) => {

  // Add this socket to the connections array
  connections.push(socket);
  console.log('Connected: %s sockets connected', connections.length);

  // Socket Disconnected
  socket.on('disconnect', function(){
    // Remove this socket from the connections array
    connections.splice(connections.indexOf(socket), 1);
    console.log('Socket disconnected: %s sockets connected', connections.length);
    // Check if this socket had assigned username
    if (!socket.username) return;
    // If so, remove this socket from the users array
    users.splice(users.indexOf(socket.username), 1);
    console.log('User disconnected: %s users connected', users.length);
  });

  // Message received from socket
  socket.on('send message', function(data){
    // Check the username received
    var username = socket.username;
    // Emit this message to all sockets
    io.sockets.emit('new message', {msg: data, user: username});

  });

  // New user handle
  socket.on('new user', function(data, callback){
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
    // Push the new users array out to
    io.sockets.emit('get users', users);
  }

  // Game start button clicked - Assign roles!
  socket.on('start game', function(){
    var userCount = users.length;
    if ( (userCount < cardPack.minPlayers) || (userCount > cardPack.maxPlayers) ){
      console.log('Player count error');
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

      io.sockets.emit('player roles', {roles: playerRoles, users: users});

    }
  });

  // Submitting that player is ready
  socket.on('player ready', function(user){
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
    }else{
      console.log('Player ' + user + ' is ready');
      console.log(`Still waiting for ${respRemaining} responses`);
    }
  });

  // Submitting a player's vote
  socket.on('player vote', function(vote, user){
    // Check if this player has already voted
    if (playerResponses.responses.indexOf(user) >= 0){ return false; }
    // If not, add this user to the list
    playerResponses.responses.push(user);
    playerResponses.votes.push(vote);
    io.sockets.emit('vote received', vote, user);
    var respCount = playerResponses.responses.length;
    var userCount = users.length;
    var respRemaining = userCount - respCount;
    //console.log(respCount, userCount, respRemaining);
    if (respRemaining === 0){
      // All players ready - start the game!
      console.log('All players have voted!');
      console.log(playerResponses.votes);
      let positiveVotes = 0;
      // NEED TO EDIT!!!
      // This should be a MAJORITY - not just 50%
      let thresholdVotes = Math.ceil(users.length / 2);
      for (let i = 0; i < userCount; i++){
        if (playerResponses.votes[i] === 'ja'){
          positiveVotes++;
        }
      }
      if (positiveVotes >= thresholdVotes){
        console.log('Government received ' + positiveVotes + ' out of ' + userCount + ' so government elected!');
        // Track elected pres/chancellor to exclude them from the next election!
        io.sockets.emit('government elected', positiveVotes);
      }else{
        console.log('Government received ' + positiveVotes + ' out of ' + userCount + ' so government fails!');
        // Increase election failure tracker
        // Move on to next president and restart round
        io.sockets.emit('government fails', positiveVotes);
      }

    }else{
      console.log('Player ' + user + ' has voted ' + vote);
      console.log(`Still waiting for ${respRemaining} responses`);
    }
  });

  socket.on('nominate chancellor', function(user){
    console.log('The President has nominated ' + user + ' to be the Chancellor');
    publicRoles[1] = user;
    playerResponses.state = 'voting';
    playerResponses.responses = [];
    playerResponses.votes = [];
    // Voting begins
    io.sockets.emit('government vote', publicRoles);
  });


});


// Shuffle cards, assign president, start game
function finaliseGameSetup(){
  policyCards = shuffle(cardPack.policyCards.cards);
  // Assign the first user to President
  publicRoles.push(users[0]);
  console.log('The President is now ' + users[0]);
  console.log(policyCards);
  io.sockets.emit('round begin', publicRoles, policyCards);
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
