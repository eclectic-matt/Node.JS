var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 1932;


// Main express function to handle files
app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/index.html');
});

// Main socket.io function to handle connections
/*io.on('connection', function(socket){

  socket.join('gameRoom');
  console.log('A user connected: ', socket.id);
  socket.on('disconnect', function() {
    console.log('A user disconnected');
  });

});*/

io.on('connection', (socket) => {

  console.log('User connected with ID: ',socket.id);
  socket.join('gameRoom');
  socket.broadcast.to(socket.id).emit('Joined the game room', 'Joined');
  
	socket.on('disconnect', function() {
		console.log('user disconnected');
	});
});


//io.on('newPlayer');

http.listen(port, function(){
  console.log('listening on *:' + port);
});
