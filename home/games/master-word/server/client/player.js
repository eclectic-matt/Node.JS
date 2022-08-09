//#-#-#-#-#-#-#-#-#-#-#-#-#
// INITIALIZE
//#-#-#-#-#-#-#-#-#-#-#-#-#

const HIDDEN_SECRET_WORD = '__________';
const GAME_STAGE_LOBBY = 0;		//PLAYERS JOIN
const GAME_STAGE_SEEKER = 1;	//SEEKERS GUESS
const GAME_STAGE_GUIDE = 2;		//GUIDE THUMBS/WINS
const GAME_STAGE_OVER = 3;		//GAME OVER

//SOCKET (SERVER WILL PICK UP CONNECTION)
var socket = io();

//SET UP LOCAL VARIABLES
var localGame = {};
var localPlayers = [];
var localRoles = {};
var localRounds = getInitialRoundArray();

//INIT PANELS AND INFO
function init(){

	//COLLAPSE SECTIONS
	collapseSections('nameAreaDiv');

	//SET LISTENERS ON INPUTS TO SUBMIT ON ENTER
	applyInputSubmit('guessInput', 'guessSubmitButton');
	applyInputSubmit('thumbInput', 'thumbSubmitButton');
	applyInputSubmit('playerNameInput', 'playerNameSubmitButton');

	if(localStorage.getItem('RiverdaleRoadPlayerName') !== null){
		document.getElementById('playerNameInput').value = localStorage.getItem('RiverdaleRoadPlayerName');
	}
}

function applyInputSubmit(inputId, btnId){
	var input = document.getElementById(inputId);
	input.addEventListener("keypress", function(event) {
		// If the user presses the "Enter" key on the keyboard
		if (event.key === "Enter") {
			// Cancel the default action, if needed
			event.preventDefault();
			// Trigger the button element with a click
			document.getElementById(btnId).click();
		}
	});
}






//#-#-#-#-#-#-#-#-#-#-#-#-#
// SERVER UPDATES
//#-#-#-#-#-#-#-#-#-#-#-#-#

// NEW FUNCTIONALITY
socket.on('server-update', (game, players, roles, rounds) => {
	
	console.log('server update');
	checkInitialized();

	//BACKUP FOR MATCHING
	prevGame = JSON.parse(JSON.stringify(localGame));
	prevPlayers = JSON.parse(JSON.stringify(localPlayers));
	prevRoles = JSON.parse(JSON.stringify(localRoles));
	prevRounds = JSON.parse(JSON.stringify(localRounds));
	
	//UPDATE LOCAL COPIES
	localGame = JSON.parse(JSON.stringify(game));
	localPlayers = JSON.parse(JSON.stringify(players));
	localRoles = JSON.parse(JSON.stringify(roles));
	localRounds = JSON.parse(JSON.stringify(rounds));

	//MATCH UP PREVIOUS OBJECTS TO DETERMINE PANEL CHANGES
	if(JSON.stringify(prevGame) !== JSON.stringify(game)){
		
		//
		console.log('Game changed',game);
		switchGameStage(socket, game.status.stage);

		switch(game.status.stage){
			case GAME_STAGE_LOBBY:
				handleRunning(socket, game, rounds);
			break;
			case GAME_STAGE_SEEKER:
			case GAME_STAGE_GUIDE:
				console.log('handle round');
				handleRound(socket, rounds);
			break;
			case GAME_STAGE_OVER:
				handleEnd(game, players, roles, rounds);
			break;
		}
	}
	
	//CHECK PLAYERS MATCH
	if(JSON.stringify(prevPlayers) !== JSON.stringify(players)){
		console.log('handle players');
		handlePlayers(socket, players, roles);
	}

	//CHECK ROLES MATCH
	if(JSON.stringify(prevRoles) !== JSON.stringify(roles)){
		console.log('handle players');
		handlePlayers(socket, players, roles);
	}
	
	//CHECK ROUND MATCHES
	if(JSON.stringify(prevRounds) !== JSON.stringify(rounds)){
		console.log('handle round');
		handleRound(socket, rounds);
	}
});

function checkInitialized(){
	
	console.log('initalized?');
	if(isEmpty(localGame)){
		//INITIALIZE TO NULLS
		localGame.status = {};
		localGame.status.stage = -1;
		localGame.status.running = undefined;
		localGame.status.currentRound = -1;
	}
	if(localRounds == []){
		
		localRounds = getInitialRoundArray();
		console.log('initalized local rounds');
	}
	if(isEmpty(localRoles)){
		//INITIALIZE
		localRoles.guide = undefined;
		localRoles.seekers = [];
	}
}

function isEmpty(obj){
	//https://stackoverflow.com/a/32108184/16384571
	return (obj && Object.keys(obj).length === 0 && Object.getPrototypeOf(obj) === Object.prototype);
}

function handleRunning(socket, game){

	console.log('handle running is dead');
	handleRound(socket, game, rounds);

	//SWITCH PANELS (VISUAL)
	//if(localGame.stage !== game.stage){
	
		//UPDATE PANELS
	//	switchGameStage(socket, game.stage);
	//}

}

function handlePlayers(socket, players, roles = null){
	//KEEP LOCAL COPIES IN SYNC
	localPlayers = JSON.parse(JSON.stringify(players));
	localRoles = JSON.parse(JSON.stringify(roles));
	updatePlayerList(localPlayers, localRoles);
}

function handleRound(socket, rounds){

	if(localRounds.thumbs !== rounds.thumbs){
		handleThumbs(rounds.thumbs);
	}
	//console.log(rounds);
	//console.log(localGame);
	localRounds = JSON.parse(JSON.stringify(rounds));
	guesses = localRounds[localGame.status.currentRound - 1].clues;
	updateGuessList(guesses);
	updateGuessInfoSpan();
	updateThumbsInput(socket);
}

function handleThumbs(thumbs){
	updateThumbsList(thumbs);
	startNextRound();
}

/**
 * Handles all UI changes when the server changes the game stage.
 * @param {object} socket The current socket (check name defined).
 * @param {string} stage The current game stage (defined as a const).
 */
function switchGameStage(socket, stage){
	console.log('switch stage to',stage);
	switch(stage){
		case GAME_STAGE_LOBBY:
			//IS DEFAULT NAME SET?
			if(socket.name == undefined){
				//SHOW NAME AREA
				collapseSections('nameAreaDiv');
			}else{
				//SHOW LOBBY
				collapseSections('lobbyAreaDiv');
			}
		break;
		case GAME_STAGE_SEEKER:
		case GAME_STAGE_GUIDE:
			//IF THIS PLAYER IS THE GUIDE
			if(socket.name === localRoles.guide){
				//SHOW THEM THE SECRET WORD
				updateWordAndCategory(localGame.secrets.word, localGame.secrets.category);
				updateVisibleInputs(localGame.secrets.word);
			}else{
				//OTHERWISE, SHOW A BLANK
				updateWordAndCategory(HIDDEN_SECRET_WORD, localGame.secrets.category);
				updateVisibleInputs(HIDDEN_SECRET_WORD);
			}
			//DETERMINE INPUTS BASED ON ROLE
			updateGuessInfoSpan();
			//SHOW MAIN GAME AREA
			collapseSections('gameAreaDiv');
		break;
		case GAME_STAGE_OVER:
			//SHOW GAME OVER (FINISHED? WIN/LOSE?) AREA
			collapseSections('gameOverDiv');
		break;
	}
}








function updateWordAndCategory(word, category){

	let catSpan = document.getElementById('categoryDisplaySpan');
	catSpan.innerHTML = toTitleCase(category.replace('-',' '));
	let wordSpan = document.getElementById('wordDisplaySpan');
	if(word === HIDDEN_SECRET_WORD){
		wordSpan.style.display = 'none';
	}else{
		wordSpan.style.display = 'block';
		wordSpan.innerHTML = word;
	}
}

function updateVisibleInputs(word){
	
	if(word === HIDDEN_SECRET_WORD){
		document.getElementById('wordDisplaySpan').classList.remove('secretWord');
		//SHOW GUESS INPUT PANEL
		document.getElementById('guessInputDiv').style.display = 'block';
	}else{
		document.getElementById('wordDisplaySpan').classList.add('secretWord');
		//HIDE GUESSES INPUT
		document.getElementById('guessInputDiv').style.display = 'none';
	}
}

function startNextRound(){

	//INCREMENT CURRENT ROUND
	gameInfo.currentRound += 1;
	console.log('Starting round',gameInfo.currentRound);
	//SHOW GAME AREA DIV (IF NOT ALREADY VISIBLE)
	collapseSections('gameAreaDiv');
	//SHOW/HIDE INPUTS (GUESS/THUMBS)
	updateVisibleInputs(gameInfo.word);

	//GENERATE A NEW BLANK GUESSES ROW
	let tr = document.createElement('tr');
	let tdRound = document.createElement('td');
	tdRound.innerHTML = '' + gameInfo.currentRound;
	tr.appendChild(tdRound);
	let tdGuess = document.createElement('td');
	tr.appendChild(tdGuess);
	let tdThumbs = document.createElement('td');
	tdRound.innerHTML = 0;
	tr.appendChild(tdThumbs);

	//APPEND NEW ROW TO TABLE
	document.getElementById('guessesTable').children[0].appendChild(tr);
}


//#-#-#-#-#-#-#-#-#-#-#-#-#
// CLIENT UPDATES
//#-#-#-#-#-#-#-#-#-#-#-#-#

//SEND: instruction to open a lobby
function openLobby(){

	let update = {};
	update.method = 'openLobby';
	socket.emit('player-update', update);
}

//SEND: start the game
function startGame(){

	//socket.emit('start-game');
	let update = {};
	update.method = 'startGame';
	socket.emit('player-update', update);
}

//SEND: set player's name
function playerJoin(){

	let nameInput = document.getElementById('playerNameInput');
	let name = nameInput.value;
	let img = document.getElementById('qrCodeImg');
	img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + window.location.href;
	collapseSections('lobbyAreaDiv');
	//document.cookie = "name=" + name;
	localStorage.setItem('RiverdaleRoadPlayerName',name);
	joinAsName(name);
}

function joinAsName(name){
	socket.name = name;
	let update = {};
	update.method = 'playerName';
	update.name = name;
	socket.emit('player-update', update);
	switchGameStage(socket, localGame.status.stage);
}

//SEND: guess
function submitGuess(){

	//CHECK IF ALL GUESSES SUBMITTED FOR THE ROUND FIRST
	let guessInput = document.getElementById('guessInput');
	let guess = guessInput.value;
	//IGNORE BLANK GUESSES
	if(guess === '') return;
	guessInput.value = '';
	let update = {};
	update.method = 'clueInput';
	update.guess = guess;
	socket.emit('player-update', update);
}

function submitThumbs(){

	let thumbInput = document.getElementById('thumbInput');
	let thumbs = thumbInput.value;

	//IF WIN
	let winDeclared = false;
	//IF SOLUTION WRITTEN ON CLUE CARD - LOSS
	let lossDeclared = false;

	//IF THE NUMBER OF THUMBS IS WITHIN ALLOWED LIMITS
	if(	(thumbs <= localGame.info.cluesPerRound) && (thumbs >= 0) ){

		let update = {};
		update.method = 'thumbsInput';
		update.thumbs = thumbs;
		update.winDeclared = winDeclared;
		update.lossDeclared = lossDeclared;
		socket.emit('player-update', update);
		thumbInput.value = 0;
		document.getElementById('thumbsInputDiv').style.display = 'none';
	}else{
		alert('Invalid amount of thumb tokens to award! Must be between 0 and ' + gameInfo.cluesPerRound);
	}
}


//#-#-#-#-#-#-#-#-#-#-#-#-#
// UTILITY FUNCTIONS
//#-#-#-#-#-#-#-#-#-#-#-#-#
/**
 * 
 * @param {integer} count The number of rounds.
 * @returns {array} The default rounds array.
 */
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

/**
 * Reset the game back to the initial state.
 */
function resetGame(){
	if (confirm("Are you sure you want to reset the game?") == true) {
		let update = {};
		update.method = 'resetGame';
		socket.emit('player-update', update);
	}
}

//CONVERT INTO Proper/TitleCase
//https://stackoverflow.com/a/196991/16384571
function toTitleCase(str) {

	return str.replace(
		/\w\S*/g,
		function(txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		}
	);
}

//#-#-#-#-#-#-#-#-#-#-#-#-#
// UI UPDATES
//#-#-#-#-#-#-#-#-#-#-#-#-#
//UPDATE THE LIST OF PLAYERS (WITH OPTIONAL ROLES INFO)
function updatePlayerList(players, roles=null){

	let playerLists = document.getElementsByClassName('playersUL');
	//console.log(playerLists);
	for(let listId = 0; listId < playerLists.length; listId++){
		playerLists[listId].innerHTML = '';
		for (let i = 0; i < players.length; i++){
			let li = document.createElement('li');
			li.key = i;
			let role = '';
			//IF THIS IS THE GUIDE
			if(roles){
				if (roles.guide === players[i].name){
					role = ' (Guide)';
					players[i].role = 'Guide';
				}else{
					role = ' (Seeker)';
					players[i].role = 'Seeker';
				}
			}
			li.innerHTML = players[i].name + role;
			if(players[i].id === socket.id){
				li.style.fontWeight = 'bolder';
				li.style.color = '#FFFF00';
			}
			
			playerLists[listId].appendChild(li);
		}
	}
}
/**
 * Update the guesses table with a received number of thumb tokens.
 * @param {integer} thumbs 
 */
function updateThumbsList(thumbs){
	console.log('updateThumbsList');
	let guessTable = document.getElementById('guessesTable');
	let guessTableRows = document.getElementsByTagName('tr');
	//console.log(guessTableRows);
	let thumbsTd = guessTableRows[game.info.currentRound].children[2];
	thumbsTd.innerHTML = thumbs;
}


function updateGuessList(guesses){
	console.log('updateGuessList');
	let currentRound = localGame.status.currentRound;
	//let guessTable = document.getElementById('guessesTable');
	let guessTableRows = document.getElementsByTagName('tr');
	//console.log(guessTableRows);
	let guessTd = guessTableRows[currentRound].children[1];
	//console.log(guessTd.innerHTML);
	let thisRoundGuesses = [];
	for(let i = 0; i < guesses.length; i++){
		thisRoundGuesses.push('<b class="guessBold">' + guesses[i] + '</b>');
	}
	guessTd.innerHTML = thisRoundGuesses.join(', ');
}

function updateGuessInfoSpan(){
	console.log('updateGuessInfo');
	let currentRound = localGame.status.currentRound;
	let clues = localRounds[currentRound - 1].clues;
	let guessInfoSpan = document.getElementById('guessInfoSpan');
	let guessesRemaining = localGame.info.cluesPerRound - clues.length;
	guessInfoSpan.innerHTML = '(' + localGame.info.cluesPerRound + ' guesses, ' + guessesRemaining + ' left)';
	if(guessesRemaining === 0){
		//HIDE GUESSES INPUT
		document.getElementById('guessInputDiv').style.display = 'none';
	}

	//UPDATE THUMB INPUT 
	let thumbInput = document.getElementById('thumbInput');
	thumbInput.max = localGame.info.cluesPerRound;
}

function updateThumbsInput(socket){
	console.log('updateThumbsInput');
	let currentRound = localGame.status.currentRound;
	let info = localGame.info;
	let guessesRemaining = info.cluesPerRound - localRounds[currentRound - 1].clues.length;
	console.log(info.cluesPerRound, localRounds[currentRound - 1].clues.length, guessesRemaining);
	
	if(socket.name === localRoles.guide && guessesRemaining === 0){
	//if(socket.role === 'Guide' && guessesRemaining === 0){
		let thumbInputDiv = document.getElementById('thumbsInputDiv');
		thumbInputDiv.style.display = 'block';
	}
}
//COLLAPSE ALL PANELS EXCEPT THE openSection
function collapseSections(openSection){

	console.log('collapseSection',openSection);
	let sections = document.getElementsByClassName('sectionDiv');
	for(let i = 0; i < sections.length; i++){
		if(sections[i].id !== openSection){
			sections[i].style.display = 'none';
		}else{
			sections[i].style.display = 'block';
		}
	}
}
function showNameArea(){
	collapseSections('nameAreaDiv');
}