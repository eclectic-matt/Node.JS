const e = require('express');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const crypto = require('crypto');
const fs = require('fs');


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

app.get('/style.css', (req, res) => {
	res.sendFile(__dirname + '/style.css');
});

app.get('/client.js', (req, res) => {
	res.sendFile(__dirname + '/client.js');
});

/*
//OPEN A LOBBY (SPECIFY GAME AND ID)
app.get('/lobby.html/game/:game/id/:id', (req, res) => {
	//https://expressjs.com/en/guide/routing.html
	res.sendFile(__dirname + '/lobby.html');
	/*res.params = {
		"game": req.params.game,
		"id": req.params.id
	};
	console.log(res.params);
	//res.sendFile(__dirname + '/lobby.html');//?game=' + req.params.game + '&id=' + req.params.id);
	res.send(req.params);
});
*/

//SINGLE PAGE? OPTIONAL ROUTING PARAMS?
app.get('/game.html(/game/:game/id/:id)?', (req, res) => {

	//PASS TO LOBBY, PARAMS SET UP
	res.sendFile(__dirname + '/game.html');
});




//#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#
// GAME OBJECT
//#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#
//THE GAME OBJECT
var game = {};
game.name = 'Master Word';
//SET LIMITS
game.playerLimits = {};
game.playerLimits.min = 2;
game.playerLimits.max = 10;
//NO INITIAL ADMIN
game.admin = null;
//NO INITIAL LOBBY
game.lobby = null;
game.players = [];
game.sockets = [];
var users = [];

var gamesAvailable = [
	'master-word'
];


//https://socket.io/get-started/chat
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

	//COUNT OF CONNECTED
	if(socket.client.conn.server.clientsCount === 1){

		//NO OTHER PLAYERS - PROMOTE TO ADMIN!
		game.admin = socket;
		console.log('Admin Joined with ID:' + socket.id);
		
		//DEFAULT LOBBY ID
		let lobbyId = 'A1B2';

		//GENERATE SOME RANDOM BYTES FOR THE LOBBY ID
		crypto.randomBytes(2, (err, buffer) => {

			//GENERATE BYTES AS HEX STRING, UPPER CASE
			lobbyId = buffer.toString('hex').toUpperCase();
			//SET AS THE GAME LOBBY ID
			game.lobby = lobbyId;
			console.log('New Lobby ID generated: ' + lobbyId);
			//EMIT TO PLAYERS
			io.emit('new-lobby', lobbyId);
			//JOIN THE ROOM WITH lobbyId
			socket.join(lobbyId);
		});
	}else{
		console.log('Player Joined with ID:' + socket.id);
		//JOIN THE ROOM WITH lobbyId
		socket.join(game.lobby);
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
	io.emit('games-available', gamesAvailable);

	//#-#-#-#-#-#-#-#-#-#-#-#-#
	// PLAYER INPUT: SET NAME
	//#-#-#-#-#-#-#-#-#-#-#-#-#
	socket.on('player-add', (name) => {

		//SET THE NAME ON THE SOCKET
		socket.name = name;

		//REMOVE THIS SOCKET ID FROM THE PLAYERS ARRAY
		//game.players = removeSocket(game.players, socket.id);

		//PUSH THE SOCKET INTO THE PLAYERS ARRAY
		//game.players.push(name);

		//#-#-#-#-#-#-#-#-#-#-#-#-#
		// EMIT: PLAYER NAMES
		//#-#-#-#-#-#-#-#-#-#-#-#-#
		io.emit('player-join', getPlayerNamesArray(game.players));

		//LOG THE PLAYERS
		console.log('Players: ', getPlayerNamesArray(game.players));
	});

	//#-#-#-#-#-#-#-#-#-#-#-#-#
	// PLAYER INPUT: START GAME
	//#-#-#-#-#-#-#-#-#-#-#-#-#
	socket.on('start-game', () => {

		//BUILD ROLES OBJECT (PUBLIC, EMITTED)
		roles = {};
		roles.guide = null;
		roles.seekers = [];
		//ADMIN STARTS GAME
			//	:ASSIGNMENTS:
			//	-> ASSIGN GUIDE
			//	-> REST ARE SEEKERS
		
		//ASSIGN A RANDOM GUIDE
		let guideIndex = Math.floor(Math.random() * game.players.length);
		//GET THE SOCKET ID
		//let guideSocketId = game.players[guideIndex].id;
		console.log('GUIDE ASSIGNED TO',game.players[guideIndex].name);

		//NOW ROLES ASSIGNED, ADD SOCKETS TO ROOMS
		for(let i = 0; i < game.players.length; i++){
			if(i === guideIndex){
				game.players[i].join('guideRoom');
				roles.guide = game.players[i].name;
			}else{
				game.players[i].join('seekerRoom');
				roles.seekers.push(game.players[i].name);
			}
		}

		//#-#-#-#-#-#-#-#-#-#-#-#-#
		// EMIT: ROLES
		//#-#-#-#-#-#-#-#-#-#-#-#-#
		io.emit('assign-roles', roles);

		console.log(roles);

		//SET UP KEY VARIABLES FOR THIS GAME
		let theWord = '';
		let theCategory = '';

		game.rounds = Array(7).fill({"clues":[],"thumbs":-1});
		game.currentRound = 1;

		//MAKE AN OBJECT TO TRANSMIT GAME INFO
		let setupObject = {};
		//THE MAX NUMBER OF ROUNDS
		setupObject.roundCount = 7;
		//THE MAX NUMBER OF SOLUTIONS
		setupObject.solutionCardCount = 3;
		//THE NUMBER OF SEEKERS IN THIS GAME
		setupObject.seekerCount = roles.seekers.length;
		//THE NUMBER OF CLUES REQUIRED PER ROUND
		setupObject.cluesPerRound = Math.max(4, setupObject.seekerCount);
		//THE CURRENT ROUND
		setupObject.currentRound = game.currentRound;
		//THE ROUNDS (CLUES, THUMBS)
		setupObject.rounds = game.rounds;

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

			//#-#-#-#-#-#-#-#-#-#-#-#-#
			// EMIT: ROUND INFO
			//#-#-#-#-#-#-#-#-#-#-#-#-#
			io.to('guideRoom').emit('setup-round',guideSetupObject);
			io.to('seekerRoom').emit('setup-round',setupObject);
		});

		//	:GAME SETUP:
			//	-> SELECT HINT/MASTER WORD FROM CATEGORIES
			//	-> CONFIRM CLUE CARD COUNTS (6 EACH) = THUMB TOKEN COUNT
			//	-> CONFIRM SOLUTION CARD COUNTS (3 TOTAL)
		//io.emit(setup-round)
	});

	//#-#-#-#-#-#-#-#-#-#-#-#-#
	// PLAYER INPUT: SUBMIT GUESS
	//#-#-#-#-#-#-#-#-#-#-#-#-#
	socket.on('guess-submitted', (guess) => {

		//GET THE GAME DATA FOR THIS ROUND
		let thisRound = game.rounds[game.currentRound - 1];

		//REJECT IDENTICAL? OPTION?
		/*for(let i = 0; i < thisRound.clues.length; i++){

			if(thisRound.clues[i] === guess){
				//REJECT IDENTICAL GUESSES?
				return false;
			}
		}*/
		//ADD TO CLUES ARRAY FOR THIS ROUND
		thisRound.clues.push(guess);
		//EMIT THIS ROUND'S GUESSES
		io.emit('update-guesses', thisRound.clues);
	});

	//#-#-#-#-#-#-#-#-#-#-#-#-#
	// PLAYER INPUT: CLOSE TAB
	//#-#-#-#-#-#-#-#-#-#-#-#-#
	socket.on('disconnect', () => {

		console.log('Player ' + socket.name + ' disconnected');
		//REMOVE USER FROM USERS ARRAY
		game.players = removeSocket(game.players, socket.id);
		io.emit('player-join', getPlayerNamesArray(game.players));
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
			console.log(wifi[i].address + ':' + port);
		}
	}
});
