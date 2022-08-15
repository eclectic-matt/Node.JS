//EXPRESS (ROUTING)
const express = require('express');
const app = express();
//HTTP AND SERVER (RESPOND)
const http = require('http');
const server = http.createServer(app);
//DEFINE SOCKET AND INSTANCE (IO) SERVER
const { Server } = require("socket.io");
const io = new Server(server);
//CRYPTO FOR GENERATING LOBBY IDs
const crypto = require('crypto');
//FILE SYSTEM FOR READING THE WORD LIST
const fs = require('fs');
//JOIN - NOPE, NOT NEEDED
//const { join } = require('path');

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
// ROUTING (EXPRESS)
//#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#
//INIT - SHOW GAMES LIST
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/gamesList.html');
	//https://stackoverflow.com/questions/6458083/get-the-clients-ip-address-in-socket-io
	//https://stackoverflow.com/questions/10275667/socket-io-connected-user-count
	console.log('Connection to: ' + req.connection.localAddress);
});

//GAME: HTML
app.get('/game.html(/game/:game/id/:id)?', (req, res) => {
	//PASS TO LOBBY, PARAMS SET UP
	res.sendFile(__dirname + '/client/game.html');
});
//GAME: CSS
app.get('/player.css', (req, res) => {
	res.sendFile(__dirname + '/client/player.css');
});
//GAME: JS
app.get('/player.js', (req, res) => {
	res.sendFile(__dirname + '/client/player.js');
});

//DISPLAY: HTML
app.get('/display.html', (req, res) => {
	res.sendFile(__dirname + '/client/display.html');
});
//DISPLAY: JS
app.get('/display.js', (req, res) => {
	res.sendFile(__dirname + '/client/display.js');
});
//DISPLAY: CSS
app.get('/display.css', (req, res) => {
	res.sendFile(__dirname + '/client/display.css');
});

app.get('/mickey.png', (req, res) => {
	res.sendFile(__dirname + '/client/mickey.png');
});


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

//THE GAME OBJECT
var game = {};
//GAME INFO
game.info = {};
game.info.name = GAME_NAME;
game.info.lobbyId = DEFAULT_LOBBY_ID;
game.info.cluesPerRound = CLUES_PER_ROUND;
game.info.solutionsPerGame = SOLUTIONS_PER_GAME;
game.info.roundLimit = ROUND_LIMIT_MAX;
//GAME STATUS
game.status = {};
game.status.running = false;
game.status.currentRound = 1;	//SO THAT round - 1 INDEXES WORK
game.status.stage = GAME_STAGE_LOBBY;
//GAME SECRETS
game.secrets = {};
game.secrets.word = HIDDEN_SECRET_WORD;
game.secrets.category = 'CATEGORY';

//NEW - PLAYERS OBJECT
players = {};
players.sockets = [];
players.roles = {};
	players.roles.guide = undefined;
	players.roles.seekers = [];
//AND A GET PLAYER NAMES FUNCTION
players.getPlayerNamesArray = function(){
	let arrNames = [];
	for(let i = 0; i < this.sockets.length; i++){
		let player = {};
		player.id = this.sockets[i].id;
		player.name = this.sockets[i].name;
		arrNames.push(player);
	}
	return arrNames;
}

//NEW - ROUNDS ARRAY
rounds = getInitialRoundArray(ROUND_LIMIT_MAX);

//-----

//INITIALIZE SERVER
//initServer();

//RUN RESET FUNCTION
reset();


//RESET GAME OBJECT BACK TO INIT STATE
function reset(){

	//RESET PER GAME VARS
	console.log('Initializing game variables');

	rounds = getInitialRoundArray(ROUND_LIMIT_MAX);
	
	//CLEAR ROLES
	players.roles = {};
	players.roles.guide = undefined;
	players.roles.seekers = [];

	game.status.running = false;
	game.status.stage = GAME_STAGE_LOBBY;

	game.jokerUsed = false;
	game.solutionsUsed = 0;

	game.secrets = {};
	game.secrets.word = HIDDEN_SECRET_WORD;
	game.secrets.category = 'CATEGORY';
}


//https://socket.io/get-started/chat
//https://socket.io/docs/v3/emit-cheatsheet/

//https://expressjs.com/en/guide/routing.html
//#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#
// CONNECTIONS (SOCKET.IO)
//#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#
//ON CONNECTION (BEFORE SETTING NAME)
io.on('connection', (socket) => {

	//#-#-#-#-#-#-#-#-#-#-#-#-#
	// INITIALIZE
	//#-#-#-#-#-#-#-#-#-#-#-#-#

	//INITIALIZE NAME TO SOCKET (DEFAULT ID)
	socket.name = socket.id;
	socket.role = '';
	players.sockets.push(socket);

	//COUNT OF CONNECTED
	if(socket.client.conn.server.clientsCount === 1){
		
		//#-#-#-#-#-#-#-#-#-#-#-#-#
		// NEW LOBBY CREATED
		//#-#-#-#-#-#-#-#-#-#-#-#-#

		//GENERATE SOME RANDOM BYTES FOR THE LOBBY ID
		crypto.randomBytes(2, (err, buffer) => {

			//GENERATE BYTES AS HEX STRING, UPPER CASE
			game.info.lobbyId = buffer.toString('hex').toUpperCase();
			//LOG THE LOBBY ID
			console.log('New Lobby ID generated: ' + game.info.lobbyId);
			//EMIT TO PLAYERS
			sendServerUpdate('lobbyGenerated');
			//JOIN THE ROOM WITH lobbyId
			socket.join(game.info.lobbyId);
		});
	}else{
		console.log('Player Joined with ID:' + socket.id);
		console.log('Players IDs: ',players.sockets.map(x => x.id).join(', '));
		console.log('Players Names: ',players.sockets.map(x => x.name).join(', '));
	
		//JOIN THE ROOM WITH lobbyId
		socket.join(game.info.lobbyId);
	}

	//#-#-#-#-#-#-#-#-#-#-#-#-#
	// PLAYER JOINED
	//#-#-#-#-#-#-#-#-#-#-#-#-#
	sendServerUpdate('playerJoined');

	//#-#-#-#-#-#-#-#-#-#-#-#-#
	// PLAYER INPUT
	//#-#-#-#-#-#-#-#-#-#-#-#-#
	socket.on('player-update', (update) => {

		let source = null;
		//DOES THIS TRIGGER A SERVER CHANGE?
		let serverUpdate = false;
		switch(update.method){
			case 'playerName':
				source = 'playerNameSet';
				serverUpdate = handlePlayerName(socket, update.name);
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
			sendServerUpdate(source);
		}
	});


	//#-#-#-#-#-#-#-#-#-#-#-#-#
	// DISPLAY: REMOVE FROM PLAYERS
	//#-#-#-#-#-#-#-#-#-#-#-#-#
	socket.on('display-connected', (ip) => {
		console.log('Display Connected at ',ip);
		socket.join('displayRoom');
		socket.name = 'DISPLAY_' + socket.id;
		players.sockets = removeSocket(players.sockets, socket.id);
		sendServerUpdate('displayConnected',socket.name);
	});
	//#-#-#-#-#-#-#-#-#-#-#-#-#
	// PLAYER INPUT: DISCONNECT
	//#-#-#-#-#-#-#-#-#-#-#-#-#
	socket.on('disconnect', () => {

		console.log('Player ' + socket.name + ' disconnected');
		//REMOVE USER FROM USERS ARRAY (NOTE: NO EFFECT IF DISPLAY)
		players.sockets = removeSocket(players.sockets, socket.id);
		sendServerUpdate('playerRemoved',socket.id);
		console.log('Remaining Player Count: ',players.sockets.length);
		console.log('Remaining Players: ',players.sockets.map(x => x.id).join(', '));
		if(players.sockets.length === 0){
			reset();
			sendServerUpdate('noPlayersRemaining');
		}
	});
});

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

//#-#-#-#-#-#-#-#-#-#-#-#-#
// INITIALIZE SERVER
//#-#-#-#-#-#-#-#-#-#-#-#-#
var port = 3000;
server.listen(port, () => {

	//GET LOCAL IP ADDRESS
	var os = require('os');
	var networkInterfaces = os.networkInterfaces();
	let wifi = networkInterfaces.WiFi;
	//ITERATE WIFI INTERFACES
	for(let i = 0; i < wifi.length; i++){
		//UNTIL YOU FIND ONE WITH IPv4
		if(wifi[i].family === 'IPv4'){
			//THEN OUTPUT TO THE CONSOLE
			console.log('listening on: ');
			console.log(wifi[i].address + ':' + port + '/game.html');
		}
	}
});


/**
 * The new single server update - sends all objects to ensure joining players in sync.
 */
function sendServerUpdate(source='unknown'){
	console.log('sending server update',source);
	//let p = players.getPlayerNamesArray();
	//let r = players.roles;
	io.emit('server-update', game, p, r, rounds);
	//console.log(rounds);
	//PREPARE A SHAREABLE OBJECT
	let shareObj = {};
	//GET COPY OF GAME
	let gameObj = JSON.parse(JSON.stringify(game));
	//STORE GAME OBJECT IN SHARE OBJECT
	shareObj.game = gameObj;
	//STORE PLAYERS IN THE SHARE OBJECT (INCL. ROLES?)
	shareObj.players = {};
	shareObj.players.names = getPlayerNamesArray(players);
	shareObj.players.roles = players.roles;
	//STORE ROUNDS IN THE SHARE OBJECT
	shareObj.rounds = JSON.parse(JSON.stringify(rounds));
	//SEND SINGLE OBJECT UPDATE
	io.emit('server-update', shareObj);
}

///-----------------------------------------
/// NEW HANDLER FUNCTIONS (RETURN FALSE IF 
/// NO SERVER UPDATE, TRUE TO EMIT UPDATE)
///-----------------------------------------


function handleResetGame(){
	reset();
	return true;
}

/**
 * 
 * @param {The socket requesting a name change} socket 
 * @param {*} name 
 * @returns 
 */
function handlePlayerName(socket, name){

	//GET PREV ID
	let prevId = socket.name;

	//NO CHANGE?
	if(prevId === name){
		console.log('no name change, ignored',name);
		return false;
	}

	//SET THE NAME ON THE SOCKET
	socket.name = name;

	console.log(prevId,'has been renamed to',socket.name);
	console.log('Players IDs: ',players.sockets.map(x => x.id).join(', '));
	console.log('Players Names: ',players.sockets.map(x => x.name).join(', '));

	//IF GAME IS RUNNING
	if(game.status.running){
		//ASSIGN AS SEEKER AND ADD TO PLAYERS
		addSeeker(socket);
		//updateRole()
	}//ELSE, WILL GET ADDED ONCE RUNNING

	return true;
}

function handleStartGame(){
	
	//IF GAME ALREADY RUNNING, IGNORE
	if(game.status.running){
		return false;
	}

	//CHECK PLAYER LIMITS (ONCE OUT OF TESTING)
	//if(players.sockets.length < PLAYER_COUNT_MIN etc)

	//START RUNNING
	game.status.running = true;
	game.status.currentRound = 1;
	game.status.stage = GAME_STAGE_SEEKER;

	players.roles = {};
	players.roles.guide = null;
	players.roles.seekers = [];

	//ASSIGN A RANDOM GUIDE
	let guideIndex = Math.floor(Math.random() * players.sockets.length);

	//NOW ROLES ASSIGNED, ADD SOCKETS TO ROOMS
	for(let i = 0; i < players.sockets.length; i++){
		if(i === guideIndex){
			addGuide(players.sockets[i]);
		}else{
			addSeeker(players.sockets[i]);
		}
	}

	console.log('ROLES ASSIGNED', players.roles);

	//SET UP KEY VARIABLES FOR THIS GAME
	game.secrets.word = '';
	game.secrets.category = '';
	
	rounds = getInitialRoundArray(ROUND_LIMIT_MAX);

	//GET THE WORD LIST
	fs.readFile('../../words/wordlist.json', 'utf8', (err, data) => {

		if (err) {
			console.error(err);
			return false;
		}
		
		//PARSE THE JSON
		let allWords = JSON.parse(data);

		//GET THE CATEGORIES
		let categories = allWords.categories;

		//PICK A CATEGORY
		let catTitles = Object.keys(categories);
		let categoryIndex = Math.floor(Math.random() * catTitles.length);
		//SET THE CATEGORY
		let thisCategory = categories[catTitles[categoryIndex]];
		let theCategoryTitle = categories[catTitles[categoryIndex]].title;

		//PICK A WORD IN THIS CATEGORY
		let thisList = thisCategory.list;
		let wordIndex = Math.floor(Math.random() * thisList.length);
		//SET THE WORD
		theWord = thisList[wordIndex];

		console.log('The category is:',theCategoryTitle);
		console.log('The word is:',theWord);

		game.secrets.word = theWord;
		game.secrets.category = theCategoryTitle;
		console.log('setup complete!');
		//TRIGGER UPDATE HERE (THE ASYNC BREAKS THE RETURN?)
		sendServerUpdate('setupGameComplete');
		return true;
	});
}

function handleClueInput(socket, guess){

	//CHECK STATUS
	if(!game.status.running){
		return false;
	}

	//CHECK SEEKER SUBMITTED
	if(!players.roles.seekers.includes(socket.name)){
		return false;
	}

	//GET CONVENIENCE VARIABLE FOR THIS ROUND CLUES
	let currentClues = rounds[game.status.currentRound - 1].clues;

	//CHECK MAX CLUES SUBMITTED
	if(currentClues.length === CLUES_PER_ROUND){
		return false;
	}

	//ADD TO ARRAY OF CLUES
	currentClues.push(guess);

	//IF WE HAVE RECEIVED ENOUGH CLUES FOR THE ROUND
	if(currentClues.length === CLUES_PER_ROUND){
		game.status.stage = GAME_STAGE_GUIDE;
	}

	return true;
}

function handleSolutionInput(socket, guess){

	//CHECK STATUS
	if(!game.status.running){
		return false;
	}

	//CHECK SEEKER SUBMITTED
	if(!players.roles.seekers.includes(socket.name)){
		return false;
	}

	//CHECK MAX SOLUTIONS USED (ON GAME OBJECT FOR CONVENIENCE)
	if(game.solutionsUsed === SOLUTIONS_PER_GAME){
		return false;
	}

	//PUSH SOLUTION TO THIS ROUND (SHOWS UP FOR GUIDE INPUT)
	rounds[game.currentRound - 1].solutions.push(guess);

	return true;
}

function handleThumbsInput(socket, update){

	//CHECK STATUS
	if(!game.status.running){
		return false;
	}

	//CHECK GUIDE SUBMITTED
	if(!players.roles.guide == socket.name){
		return false;
	}

	//CHECK THUMBS ALREADY SUBMITTED?
	if(rounds[game.currentRound - 1].thumbs !== -1){

		console.log('Thumbs for round ' + game.currentRound + ' already submitted!');
		return false;
	}
	
	rounds[game.currentRound - 1].thumbs = update.thumbs;

	//IF A JOKER SUPPLIED
	if(update.joker > 0){
		if(!game.jokerUsed){
			game.jokerUsed = true;
			rounds[game.currentRound - 1].clues[update.Joker - 1] += ' (JOKER)';
		}
	}

	console.log('Round ' + game.currentRound + ' thumbs submitted! (' + thumbs + ')');
	//UPDATE CURRENT ROUND
	game.currentRound += 1;

	return true;
}