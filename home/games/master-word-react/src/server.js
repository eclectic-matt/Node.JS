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
const { handleClueInput, handlePlayerName, handleResetGame, handleSolutionInput, handleStartGame, handleThumbsInput} = require(__dirname + '/server/playerUpdates.js');

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

setInterval(alive,2000);

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

//DEFINE CONSTANTS
const PLAYER_LIMIT_MIN = 2;
const PLAYER_LIMIT_MAX = 10;
const CLUES_PER_ROUND = 4;
const SOLUTIONS_PER_GAME = 3;
const ROUND_LIMIT_MAX = 7;
const GAME_NAME = 'Master Word';
const DEFAULT_LOBBY_ID = 'AB12';
const HIDDEN_SECRET_WORD = '__________';
//STAGES
const GAME_STAGE_LOBBY = 0;		//PLAYERS JOIN
const GAME_STAGE_SEEKER = 1;	//SEEKERS GUESS
const GAME_STAGE_GUIDE = 2;		//GUIDE THUMBS/WINS
const GAME_STAGE_OVER = 3;		//GAME OVER

//-------------------
//INITIALIZE GAME
//-------------------
//THE GAME OBJECT
var game = {};

//NEW BEHEMOTH, HOLDING EVERYTHING

//GAME INFO (SET FOR GAME DURATION)
game.info = {};
game.info.name = GAME_NAME;
game.info.lobbyId = DEFAULT_LOBBY_ID;
game.info.cluesPerRound = CLUES_PER_ROUND;
game.info.solutionsPerGame = SOLUTIONS_PER_GAME;
game.info.roundLimit = ROUND_LIMIT_MAX;
//GAME STATUS (CHANGES DURING GAME)
game.status = {};
game.status.running = false;
game.status.currentRound = 1;	//SO THAT round - 1 INDEXES WORK
game.status.stage = GAME_STAGE_LOBBY;
game.status.jokerUsed = false;
game.status.solutionsUsed = 0;
//GAME SECRETS
game.secrets = {};
game.secrets.word = HIDDEN_SECRET_WORD;
game.secrets.category = 'CATEGORY';
//NEW - PLAYERS ARRAY
/*//BUILD PLAYER OBJECTS LIKE:
player = {};
player.id = 'socket-id';
player.name = undefined || 'player-name';
player.role = undefined || 'player-role';*/
game.players = [];
//STORE ROUNDS IN GAME OBJECT
game.rounds = getInitialRoundArray(ROUND_LIMIT_MAX);

//rounds = getInitialRoundArray(ROUND_LIMIT_MAX);
//INITIALIZE SERVER
//initServer();
//RUN RESET FUNCTION
reset();

//EXPRESS HTTP SERVER ... NOT APP!!!! (LISTEN ON THIS PORT)
server.listen(process.env.PORT || CLIENTPORT, () => {
	console.log('BACKEND Server listening on ' + (process.env.PORT || CLIENTPORT));
});

//SOCKET CONNECTION
io.on('connection', (socket) => {

	//INITIALIZE NAME TO SOCKET (DEFAULT ID)
	socket.name = socket.id;
	socket.role = undefined;
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
	sendServerUpdate('user connected',socket.id);

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
				serverUpdate = handleStartGame();
			break;
			case 'clueInput':
				source = 'playerClueInput';
				serverUpdate = handleClueInput(socket, update.guess);
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
				serverUpdate = handleResetGame();
			break;
		}

		//IF A FUNCTION ABOVE HAS RETURNED TRUE (SERVER UPDATE TRIGGERED)
		if(serverUpdate){

			//SEND SERVER UPDATE TO EVERYONE
			sendServerUpdate(source, undefined);
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
		sendServerUpdate('user disconnected','everyone');
	
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


function addSeeker(socket){
	socket.join('seekerRoom');
	if(!players.roles.seekers.includes(socket.name)){
		players.roles.seekers.push(socket.name);
		socket.role = 'Seeker';
	}
}

function addGuide(socket){
	socket.join('guideRoom');
	players.roles.guide = socket.name;
	socket.role = 'Guide';
}


function sendServerUpdate(source='unknown', to='everyone'){

	console.log('');
	console.log('#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#');
	console.log(`Sending server update`);
	console.log(`caused by "${source}"`);
	console.log(`to ${to}`);
	console.log('#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#');
	console.log('');

	//PREPARE A SHAREABLE OBJECT
	//let gameObj = JSON.parse(JSON.stringify(game));

	//IF SENDING TO A SINGLE USER
	if(to !== 'everyone'){
		//TO ONE SOCKET
		io.to(to).emit('server-update', game);
	}else{
		//SEND SINGLE OBJECT UPDATE TO ALL
		io.emit('server-update', game);
	}
}



//RESET GAME OBJECT BACK TO INIT STATE
function reset(){

	//RESET PER GAME VARS
	console.log('Initializing game variables');

	//GAME STATUS (CHANGES DURING GAME)
	game.status = {};
	game.status.running = false;
	game.status.currentRound = 1;	//SO THAT round - 1 INDEXES WORK
	game.status.stage = GAME_STAGE_LOBBY;
	game.status.jokerUsed = false;
	game.status.solutionsUsed = 0;
	//GAME SECRETS
	game.secrets = {};
	game.secrets.word = HIDDEN_SECRET_WORD;
	game.secrets.category = 'CATEGORY';
	//NEW - PLAYERS ARRAY
	/*//BUILD PLAYER OBJECTS LIKE:
	player = {};
	player.id = 'socket-id';
	player.name = undefined || 'player-name';
	player.role = undefined || 'player-role';*/
	game.players = [];
	//STORE ROUNDS IN GAME OBJECT
	game.rounds = getInitialRoundArray(ROUND_LIMIT_MAX);
}

function getInitialRoundArray(count){

	let arr = [];

	//ITERATE TO BUILD SAFE ROUNDS ARRAY
	for(let i = 0; i < count; i++){

		let obj = {};
		obj.clues = [];
		obj.thumbs = -1;
		obj.solutions = [];
		arr[i] = JSON.parse(JSON.stringify(obj));
	}
	return arr;
}