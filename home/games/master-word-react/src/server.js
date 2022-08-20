//HANDLE REQUIRES
const express = require('express');
const cors = require('cors');
const app = express();
//MAKE THE APP CORS-FRIENDLY
app.use(cors());
const http = require('http');
const server = http.createServer(app);
//const { isSet } = require('util/types');	//AUTO INCLUDED WHEN I WROTE A TYPO!?!

//CONSTANTS
const SERVERPORT = 4000;
const CLIENTPORT = 3000;
const DEFAULTPORT = 8080;

//SOCKET SERVER
const { Server } = require("socket.io");

const io = new Server(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST']
	}
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

//-------------------
//INITIALIZE GAME
//-------------------
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

	//STORE REF TO SOCKET
	//sockets.push(socket.id);

	//INITIALIZE NAME TO SOCKET (DEFAULT ID)
	socket.name = socket.id;
	socket.role = '';
	players.sockets.push(socket);
	

	//LOG CONNECT
	console.log('#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#');
	console.log('NEW USER CONNECTED!');
	console.log('ID: ' + socket.id);
	console.log('Current count: ' + players.sockets.length);
	console.log('#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#');
	console.log('');
	


	//LOG UPDATE
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

		//console.log(socket.id, update.method, update.name);
		console.log('#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#');
		console.log('PLAYER NAME CHANGE!');
		console.log('PLAYER ID: ' + socket.id);
		console.log('PLAYER NAME: ' + socket.name);
		console.log('Current players count: ' + players.sockets.length);
		console.log('Current player names: ' + players.getPlayerNamesArray().map(x => x.name).join(', '));
		console.log('#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#');
		console.log('');
	});

	//LOG DISCONNECT
	socket.on('disconnect', () => {

		players.sockets.splice(players.sockets.indexOf(socket.id),1);
		//players = removePlayer(players, socket);

		//console.log('🔥: A user disconnected');
		console.log('#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#');
		console.log('USER DISCONNECTED!');
		console.log('ID: ' + socket.id);
		if(socket.name){
			console.log('BYE BYE ' + socket.name);
		}
		console.log('Current players count: ' + players.sockets.length);
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


function sendServerUpdate(source='unknown'){

	console.log('sending server update',source);
	//let p = players.getPlayerNamesArray();
	//let r = players.roles;
	//io.emit('server-update', game, p, r, rounds);
	//console.log(rounds);
	//PREPARE A SHAREABLE OBJECT
	let shareObj = {};
	//GET COPY OF GAME
	let gameObj = JSON.parse(JSON.stringify(game));
	//STORE GAME OBJECT IN SHARE OBJECT
	shareObj.game = gameObj;
	//STORE PLAYERS IN THE SHARE OBJECT (INCL. ROLES?)
	shareObj.players = {};
	shareObj.players.names = players.getPlayerNamesArray();
	//shareObj.players.names = getPlayerNamesArray(players);
	shareObj.players.roles = players.roles;
	//STORE ROUNDS IN THE SHARE OBJECT
	shareObj.rounds = JSON.parse(JSON.stringify(rounds));
	//SEND SINGLE OBJECT UPDATE
	io.emit('server-update', shareObj);
}



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