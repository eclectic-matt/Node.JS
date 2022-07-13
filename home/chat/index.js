const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

//THE ARRAY OF USERS
var users = [];

io.on('connection', (socket) => {

	console.log('user ID:' + socket.id + ' connected');

	console.log(socket.conn.remoteAddress);

	if (users.includes(socket.id)){
		//REJOIN
		console.log('Existing user with ID ' + socket.id + ' REconnected');
	}else{
		//ADD
		users.push(socket.id);
		console.log('New user with ID ' + socket.id + ' connected');
		console.log('USERS: ',users);
	}
	
	socket.on('chat message', (msg) => {
		msg = 'User ' + socket.id + ' says: ' + msg;
		io.emit('chat message', msg);
	});

	socket.on('disconnect', () => {
		console.log('user disconnected');
		//REMOVE USER FROM USERS ARRAY
		const userIndex = users.indexOf(socket.id);
		if(userIndex !== false){
			users.splice(userIndex, 1);
		}
		console.log('USERS: ',users);
	});
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
