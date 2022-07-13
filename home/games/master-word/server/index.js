const e = require('express');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


//#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#
// ROUTING (EXPRESS)
//#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#
//INIT - SHOW GAMES LIST
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/gamesList.html');
	console.log('Connection to: ' + req.connection.localAddress);
});

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
	res.send(req.params);*/
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
game.lobby = [];
game.players = [];
var users = [];


//#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#
// CONNECTIONS (SOCKET.IO)
//#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#
//ON CONNECTION
io.on('connection', (socket) => {

	//CHECK ADMIN SET
	if(game.admin !== null){
		game.admin = socket;
		console.log('Admin Joined ID:' + socket.id + ' connected');
	}else{
		console.log('Too many admins spoil the broth!');

	}

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
		console.log('USERS: ',users);*/
		const userIndex = game.players.indexOf(socket.name);
		if(userIndex !== false){
			game.players.splice(userIndex, 1);
		}
		console.log('PLAYERS: ', game.players);
		io.emit('player-join', game.players);
	});
});

server.listen(3000, () => {

  console.log('listening on ' + server.address().address + '*:' + server.address().port);
});
