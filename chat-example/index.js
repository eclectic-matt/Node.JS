var express = require('express');
var socket = require('socket.io');
var port = process.env.PORT || 2428;
var myLocalIP = '192.168.0.3';

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

  connections.push(socket);
  console.log('Connected: %s sockets connected', connections.length);

  socket.on('disconnect', function(){
    connections.splice(connections.indexOf(socket), 1);
    console.log('Socket disconnected: %s sockets connected', connections.length);
    if (!socket.username) return;
    users.splice(users.indexOf(socket.username), 1);
    console.log('User disconnected: %s users connected', users.length);
  });

  socket.on('send message', function(data){

    var username = socket.username;
    io.sockets.emit('new message', {msg: data, user: username});


  });

  /*socket.on('send message', function(data){

    var username = socket.username;
    var newMessage = '<b>' + username + '</b>: ' + data;
    console.log('New message: ', newMessage);
    io.sockets.emit('new message', {msg: newMessage});
    //console.log('New message: ', data);
    //io.sockets.emit('new message', {msg: data});

  });*/

  // New user handle
  socket.on('new user', function(data, callback){
    console.log('New user added', data);
    callback(true);
    socket.username = data;
    users.push(socket.username);
    updateUsernames();
  });

  // Function to emit usernames to all sockets
  function updateUsernames(){

    io.sockets.emit('get users', users);

  }

});
