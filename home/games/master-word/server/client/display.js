//#-#-#-#-#-#-#-#-#-#-#-#-#
// INITIALIZE
//#-#-#-#-#-#-#-#-#-#-#-#-#

//const e = require("express");

//SOCKET (SERVER WILL PICK UP CONNECTION)
var socket = io();

var guesses = [];
var gameInfo;

//INIT PANELS AND INFO
function init(){

	//COLLAPSE SECTIONS
	collapseSections('lobbyDiv');

	socket.emit('display-connected', window.location.href);
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
	console.log(info.category, info.word);

	updateWordAndCategory(info.word, info.category);

	collapseSections('gameAreaDiv');

	//updateVisibleInputs(info.word);

	//updateGuessInfoSpan();
});

socket.on('debug-output', (output) => {
	//console.log(output);
});

// UPDATE PLAYER GUESSES LIST
socket.on('update-guesses', function(guesses){

	console.log('New guesses submitted',guesses);
	//let roundGuesses = gameInfo.rounds[gameInfo.currentRound - 1].clues;
	let difference = [];
	for(let i = 0; i < guesses.length; i++){
		
		console.log('Checking guess', guesses[i]);

		if(!gameInfo.rounds[gameInfo.currentRound - 1].clues.includes(guesses[i])){

			console.log('New guess found!', guesses[i]);
			difference.push(guesses[i]);
		}else{
			console.log('Existing guess found!', guesses[i]);
		}
	}
	//https://stackoverflow.com/a/33034768/16384571
	//let intersection = roundGuesses.filter(x => guesses.includes(x));
	//let difference = gameInfo.rounds[gameInfo.currentRound - 1].clues.filter(x => !guesses.includes(x));
	gameInfo.rounds[gameInfo.currentRound - 1].clues.push(...difference);
	console.log('diff', difference);
	console.log('guesses now', gameInfo.rounds[gameInfo.currentRound - 1].clues);
	//UPDATE ONLY WITH DIFFERENCE OF GUESSES
	updateGuessList(difference);


	//gameInfo.rounds[gameInfo.currentRound - 1].clues = guesses;
	//updateGuessList(guesses);
	//updateGuessInfoSpan();
	//updateThumbsInput(socket);
});

socket.on('update-thumbs', function(thumbs){

	//console.log('Received ' + thumbs + ' thumbs!');
	gameInfo.rounds[gameInfo.currentRound - 1].thumbs = thumbs;
	updateThumbsList(thumbs);
	startNextRound();
});









//UPDATE THE LIST OF PLAYERS (WITH OPTIONAL ROLES INFO)
function updatePlayerList(players, roles=null){

	let playerLists = document.getElementsByClassName('playersUL');

	for(let listId = 0; listId < playerLists.length; listId++){

		//CLEAR THIS PLAYER LIST
		playerLists[listId].innerHTML = '';
		for (let i = 0; i < players.length; i++){

			//CREATE LIST ITEM
			let li = document.createElement('li');

			//GIVE IT A KEY (FOR REACT PREP)
			li.key = i;
			//CLEAR THE ROLE VALUE
			let role = '';

			//IF WE HAVE ROLE INFORMATION
			if(roles){

				//IF THIS IS THE GUIDE
				if (roles.guide === players[i].name){

					//CALL THIS THE GUIDE
					role = ' (Guide)';
					players[i].role = 'Guide';
				}else{

					//CALL THIS A SEEKER
					role = ' (Seeker)';
					players[i].role = 'Seeker';
				}
			}
			//SET NAME AND ROLE
			li.innerHTML = players[i].name + role;
			playerLists[listId].appendChild(li);
		}
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

function updateWordAndCategory(word, category){

	let catSpan = document.getElementById('categoryDisplaySpan');
	catSpan.innerHTML = toTitleCase(category.replace('-',' '));
	//let wordSpan = document.getElementById('wordDisplaySpan');
	//wordSpan.innerHTML = word;
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
	
	//GET THE ROW TO APPEND THIS GUESS TO
	let guessRow = document.getElementById('guessRow' + gameInfo.currentRound);

	let div = document.createElement('div');
	div.classList.add('newGuess');
	let colSpan = Math.floor(12 / gameInfo.cluesPerRound);
	div.classList.add('w3-col');
	div.classList.add('l' + colSpan);
	div.classList.add('s' + colSpan);
	let h2 = document.createElement('h2');
	h2.innerHTML = guesses;
	div.appendChild(h2);
	guessRow.appendChild(div);
	return;

	//let guessTable = document.getElementById('guessesTable');
	let guessTableRows = document.getElementsByTagName('tr');
	//console.log(guessTableRows);
	let guessTd = guessTableRows[gameInfo.currentRound].children[1];
	//console.log(guessTd.innerHTML);
	let thisRoundGuesses = [];
	for(let i = 0; i < guesses.length; i++){
		thisRoundGuesses.push(guesses[i]);
	}
	guessTd.innerHTML = thisRoundGuesses.join(', ');
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
