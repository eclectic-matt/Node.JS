MASTER WORD FLOW

//============================
//RETHINK OF THE GAME OBJECTS 
//AND EMITTER FUNCTIONS
//============================

SIMPLIFY FUNCTIONS BOTH WAYS

//OUTBOUND (SERVER-SIDE) - SEND A CONSISTENT, SINGLE EVENT 
io.emit('server-update', game, players, round);

//INBOUND (PLAYER-SIDE) - A SINGLE HANDLER
//WHICH MATCHES UP TO LOCAL COPIES
socket.on('server-update', (game, players, round) => {

	//CHECK GAME MATCHES
	if(JSON.stringify(localGame.status) !== JSON.stringify(game.status)){
		switch(game.status.stage){
			case GAME_STAGE_LOBBY:
				handleRunning(game, players, round);
			break;
			case end:
				handleEnd(game, players, round);
			break;
		}
	}
	
	//CHECK PLAYERS MATCH
	if(
		(JSON.stringify(localPlayers.list) !== JSON.stringify(players.list))
	){

		handlePlayers(players.list, players.roles);
	}

	//CHECK ROLES MATCH
	if ((JSON.stringify(localRoles.list) !== JSON.stringify(roles.list)))

		handlePlayers(players.list, players.roles);
	}
	
	//CHECK ROUND MATCHES
	if(
		(JSON.stringify(localRound.guesses) !== JSON.stringify(round.guess)) ||
		(JSON.stringify(localRound.thumbs) !== JSON.stringify(round.thumbs))
	){

		handleRound(round);
	}
});

//-----

//OUTBOUND (PLAYER-SIDE) - A SINGLE HANDLER
socket.emit('player-update', update);

//INBOUND (SERVER-SIDE)
switch(update.type){
	case 'playerName':
		handlePlayerName(socket, update);
	break;
	case 'guessInput':
		handleGuessInput(socket, update);
	break;
	case 'thumbsInput':
		handleThumbsInput(socket, update);
	break;
}
function handlePlayerName(socket, update){
	socket.name = 
}

//-----

THEN WHEN SOCKET CONNECTS:
socket.on('connection', () => {
	//INSTANTLY IN-SYNC
	io.emit('server-update', game, players, round);
});

DIRECTIONS:
	io.emit(server -> clients)
	socket.on(client -> server)

NAMING:
	EMIT: powershell verb-noun
	io.emit('open-lobby')

	RECEIVE: noun-verbed
	socket.on('lobby-opened')


//ADMIN OPENS ADMIN PANEL
//	-> SHOW GAMES LIST
io.emit(show-gameslist)

//ADMIN SELECTS MASTER WORD
//	-> GENERATE LOBBY ID
//	-> OPEN LOBBY
io.emit(open-lobby)

//PLAYERS JOIN
//	-> ADD TO LOBBY
socket.on(join-lobby)

//ADMIN STARTS GAME
//	:ASSIGNMENTS:
//	-> ASSIGN GUIDE
//	-> REST ARE SEEKERS
io.emit(assign-roles)

//	:GAME SETUP:
//	-> SELECT HINT/MASTER WORD FROM CATEGORIES
//	-> CONFIRM CLUE CARD COUNTS (6 EACH) = THUMB TOKEN COUNT
//	-> CONFIRM SOLUTION CARD COUNTS (3 TOTAL)
io.emit(setup-round)

//	-> SHOW GUIDE PANEL
// TOP: HINT / MASTER WORD
// MIDDLE: CLUES RECEIVED (CLICK TO JOKER, ONCE PER GAME)
// MIDDLE LOWER: INPUT TO +/- THUMB TOKENS
// BOTTOM: BUTTON TO SUBMIT TOKENS

//	-> SHOW SEEKER PANELS
// TOP: HINT
// MIDDLE: CLUE INPUT / (SOLUTION INPUT)
// MIDDLE LOWER: BUTTON SWITCH CLUE/SOLUTION
// BOTTOM: BUTTON TO SUBMIT (CLUE/SOLUTION)

//	-> UPDATE DISPLAY
// TOP: HINT
// MIDDLE: CLUES RECEIVED / THUMB TOKENS PER ROUND

//	-> GAME OVER SCREEN
// TOP: RESULT (YOU WON/YOU LOST)
// MIDDLE: THE WORD WAS "MASTER WORD"
// BOTTOM: SUMMARY OF GAME (ROUNDS, THUMB TOKENS)