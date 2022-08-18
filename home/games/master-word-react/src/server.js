const express = require('express');
const app = express();
const PORT = 4000;
const http = require('http').Server(app);
const cors = require('cors');

const socketIO = require('socket.io')(http, {
	cors: {
		origin: "http://localhost:3000"
	}
});

socketIO.on('connection', (socket) => {
	console.log(`⚡: ${socket.id} user just connected!`);
	socket.on('disconnect', () => {
		console.log('🔥: A user disconnected');
	});
});

/*app.get(['/','/Home'], (req, res) => {
	res.sendFile(__dirname + '/App.js');
});*/

app.listen(PORT, () => {
	console.log(`BACKEND Server listening on ${PORT}`);
});
