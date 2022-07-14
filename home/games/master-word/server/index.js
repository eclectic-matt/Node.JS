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

	//INITIALIZE NAME TO ID
	socket.name = socket.id;

	//COUNT OF CONNECTED
	//socket.client.conn.server.clientsCount 
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
	//game.sockets.push(socket);

	//ALWAYS EMIT THE PLAYERS LIST AFTER A CONNECTION
	//console.log(game.players);
	io.emit('player-join', getPlayerNamesArray(game.players));

	//GAME WILL DEFAULT TO MASTER WORD
	//COULD EMIT THE AVAILABLE GAMES HERE
	io.emit('games-available', gamesAvailable);

	//PLAYER ADDED (OPENED LINK, SET NAME)
	socket.on('player-add', (name) => {

		//SET THE NAME ON THE SOCKET
		socket.name = name;

		//REMOVE THIS SOCKET ID FROM THE PLAYERS ARRAY
		//game.players = removeSocket(game.players, socket.id);

		//PUSH THE SOCKET INTO THE PLAYERS ARRAY
		//game.players.push(name);

		//EMIT THE PLAYER NAMES ONLY
		io.emit('player-join', getPlayerNamesArray(game.players));

		//LOG THE PLAYERS
		console.log('Players: ', getPlayerNamesArray(game.players));
	});

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

		//let guide = game.players[guideIndex].name;
		//let seekers = game.players.slice(guideIndex, guideIndex + 1);
		//let seekers = [...game.players.slice(0, guideIndex).name, ...game.players.slice(guideIndex + 1).name];
		//let seekers = removeSocket(game.players,guideSocketId);
		//game.players = game.players.push(guide);

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

		/*
		//https://stackoverflow.com/a/57293784/16384571
		var sockets = io.sockets.sockets;
		for(var socketId in sockets) {
			//GET SOCKETS TO LEAVE EXISTING ROOMS
			//socket.leave('guideRoom');
			//socket.leave('seekerRoom');
			//IF THIS SOCKET IS THE GUIDE
			if (sockets[socketId].id === guideSocketId){
				sockets[socketId].join('guideRoom');
				roles.guide = sockets[socketId].name;
			}else{
				sockets[socketId].join('seekerRoom');
				roles.seekers.push(sockets[socketId].name)
			}
		}*/

		io.emit('assign-roles', roles);

		//console.log(io.in('guideRoom'));
		//console.log(io.in('seekerRoom'));

		console.log(roles);
		//console.log(game.players);

		let theWord = '';
		let theCategory = '';

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
			//io.emit('setup-round',{"word": theWord, "category": theCategory});
			io.to('guideRoom').emit('setup-round',{"word": theWord, "category": theCategory});
			io.to('seekerRoom').emit('setup-round',{"word": "________", "category": theCategory});
		});

		//	:GAME SETUP:
			//	-> SELECT HINT/MASTER WORD FROM CATEGORIES
			//	-> CONFIRM CLUE CARD COUNTS (6 EACH) = THUMB TOKEN COUNT
			//	-> CONFIRM SOLUTION CARD COUNTS (3 TOTAL)
		//io.emit(setup-round)
	});


	socket.on('disconnect', () => {
		console.log('Player ' + socket.name + ' disconnected');
		//REMOVE USER FROM USERS ARRAY
		game.players = removeSocket(game.players, socket.id);
		/*const userIndex = game.players.indexOf(socket.id);
		if(userIndex !== false){
			game.players.splice(userIndex, 1);
		}*/
		//console.log('PLAYERS: ', game.players);
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

/*
	//RECEIVE: open a lobby
	socket.on('open-lobby', (game) => {
		
		console.log('open lobby now - ' + game + ' selected!');
		io.emit('lobby-open', 'master-word', 'un1qu3');
	});

	socket.on('player-add', (name) => {
		socket.name = name;
		game.players.push(name);
		io.emit('player-join', game.players);
	});
	
	//https://stackoverflow.com/questions/24378272/node-js-how-to-get-the-ip-address-of-http-server-listening-on-a-specific-port
	//console.log('REMOTE',socket.conn.remoteAddress);
	//console.log('LOCAL',socket.conn.localAddress);

	console.log('Socket ID ' + socket.id + ' connected');
	if(socket.name !== null){
		console.log('Name: ' + socket.name);
	}

	//THIS DOES NOT WORK - GIVES A UNIQUE SOCKET.ID ON EACH REFRESH
	if (users.includes(socket.id)){
		//REJOIN
		//console.log('Existing user with ID ' + socket.id + ' REconnected');
	}else{
		//ADD
		//users.push(socket.id);
		//console.log('New user with ID ' + socket.id + ' connected');
		//console.log('USERS: ',users);


		//EMIT PLAYER-JOIN EVENT!
		//io.emit('player-join', users);
	}

	socket.on('disconnect', () => {
		console.log('user disconnected');
		//REMOVE USER FROM USERS ARRAY
		/*const userIndex = users.indexOf(socket.id);
		if(userIndex !== false){
			users.splice(userIndex, 1);
		}
		console.log('USERS: ',users);
		const userIndex = game.players.indexOf(socket.name);
		if(userIndex !== false){
			game.players.splice(userIndex, 1);
		}
		console.log('PLAYERS: ', game.players);
		io.emit('player-join', game.players);
	});
});
*/

server.listen(3000, () => {

	console.log('listening on ' + server.address().address + '*:' + server.address().port);
});
