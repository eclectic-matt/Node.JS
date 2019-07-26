// Using an express app to handle routing/file serving
var express = require('express');
// Using socket to handle bi-direct real-time comm
var socket = require('socket.io');
// The port to be used for this
var port = process.env.PORT || 2428;
  // Hard-coded the local IP for convenience/fewer modules required
  //var myLocalIP = '192.168.0.3';
// Use npm install ip
// https://github.com/indutny/node-ip
var ip = require('ip');
var myLocalIP = ip.address();


// Variables to hold connection list and users list
var connections = [];
var users = [];

// App setup
var app = express();
var server = app.listen(port, myLocalIP, function(){
    console.log(`listening for requests on port ${port}`);
});

// Static files
app.use(express.static('/'));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
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

});
