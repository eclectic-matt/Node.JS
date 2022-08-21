///-----------------------------------------
/// NEW HANDLER FUNCTIONS (RETURN FALSE IF 
/// NO SERVER UPDATE, TRUE TO EMIT UPDATE)
///-----------------------------------------

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
	if(prevId === name){
		console.log('no name change, ignored',name);
		return false;
	}

	//SET THE NAME ON THE SOCKET
	socket.name = name;
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

function handleResetGame(){
	reset();
	return true;
}

exports.handleClueInput = handleClueInput;
exports.handlePlayerName = handlePlayerName;
exports.handleResetGame = handleResetGame;
exports.handleSolutionInput = handleSolutionInput;
exports.handleStartGame = handleStartGame;
exports.handleThumbsInput = handleThumbsInput;

//export default { handleClueInput, handlePlayerName, handleResetGame, handleSolutionInput, handleStartGame, handleThumbsInput };