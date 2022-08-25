//HANDLE REQUIRES
const express = require('express');
const cors = require('cors');
const app = express();
//MAKE THE APP CORS-FRIENDLY
app.use(cors());
const http = require('http');
const server = http.createServer(app);
//const { isSet } = require('util/types');	//AUTO INCLUDED WHEN I WROTE A TYPO!?!

//IMPORT PLAYER UPDATE HANDLERS
const { 
	handleClueInput, handlePlayerName, handleResetGame, handleSolutionInput, 
	handleStartGame, handleThumbsInput, getInitialRoundArray, sendServerUpdate, reset
} = require(__dirname + '/server/playerUpdates.js');

//CONSTANTS
const SERVERPORT = 4000;
const CLIENTPORT = 3000;
const DEFAULTPORT = 8080;

//SOCKET SERVER
const { Server } = require("socket.io");
const { send } = require('process');

const io = new Server(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST']
	}
});

//setInterval(alive,2000);

function alive(){
	let stage = 'Lobby';
	switch(game.status.stage){
		case GAME_STAGE_SEEKER:
			stage = 'Seekers Guess';
		break;
		case GAME_STAGE_GUIDE:
			stage = 'Guide Thumbs';
		break;
		case GAME_STAGE_OVER:
			stage = 'Over';
		break;
	}
	console.log('The current game state is:',stage,'at',new Date());
}



//#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#
// INITIALIZE
//#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#
const {
	PLAYER_LIMIT_MIN, PLAYER_LIMIT_MAX, CLUES_PER_ROUND, SOLUTIONS_PER_GAME,
	ROUND_LIMIT_MAX, GAME_NAME, DEFAULT_LOBBY_ID, HIDDEN_SECRET_WORD,
	GAME_STAGE_LOBBY, GAME_STAGE_SEEKER, GAME_STAGE_GUIDE, GAME_STAGE_OVER
} = require(__dirname + '/constants.js');

//-------------------
//INITIALIZE GAME
//-------------------
//THE GAME OBJECT
var game = {};
//INITIALIZE SERVER
//initServer();
//RUN RESET FUNCTION
handleResetGame(game);
sendServerUpdate(io, game, 'game reset', 'everyone');

//EXPRESS HTTP SERVER ... NOT APP!!!! (LISTEN ON THIS PORT)
server.listen(process.env.PORT || CLIENTPORT, () => {
	console.log('BACKEND Server listening on ' + (process.env.PORT || CLIENTPORT));
});

//SOCKET CONNECTION
io.on('connection', (socket) => {

	//INITIALIZE NAME TO SOCKET (DEFAULT ID)
	socket.name = socket.id;
	socket.role = undefined;
	socket.nameSet = false;
	//NEW - PUSH TO PLAYERS, RENAME PLAYER ID, OR DO NOTHING?
	//handleSocketJoin(socket, game);
	//CREATE SHARE-SAFE PLAYER OBJECT TO STORE
	game.players.push(getPlayerObject(socket));

	//LOG CONNECT
	console.log('');
	console.log('#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#');
	console.log('NEW USER CONNECTED!');
	console.log('ID: ' + socket.id);
	console.log('Current count: ' + game.players.length);
	console.log('#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#');
	console.log('');
	
	//SEND GAME STATE TO THIS PLAYER
	sendServerUpdate(io, game, 'user connected',socket.id);

	//LOG UPDATE
	socket.on('player-update', (update) => {

		let source = null;
		//DOES THIS TRIGGER A SERVER CHANGE?
		let serverUpdate = false;
		//console.log('player-update',update.method);
		switch(update.method){
			case 'playerName':
				source = 'playerNameSet';
				serverUpdate = handlePlayerName(game, socket, update.name);
			break;
			case 'startGame':
				source = 'playerStartGame';
				serverUpdate = handleStartGame(game, io);
			break;
			case 'clueInput':
				source = 'playerClueInput';
				serverUpdate = handleClueInput(game, socket, update.guess);
			break;
			case 'solutionInput':
				source = 'playerSolutionInput';
				serverUpdate = handleSolutionInput(socket, update.guess);
			break;
			case 'thumbsInput':
				source = 'playerThumbsInput';
				serverUpdate = handleThumbsInput(socket, update);
			break;
			case 'resetGame':
				source = 'playerResetGame';
				serverUpdate = handleResetGame(game);
			break;
		}

		//IF A FUNCTION ABOVE HAS RETURNED TRUE (SERVER UPDATE TRIGGERED)
		if(serverUpdate){

			//SEND SERVER UPDATE TO EVERYONE
			sendServerUpdate(io, game, source, undefined);
		}
	});

	//LOG DISCONNECT
	socket.on('disconnect', () => {

		//REMOVE PLAYER BY ID
		game.players = removePlayer(game.players, socket);
		console.log('#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#');
		console.log('USER DISCONNECTED!');
		console.log('ID: ' + socket.id);
		console.log('BYE BYE ' + socket.name);
		console.log('Current players count: ' + game.players.length);
		console.log('#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#');
		console.log('');
		//SEND SERVER UPDATE
		sendServerUpdate(io, game, 'user disconnected','everyone');
	
	});
});

function getPlayerObject(socket){
	let player = {};
	player.id = socket.id;
	player.name = socket.name;
	player.role = socket.role;
	return player;
}

function removePlayer(players, socket){
	for(let i = 0; i < players.length; i++){
		if(players[i].id === socket.id){
			players.splice(i,1);
			return players;
		}
	}
}

//REMOVE SOCKET WITH ID FROM A SOCKETS ARRAY
function removeSocket(sockets, id){
	let userIndex = false;
	for(let i = 0; i < sockets.length; i++){
		if(sockets[i].id === id){
			userIndex = i;
		}
	}
	if(userIndex !== false){
		sockets.splice(userIndex, 1);
	}
	return sockets;
}