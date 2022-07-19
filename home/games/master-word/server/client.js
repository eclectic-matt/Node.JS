//#-#-#-#-#-#-#-#-#-#-#-#-#
// INITIALIZE
//#-#-#-#-#-#-#-#-#-#-#-#-#

//const { text } = require("express");

//SOCKET (SERVER WILL PICK UP CONNECTION)
var socket = io();

//PLAYERS ARRAY (LOCAL)
var gamePlayers = [];
//GAME INFO (LOCAL)
var gameInfo = {};

//INIT PANELS AND INFO
function init(){

	//COLLAPSE SECTIONS
	collapseSections('nameAreaDiv');

	const queryString = window.location.pathname.replace('/game.html/','');
	const params = queryString.split('/');
	let game = 'Game Error';
	if(params[0] === 'game'){
		game = (params[1]) ? params[1] : 'Game Error!';
		//document.getElementById('lobbyGameSpan').innerHTML = game;
	}
	let lobbyId = 'Lobby ID Error';
	if(params[2] === 'id'){
		lobbyId = (params[3]) ? params[3] : 'Lobby ID Error!';
		//document.getElementById('lobbyIdSpan').innerHTML = lobbyId;
	}

	//SET LISTENERS ON INPUTS TO SUBMIT ON ENTER
	applyInputSubmit('guessInput', 'guessSubmitButton');
	applyInputSubmit('thumbInput', 'thumbSubmitButton');
	applyInputSubmit('playerNameInput', 'playerNameSubmitButton');

	/*if(document.cookie.includes('name=')){
		console.log('Cookie found! Joining as player!');
		joinAsName(document.cookie.replace('name=',''));
		collapseSections('lobbyAreaDiv');
	}*/
	if(document.cookie.includes('name=')){
		document.getElementById('playerNameInput').value = document.cookie.replace('name=','');
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

// NEW LOBBY OPENED
socket.on('new-lobby', function(lobbyId){

	document.getElementById('lobbyIdSpan').innerHTML = lobbyId;
	//UPDATE QR CODE?
});

//RECEIVE: lobby id to join game
socket.on('lobby-open', function(game, lobbyId){
	//console.log(game,lobbyId);
	//PULL CLIENT INTO LOBBY ROOM?
	window.location.href = 'game.html/game/' + game + '/id/' + lobbyId;
});

// UPDATE PLAYER ROLES LIST
socket.on('assign-roles', function(roles){
	if (roles.guide === socket.name){
		socket.role = 'Guide';
	}else{
		socket.role = 'Seeker';
	}
	//console.log(roles);
	updatePlayerList(gamePlayers, roles);
});

// UPDATE PLAYERS LIST
socket.on('player-join', function(players){

	//SET LOCAL PLAYERS ARRAY
	gamePlayers = JSON.parse(JSON.stringify(players));

	//GET LIST OF NAMES AND UPDATE
	updatePlayerList(gamePlayers);
});

// UPDATE ROUND INFORMATION (WORD, CATEGORY)
socket.on('setup-round', function(info){

	//UPDATE LOCAL COPY
	gameInfo = JSON.parse(JSON.stringify(info));
	//console.log(info.category, info.word);

	updateWordAndCategory(info.word, info.category);

	collapseSections('gameAreaDiv');

	updateVisibleInputs(info.word);

	updateGuessInfoSpan();
});

socket.on('debug-output', (output) => {
	console.log(output);
})


function updateWordAndCategory(word, category){

	let catSpan = document.getElementById('categoryDisplaySpan');
	catSpan.innerHTML = toTitleCase(category.replace('-',' '));
	let wordSpan = document.getElementById('wordDisplaySpan');
	wordSpan.innerHTML = word;
}

function updateVisibleInputs(word){
	
	if(word === '_____'){
		document.getElementById('wordDisplaySpan').classList.remove('secretWord');
		//SHOW GUESS INPUT PANEL
		document.getElementById('guessInputDiv').style.display = 'block';
	}else{
		document.getElementById('wordDisplaySpan').classList.add('secretWord');
		//HIDE GUESSES INPUT
		document.getElementById('guessInputDiv').style.display = 'none';
	}
}

// UPDATE PLAYER GUESSES LIST
socket.on('update-guesses', function(guesses){

	gameInfo.rounds[gameInfo.currentRound - 1].clues = guesses;
	updateGuessList(guesses);
	updateGuessInfoSpan();
	updateThumbsInput(socket);
});

socket.on('update-thumbs', function(thumbs){

	//console.log('Received ' + thumbs + ' thumbs!');
	gameInfo.rounds[gameInfo.currentRound - 1].thumbs = thumbs;
	updateThumbsList(thumbs);
	startNextRound();
});

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
function openLobby(game){

	socket.emit('open-lobby', game);
}

//SEND: start the game
function startGame(){

	socket.emit('start-game');
}

//SEND: set player's name
function playerJoin(){

	let nameInput = document.getElementById('playerNameInput');
	let name = nameInput.value;
	let img = document.getElementById('qrCodeImg');
	img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + window.location.href;
	collapseSections('lobbyAreaDiv');
	document.cookie = "name=" + name;
	joinAsName(name);
}

function joinAsName(name){
	socket.name = name;
	socket.emit('player-add', name);
}

//SEND: guess
function submitGuess(){

	//CHECK IF ALL GUESSES SUBMITTED FOR THE ROUND FIRST
	let guessInput = document.getElementById('guessInput');
	let guess = guessInput.value;
	//IGNORE BLANK GUESSES
	if(guess === '') return;
	socket.emit('guess-submitted', guess);
	guessInput.value = '';
}

function submitThumbs(){

	let thumbInput = document.getElementById('thumbInput');
	let thumbs = thumbInput.value;
	//console.log('Submitting ' + thumbInput.value + ' thumbs!');

	//IF THE NUMBER OF THUMBS IS WITHIN ALLOWED LIMITS
	if(	(thumbs <= gameInfo.cluesPerRound) && (thumbs >= 0) ){
		socket.emit('thumbs-submitted', thumbs);
		thumbInput.value = 0;
		document.getElementById('thumbsInputDiv').style.display = 'none';
	}else{
		alert('Invalid amount of thumb tokens to award! Must be between 0 and ' + gameInfo.cluesPerRound);
	}
}


//#-#-#-#-#-#-#-#-#-#-#-#-#
// UTILITY FUNCTIONS
//#-#-#-#-#-#-#-#-#-#-#-#-#

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

//UPDATE THE LIST OF PLAYERS (WITH OPTIONAL ROLES INFO)
function updatePlayerList(players, roles=null){

	//console.log('Updating player list' + (roles ? ' with roles' : ''));
	//console.log(players);
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

	let guessTable = document.getElementById('guessesTable');
	let guessTableRows = document.getElementsByTagName('tr');
	//console.log(guessTableRows);
	let thumbsTd = guessTableRows[gameInfo.currentRound].children[2];
	thumbsTd.innerHTML = thumbs;
}


function updateGuessList(guesses){

	let guessTable = document.getElementById('guessesTable');
	let guessTableRows = document.getElementsByTagName('tr');
	//console.log(guessTableRows);
	let guessTd = guessTableRows[gameInfo.currentRound].children[1];
	//console.log(guessTd.innerHTML);
	let thisRoundGuesses = [];
	for(let i = 0; i < guesses.length; i++){
		thisRoundGuesses.push(guesses[i]);
	}
	guessTd.innerHTML = thisRoundGuesses.join(', ');


	/*
	//OLD VERSION - BASIC UL/LIs
	let guessList = document.getElementById('guessesUL');
	guessList.innerHTML = '';
	for(let i = 0; i < guesses.length; i++){
		let li = document.createElement('li');
		li.key = i;
		li.innerHTML = guesses[i];
		guessList.appendChild(li);
	}*/
}

function updateGuessInfoSpan(){

	let guessInfoSpan = document.getElementById('guessInfoSpan');
	let guessesRemaining = gameInfo.cluesPerRound - gameInfo.rounds[gameInfo.currentRound - 1].clues.length;
	guessInfoSpan.innerHTML = '(' + gameInfo.cluesPerRound + ' guesses, ' + guessesRemaining + ' left)';
	if(guessesRemaining === 0){
		//HIDE GUESSES INPUT
		document.getElementById('guessInputDiv').style.display = 'none';
	}

	//UPDATE THUMB INPUT 
	let thumbInput = document.getElementById('thumbInput');
	thumbInput.max = gameInfo.cluesPerRound;
}

function updateThumbsInput(socket){

	let guessesRemaining = gameInfo.cluesPerRound - gameInfo.rounds[gameInfo.currentRound - 1].clues.length;

	if(socket.role === 'Guide' && guessesRemaining === 0){
		let thumbInputDiv = document.getElementById('thumbsInputDiv');
		thumbInputDiv.style.display = 'block';
	}
}

//COLLAPSE ALL PANELS EXCEPT THE openSection
function collapseSections(openSection){

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