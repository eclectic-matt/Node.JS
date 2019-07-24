var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){

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

});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
