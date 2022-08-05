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


//CONSTANTS
const GAME_STAGE_LOBBY = 0;		//PLAYERS JOIN
const GAME_STAGE_SEEKER = 1;	//SEEKERS GUESS
const GAME_STAGE_GUIDE = 2;		//GUIDE THUMBS/WINS
const GAME_STAGE_OVER = 3;		//GAME OVER
const HIDDEN_SECRET_WORD = '__________';


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

//THE GAME OBJECT
var game = {};
//EXAMPLE

//FIXED (FOR ALL GAMES)
game.info = {};
	game.info.name = 'Master Word';
	game.info.lobbyId = 'A1B2';
game.limits = {};
	game.limits.playerLimits = {};
		game.limits.playerLimits.min = 2;
		game.limits.playerLimits.max = 10;
	game.limits.cardLimits = {};
		game.limits.cardLimits.guessesPerRound = 4;
		game.limits.cardLimits.cluesPerGame = 3;

//PERSISTENT (BETWEEN GAMES)
game.stats = {};
	game.stats.plays = 0;
	game.stats.wins = 0;
	game.stats.losses = 0;
game.players = [];

//RESET (CLEARED EACH GAME)
game.rounds = {};
	game.rounds = [];
game.roles = {};
	game.roles.guide = undefined;
	game.roles.seekers = [];
	//game.roles.observers = [];	//TO BE ADDED INTO THE NEXT GAME?
game.status = {};
	game.status.running = false;
	game.status.currentRound = 0;
	game.status.stage = GAME_STAGE_LOBBY;
game.secrets = {};
	game.secrets.word = HIDDEN_SECRET_WORD;
	game.secrets.category = 'CATEGORY';

//INITIALIZE SERVER
initServer();

//RUN RESET FUNCTION
reset();


//io.emit('game-update',game.rounds, getPlayerNamesArray(game.players));

/*class Game{
	__constructor(){
		this.lobby = null;
		this.players = [];
		this.roles = {};
		this.running = false;
		this.stage = GAME_STAGE_LOBBY;
	}

	getPlayerNamesArray(){
		return this.players.map(function(val, index, arr){
			arr.push(val.name);
		});
	}
}*/

function initServer(){

	//RESET PERSISTENT
	game.stats = {};
	game.stats.plays = 0;
	game.stats.wins = 0;
	game.stats.losses = 0;
}


//RESET GAME OBJECT BACK TO INIT STATE
function reset(){

	//RESET PER GAME VARS
	console.log('Initializing game variables');

	game.rounds = [];
	
	//CLEAR ROLES
	game.roles = {};
	game.roles.guide = undefined;
	game.roles.seekers = [];

	game.status.running = false;
	game.status.stage = GAME_STAGE_LOBBY;

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

	//COUNT OF CONNECTED
	if(socket.client.conn.server.clientsCount === 1){

		//NO OTHER PLAYERS - PROMOTE TO ADMIN!
		//game.admin = socket;
		//console.log('Admin Joined with ID:' + socket.id);
		
		//DEFAULT LOBBY ID
		let lobbyId = 'A1B2';

		//GENERATE SOME RANDOM BYTES FOR THE LOBBY ID
		crypto.randomBytes(2, (err, buffer) => {

			//GENERATE BYTES AS HEX STRING, UPPER CASE
			game.info.lobbyId = buffer.toString('hex').toUpperCase();
			//LOG THE LOBBY ID
			console.log('New Lobby ID generated: ' + game.info.lobbyId);
			//EMIT TO PLAYERS
			io.emit('new-lobby', game.info.lobbyId);
			//JOIN THE ROOM WITH lobbyId
			socket.join(game.info.lobbyId);
		});
	}else{
		console.log('Player Joined with ID:' + socket.id);
		//JOIN THE ROOM WITH lobbyId
		socket.join(game.info.lobbyId);
	}

	//ALWAYS ADD ALL PLAYERS TO THE GAME.PLAYERS ARRAY
	game.players.push(socket);

	//#-#-#-#-#-#-#-#-#-#-#-#-#
	// EMIT: PLAYER NAMES (OR IDS)
	//#-#-#-#-#-#-#-#-#-#-#-#-#
	io.emit('player-join', getPlayerNamesArray(game.players));

	//#-#-#-#-#-#-#-#-#-#-#-#-#
	// EMIT: AVAILABLE GAMES (NOT USED)
	//#-#-#-#-#-#-#-#-#-#-#-#-#
	//io.emit('games-available', gamesAvailable);

	//#-#-#-#-#-#-#-#-#-#-#-#-#
	// PLAYER INPUT: SET NAME
	//#-#-#-#-#-#-#-#-#-#-#-#-#
	socket.on('player-add', (name) => {

		let prevId = socket.name;

		//SET THE NAME ON THE SOCKET
		socket.name = name;

		console.log(prevId,'has been renamed to',socket.name);

		if(game.status.running){
			//ASSIGN AS SEEKER AND ADD TO PLAYERS
			addSeeker(socket);
			//socket.emit('setup-game',game.setupObject);
			//io.to(socket).emit('setup-game',game.setupObject);
			io.to(socket.id).emit('setup-game',game.setupObject);
			io.emit('game-update', game.status, game.roles, playersArray, game.rounds);

		}

		//#-#-#-#-#-#-#-#-#-#-#-#-#
		// EMIT: PLAYER NAMES
		//#-#-#-#-#-#-#-#-#-#-#-#-#
		io.emit('player-join', getPlayerNamesArray(game.players));

		//LOG THE PLAYERS
		//console.log('Players: ', getPlayerNamesArray(game.players));
	});

	//#-#-#-#-#-#-#-#-#-#-#-#-#
	// PLAYER INPUT: START GAME
	//#-#-#-#-#-#-#-#-#-#-#-#-#
	socket.on('start-game', () => {

		//BUILD ROLES OBJECT (PUBLIC, EMITTED)
		game.roles = {};
		game.roles.guide = null;
		game.roles.seekers = [];
		//ADMIN STARTS GAME
			//	:ASSIGNMENTS:
			//	-> ASSIGN GUIDE
			//	-> REST ARE SEEKERS
		
		//ASSIGN A RANDOM GUIDE
		let guideIndex = Math.floor(Math.random() * game.players.length);
		
		//GET THE SOCKET ID
		console.log('GUIDE ASSIGNED TO',game.players[guideIndex].name);

		//NOW ROLES ASSIGNED, ADD SOCKETS TO ROOMS
		for(let i = 0; i < game.players.length; i++){
			if(i === guideIndex){
				addGuide(game.players[i]);
			}else{
				addSeeker(game.players[i]);
			}
		}

		//#-#-#-#-#-#-#-#-#-#-#-#-#
		// EMIT: ROLES
		//#-#-#-#-#-#-#-#-#-#-#-#-#
		io.emit('assign-roles', game.roles);

		console.log(game.roles);

		//ROLES ASSIGNED - ANY LATE PLAYER-JOINS ARE SEEKERS
		game.running = true;

		//SET UP KEY VARIABLES FOR THIS GAME
		let theWord = '';
		let theCategory = '';

		//LEAVING THIS LINE IN HERE - THIS APPARENTLY FILLS THE ARRAY WITH DUPLICATE OBJECTS (SHALLOW COPY!)
		//game.rounds = Array(7).fill({"clues":[],"thumbs":-1});

		//REPLACEMENT LINE WHICH DEEP COPIES THE "FILL" OBJECT AT INSTANTIATION
		//game.rounds = Array(7).fill(JSON.parse(JSON.stringify({"clues":[],"thumbs":-1})));

		game.rounds = [];
		game.currentRound = 1;

		//MAKE AN OBJECT TO TRANSMIT GAME INFO
		let setupObject = {};
		//THE MAX NUMBER OF ROUNDS
		setupObject.roundCount = 7;
		//THE MAX NUMBER OF SOLUTIONS
		setupObject.solutionCardCount = 3;
		//THE NUMBER OF SEEKERS IN THIS GAME
		setupObject.seekerCount = game.roles.seekers.length;
		//THE NUMBER OF CLUES REQUIRED PER ROUND
		setupObject.cluesPerRound = Math.max(4, setupObject.seekerCount);
		//THE CURRENT ROUND
		setupObject.currentRound = game.currentRound;

		game.rounds = getInitialRoundArray(setupObject.roundCount);

		//THE ROUNDS (CLUES, THUMBS)
		setupObject.rounds = game.rounds;

			//	:GAME SETUP:
		//	-> SELECT HINT/MASTER WORD FROM CATEGORIES
		//	-> CONFIRM CLUE CARD COUNTS (6 EACH) = THUMB TOKEN COUNT
		//	-> CONFIRM SOLUTION CARD COUNTS (3 TOTAL)

		//GET THE WORD LIST
		fs.readFile('../../words/wordlist.json', 'utf8', (err, data) => {

			if (err) {
				console.error(err);
				return;
			}
			
			//PARSE THE JSON
			let allWords = JSON.parse(data);

			//GET THE CATEGORIES
			let categories = allWords.categories;

			//PICK A CATEGORY
			let catTitles = Object.keys(categories);
			let categoryIndex = Math.floor(Math.random() * catTitles.length);
			//SET THE CATEGORY
			theCategory = catTitles[categoryIndex];
			let thisCategory = categories[catTitles[categoryIndex]];

			//PICK A WORD IN THIS CATEGORY
			let thisList = thisCategory.list;
			let wordIndex = Math.floor(Math.random() * thisList.length);
			//SET THE WORD
			theWord = thisList[wordIndex];

			console.log('The category is:',theCategory);
			console.log('The word is:',theWord);

			//THE SETUP OBJECT IS PUBLIC, HIDE MASTER WORD
			setupObject.word = '_____';
			setupObject.category = theCategory;

			//THE GUIDE SETUP OBJECT IS A COPY
			let guideSetupObject = JSON.parse(JSON.stringify(setupObject));
			//WITH THE ACTUAL MASTER WORD SHOWN!
			guideSetupObject.word = theWord;

			//game.guideSetupObject = guideSetupObject;
			game.setupObject = setupObject;

			//#-#-#-#-#-#-#-#-#-#-#-#-#
			// EMIT: ROUND INFO
			//#-#-#-#-#-#-#-#-#-#-#-#-#
			io.to('guideRoom').emit('setup-game',guideSetupObject);
			io.to('seekerRoom').emit('setup-game',setupObject);
			io.to('displayRoom').emit('setup-game',setupObject);
			io.emit('debug-output',game.rounds);
		});
		console.log('setup complete!');
	});

	//#-#-#-#-#-#-#-#-#-#-#-#-#
	// PLAYER INPUT: SUBMIT GUESS
	//#-#-#-#-#-#-#-#-#-#-#-#-#
	socket.on('guess-submitted', (guess) => {

		//GET THE GAME DATA FOR THIS ROUND
		//let thisRound = game.rounds[game.currentRound - 1];

		//REJECT IDENTICAL? OPTION?
		/*for(let i = 0; i < thisRound.clues.length; i++){

			if(thisRound.clues[i] === guess){
				//REJECT IDENTICAL GUESSES?
				return false;
			}
		}*/
		//console.log('Round',game.currentRound,'Clues BEFORE: "',game.rounds[game.currentRound - 1].clues.join(', '),'"');
		//ADD TO CLUES ARRAY FOR THIS ROUND
		//game.rounds[game.currentRound - 1].clues = game.rounds[game.currentRound - 1].clues.push(guess);
		game.rounds[game.currentRound - 1].clues.push(guess);
		//console.log('Round',game.currentRound,'Clues AFTER: ' + game.rounds[game.currentRound - 1].clues.join(', '));
		//EMIT THIS ROUND'S GUESSES
		io.emit('update-guesses', game.rounds[game.currentRound - 1].clues);
		//io.emit('debug-output',game.rounds);
	});

	//#-#-#-#-#-#-#-#-#-#-#-#-#
	// PLAYER INPUT: SUBMIT THUMBS
	//#-#-#-#-#-#-#-#-#-#-#-#-#
	socket.on('thumbs-submitted', (thumbs) => {
		
		console.log('Round ' + game.currentRound + ' thumbs submitted! (' + thumbs + ')');

		//GET THE CURRENT ROUND DATA
		//let thisRound = game.rounds[game.currentRound - 1];
		
		//CHECK THUMBS ALREADY SUBMITTED?
		if(game.rounds[game.currentRound - 1].thumbs !== -1){

			console.log('Thumbs for round ' + game.currentRound + ' already submitted!');
			return false;
		}

		//CHECK SOCKET IS THE GUIDE? UNNECESSARY SAFETY CHECK?
		if(game.roles.guide !== socket.name){

			console.log('Thumbs can only be submitted by the Guide!');
			return false;
		}

		//ADD TO THUMBS TO ARRAY FOR THIS ROUND
		game.rounds[game.currentRound - 1].thumbs = thumbs;
		
		//UPDATE CURRENT ROUND
		game.currentRound += 1;

		//EMIT THIS ROUND'S GUESSES
		io.emit('update-thumbs', thumbs);
	});

	//#-#-#-#-#-#-#-#-#-#-#-#-#
	// DISPLAY: REMOVE FROM PLAYERS
	//#-#-#-#-#-#-#-#-#-#-#-#-#
	socket.on('display-connected', (ip) => {
		console.log('Display Connected at ',ip);
		socket.join('displayRoom');
		game.players = removeSocket(game.players, socket.id);
	});

	socket.on('reset-game', () => {
		console.log('Reset requested by ' + socket.name);
		io.emit('new-lobby', game.lobby);
		reset();
	});

	//#-#-#-#-#-#-#-#-#-#-#-#-#
	// PLAYER INPUT: CLOSE TAB
	//#-#-#-#-#-#-#-#-#-#-#-#-#
	socket.on('disconnect', () => {

		console.log('Player ' + socket.name + ' disconnected');
		//REMOVE USER FROM USERS ARRAY
		game.players = removeSocket(game.players, socket.id);
		io.emit('player-join', getPlayerNamesArray(game.players));
		console.log('Remaining Player Count: ',game.players.length);
		if(game.players.length === 0){
			reset();
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

function addSeeker(player){
	player.join('seekerRoom');
	game.roles.seekers.push(player.name);
	player.role = 'Seeker';
}

function addGuide(player){
	player.join('guideRoom');
	game.roles.guide = player.name;
	player.role = 'Guide';
}

//ITERATE OVER THE PLAYER SOCKETS AND GET AN ARRAY OF NAMES ONLY
function getPlayerNamesArray(players){
	let arrNames = [];
	for(let i = 0; i < players.length; i++){
		let player = {};
		player.id = players[i].id;
		player.name = players[i].name;
		arrNames.push(player);
	}
	return arrNames;
}

function getInitialRoundArray(count){

	let arr = [];

	//ITERATE TO BUILD SAFE ROUNDS ARRAY
	for(let i = 0; i < count; i++){

		let obj = {};
		obj.clues = [];
		obj.thumbs = -1;
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
