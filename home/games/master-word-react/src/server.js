//HANDLE REQUIRES
const express = require('express');
const cors = require('cors');
const app = express();
//MAKE THE APP CORS-FRIENDLY
app.use(cors());
const http = require('http');
const server = http.createServer(app);

//CONSTANTS
const SERVERPORT = 4000;
const CLIENTPORT = 3000;
const DEFAULTPORT = 8080;

//SOCKET SERVER
const { Server } = require("socket.io");
const { isSet } = require('util/types');
const io = new Server(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST']
	}
});

var sockets = [];
var players = [];

//EXPRESS HTTP SERVER ... NOT APP!!!! (LISTEN ON THIS PORT)
server.listen(process.env.PORT || CLIENTPORT, () => {
	console.log('BACKEND Server listening on ' + (process.env.PORT || CLIENTPORT));
});

//SOCKET CONNECTION
io.on('connection', (socket) => {

	//STORE REF TO SOCKET
	sockets.push(socket.id);

	//LOG CONNECT
	console.log('#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#');
	console.log('NEW USER CONNECTED!');
	console.log('ID: ' + socket.id);
	console.log('Current count: ' + sockets.length);
	console.log('#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#');
	console.log('');
	


	//LOG UPDATE
	socket.on('player-update', (update) => {
		
		//SET NAME ON SOCKET
		socket.name = update.name;
		
		//UPDATE PLAYERS
		let player = {};
		player.id = socket.id;
		player.name = socket.name;
		players.push(player);

		//console.log(socket.id, update.method, update.name);
		console.log('#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#');
		console.log('PLAYER NAME CHANGE!');
		console.log('PLAYER ID: ' + socket.id);
		console.log('PLAYER NAME: ' + socket.name);
		console.log('Current players count: ' + players.length);
		console.log('#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#');
		console.log('');
	});

	//LOG DISCONNECT
	socket.on('disconnect', () => {

		sockets.splice(sockets.indexOf(socket.id),1);
		players = removePlayer(players, socket);

		//console.log('🔥: A user disconnected');
		console.log('#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#');
		console.log('USER DISCONNECTED!');
		console.log('ID: ' + socket.id);
		if(socket.name){
			console.log('BYE BYE ' + socket.name);
		}
		console.log('Current sockets count: ' + sockets.length);
		console.log('Current players count: ' + players.length);
		console.log('#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#');
		console.log('');
	
	});
});

function removePlayer(players, socket){
	for(let i = 0; i < players.length; i++){
		if(players[i].id === socket.id){
			players.splice(i,1);
			return players;
		}
	}

}