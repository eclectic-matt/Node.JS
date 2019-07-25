var app = require('express')();
var http = require('http').createServer(app);
//var io = require('socket.io')(http);
var io = require('socket.io').listen(http);
var port = process.env.PORT || 3000;

var connections = [];
var users = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){

  connections.push(socket);
  console.log('Connected: %s sockets connected', connections.length);

  socket.on('disconnect', function(){

    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected: %s sockets connected', connections.length);

  });

  socket.on('send message', function(data){

    console.log('New message: ', data);
    io.sockets.emit('new message', {msg: data});

  });


});

/*io.on('connection', function(socket){

  //socket.broadcast.emit('Hi new user!');
  //console.log('Hi there, new user!');
  //io.emit('chat message', 'Hi there, new user!');

  socket.on('chat message', function(msg){

    io.emit('chat message', msg);
    console.log('Message: ' + msg);

  });

  socket.on('disconnect', function(){

    io.emit('chat message', 'Bye user!');
    console.log('Logging: Bye user!');

  });

});*/

http.listen(port, function(){
  console.log('listening on *:' + port);
});
