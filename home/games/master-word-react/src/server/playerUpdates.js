const fs = require('fs');

const {
	PLAYER_LIMIT_MIN, PLAYER_LIMIT_MAX, CLUES_PER_ROUND, SOLUTIONS_PER_GAME,
	ROUND_LIMIT_MAX, GAME_NAME, DEFAULT_LOBBY_ID, HIDDEN_SECRET_WORD,
	GAME_STAGE_LOBBY, GAME_STAGE_SEEKER, GAME_STAGE_GUIDE, GAME_STAGE_OVER
} = require('../constants.js');


///-----------------------------------------
/// NEW HANDLER FUNCTIONS (RETURN FALSE IF 
/// NO SERVER UPDATE, TRUE TO EMIT UPDATE)
///-----------------------------------------

function sendServerUpdate(io, game, source='unknown', to='everyone'){

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


/**
 * 
 * @param {The socket requesting a name change} socket 
 * @param {*} name 
 * @returns 
 */
function handlePlayerName(game, socket, name){

	//GET PREV ID
	let prevId = socket.name;

	//NO CHANGE?
	//if(prevId === name){
	//	console.log('no name change, ignored',name);
	//	return false;
	//}

	//SET THE NAME ON THE SOCKET
	socket.name = name;
	socket.nameSet = true;
	//RENAME THE GAME PLAYER
	game.players = renameGamePlayer(game.players, socket);
	
	console.log('');
	console.log('#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#');
	console.log(prevId,'has been renamed to',socket.name);
	console.log('Players Names: ',game.players.map(x => x.name).join(', '));
	console.log('#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#');
	console.log('');
	
	//IF GAME IS RUNNING
	if(game.status.running){
		//ASSIGN AS SEEKER AND ADD TO PLAYERS
		addSeeker(socket);
		//updateRole()
	}//ELSE, WILL GET ADDED ONCE RUNNING

	return true;
}

function renameGamePlayer(players, socket){
	for(let i=0; i<players.length; i++){
		if(players[i].id === socket.id){
			players[i].name = socket.name;
		}
	}
	return players;
}

function handleStartGame(game, io){
	
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

	//CHANGE TO ROLES - NOW EACH PLAYER IS ASSIGNED THEIR ROLE
	
	//ASSIGN A RANDOM GUIDE
	let guideIndex = Math.floor(Math.random() * game.players.length);

	//NOW ROLES ASSIGNED, ADD SOCKETS TO ROOMS
	for(let i = 0; i < game.players.length; i++){
		if(i === guideIndex){
			//addGuide(game.players[i]);
			game.players[i].role = 'Guide';
		}else{
			//addSeeker(game.players[i]);
			game.players[i].role = 'Seeker';
		}
	}

	console.log('ROLES ASSIGNED', game.players);

	//SET UP KEY VARIABLES FOR THIS GAME
	game.secrets.word = '';
	game.secrets.category = '';
	//RESET ROUNDS
	game.rounds = getInitialRoundArray(ROUND_LIMIT_MAX);

	//GET THE WORD LIST
	//fs.readFile('../../words/wordlist.json', 'utf8', (err, data) => {
	fs.readFile("S:/Development/Node.JS/home/games/words/wordlist.json", 'utf8', (err, data) => {

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
		console.log('setup complete!',game);
		//TRIGGER UPDATE HERE (THE ASYNC BREAKS THE RETURN?)
		sendServerUpdate(io, game, 'setupGameComplete');
		return true;
	});
}

function addSeeker(socket){
	socket.join('seekerRoom');

	if(!game.players.roles.seekers.includes(socket.name)){
		players.roles.seekers.push(socket.name);
		socket.role = 'Seeker';
	}
}

function addGuide(socket){
	socket.join('guideRoom');
	players.roles.guide = socket.name;
	socket.role = 'Guide';
}

function getCurrentPlayer(players, socket){
	console.log('checking for current player', players);
	for(let i = 0; i < players.length; i++){
		if(players[i].id === socket.id){
			console.log('matched current player', players[i]);
			return players[i];
		}
	}
}

function handleClueInput(game, socket, guess){

	//CHECK STATUS
	if(!game.status.running){
		return false;
	}

	let currentPlayer = getCurrentPlayer(game.players, socket);

	//CHECK SEEKER SUBMITTED
	//if(!players.roles.seekers.includes(socket.name)){
	if(currentPlayer.role !== 'Seeker'){
		return false;
	}

	//GET CONVENIENCE VARIABLE FOR THIS ROUND CLUES
	let currentClues = game.rounds[game.status.currentRound - 1].clues;

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

function handleResetGame(game){
	game = reset(game);
	return true;
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

//RESET GAME OBJECT BACK TO INIT STATE
function reset(game){

	//RESET PER GAME VARS
	console.log('Initializing game variables');
	if(game.info === undefined){
		game.info = {};
		game.info.name = GAME_NAME;
		game.info.lobbyId = DEFAULT_LOBBY_ID;
		game.info.cluesPerRound = CLUES_PER_ROUND;
		game.info.solutionsPerGame = SOLUTIONS_PER_GAME;
		game.info.roundLimit = ROUND_LIMIT_MAX;
		game.info.playerLimitMin = PLAYER_LIMIT_MIN;
		game.info.playerLimitMax = PLAYER_LIMIT_MAX;
	}
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
	//IF INITIAL, PREPARE PLAYERS ARRAY
	if(game.players === undefined){
		game.players = [];
	}//ELSE, LEAVE PLAYERS UNCHANGED
	//NEW - PLAYERS ARRAY
	//game.players = [];
	//STORE ROUNDS IN GAME OBJECT
	game.rounds = getInitialRoundArray(ROUND_LIMIT_MAX);
	return game;
}


exports.handleClueInput = handleClueInput;
exports.handlePlayerName = handlePlayerName;
exports.handleResetGame = handleResetGame;
exports.handleSolutionInput = handleSolutionInput;
exports.handleStartGame = handleStartGame;
exports.handleThumbsInput = handleThumbsInput;
//exports.addSeeker = addSeeker;	//NEEDED FOR LATE-JOINERS? No, handled here
exports.getInitialRoundArray = getInitialRoundArray;
exports.sendServerUpdate = sendServerUpdate;
exports.reset = reset;

//export default { handleClueInput, handlePlayerName, handleResetGame, handleSolutionInput, handleStartGame, handleThumbsInput };