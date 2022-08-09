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
	console.log('connect');
}


//#-#-#-#-#-#-#-#-#-#-#-#-#
// SERVER UPDATES
//#-#-#-#-#-#-#-#-#-#-#-#-#
/*socket.on('reconnect', () =>{
	socket.emit('display-connected', window.location.href);
	console.log('reconnect',socket.name);
});*/
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
socket.on('setup-game', function(info){

	//UPDATE LOCAL COPY
	gameInfo = JSON.parse(JSON.stringify(info));
	console.log(info.category, info.word);

	updateWordAndCategory(info.word, info.category);

	collapseSections('gameAreaDiv');
});

socket.on('debug-output', (output) => {
	//console.log(output);
});

// UPDATE PLAYER GUESSES LIST
socket.on('update-guesses', function(guesses){

	//GET THE MOST RECENT GUESS
	let lastGuess = guesses[guesses.length - 1];
	//console.log('New guess submitted',lastGuess);
	//PUSH TO OUR LOCAL ROUNDS OBJECT
	gameInfo.rounds[gameInfo.currentRound - 1].clues.push(lastGuess);
	//UPDATE THE HTML
	updateGuessList(lastGuess);
});

socket.on('update-thumbs', function(thumbs){

	//console.log('Received ' + thumbs + ' thumbs!');
	//ADD THESE TO LOCAL GAME OBJECT
	gameInfo.rounds[gameInfo.currentRound - 1].thumbs = thumbs;
	//UPDATE HTML
	updateThumbsList(thumbs);
	//PROCESS NEXT ROUND
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
}


function startNextRound(){

	//INCREMENT CURRENT ROUND
	gameInfo.currentRound += 1;
	console.log('Starting round',gameInfo.currentRound);
	//ADD <div id="guessRow1" class="w3-row">
	let div = document.createElement('div');
	div.classList.add('w3-row');
	div.id = 'guessRow' + gameInfo.currentRound;
	//GET GUESSES DIV
	let guessDiv = document.getElementById('guessesList');
	//STICK A NEW ROW ON IT
	guessDiv.appendChild(div);
}




/**
 * Update the guesses table with a received number of thumb tokens.
 * @param {integer} thumbs 
 */
function updateThumbsList(thumbs){

	let thumbsHeader = document.getElementById('thumbsRound' + gameInfo.currentRound);
	thumbsHeader.innerHTML = '&#128077;'.repeat(thumbs);
	thumbsHeader.classList.add('thumbsReceived');
}


function updateGuessList(guess){
	
	//GET THE ROW TO APPEND THIS GUESS TO
	let guessRow = document.getElementById('guessRow' + gameInfo.currentRound);

	let div = document.createElement('div');
	div.classList.add('newGuess');
	let colSpan = Math.floor(10 / gameInfo.cluesPerRound);
	div.classList.add('w3-col');
	div.classList.add('l' + colSpan);
	div.classList.add('s' + colSpan);
	let h2 = document.createElement('h2');
	h2.innerHTML = guess;
	div.appendChild(h2);
	guessRow.appendChild(div);
	//IF WE'VE RECEIVED ALL CLUES
	if(guessRow.children.length === gameInfo.cluesPerRound){
		//APPEND THUMBS DIV READY FOR THE THUMBS EVENT
		let div = document.createElement('div');
		div.classList.add('thumbs');
		div.classList.add('w3-col');
		let thumbSpan = 12 - (colSpan * gameInfo.cluesPerRound);
		div.classList.add('l' + thumbSpan);
		div.classList.add('s' + thumbSpan);
		let h2 = document.createElement('h2');
		h2.id = 'thumbsRound' + gameInfo.currentRound;
		h2.innerHTML = '&nbsp;';
		div.appendChild(h2);
		guessRow.appendChild(div);
	}
	return;
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
