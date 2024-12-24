/*
Multiplayer-Core
Allows multiple players to join a Node.JS game
Includes core functionality
	- adding players
	- managing IPs
	- displaying individual player views
But all further functionality built up
From this core code in other games
*/

'use strict';

// Needed to serve pages via HTTP
const http = require('http');
// Needed to show template files
const fs = require('fs');
// Needed to get player paths
const url = require('url');
// Use npm install ip (see https://github.com/indutny/node-ip)
// Needed to get the admin view local IP address
const ip = require('ip');
const myLocalIP = ip.address("private");
// Needed to hook events into the code (new player joined)
const events = require('events');
const { createHash } = require('crypto');
var mp_event_emitter = new events.EventEmitter();

const { Player } = require('./class/Player.js');
const { Players } = require('./class/Players.js');
const { Game } = require('./class/Game.js');
//const { viewPage } = require('./pages/viewPage.js');
//console.log('viewpage',viewPage);

//import Game from './class/Game.js';

const config = {
	// If you want to set a limit on the number of players
	playerLimit: null,
	// If you want to set a limit on how long players can join
	joinTimeLimit: null,
	// set the port
	defaultPort: 80
}

console.log('Running on',myLocalIP,config.defaultPort);

let sourceDirectory = '../HomeQuiz/';
//var game = new Game({name: 'House of Games'});


http.createServer(function (req, res) {

	//console.log('REQ.URL = ' + req.url);
	var q = url.parse(req.url, true);
	var path = q.pathname.substring(1);
	var search = q.search;
	console.log('path',path,'search',search);

	switch(path){
		case 'click':
			//BUZZER CLICKED
			var teamBuzzer = path.substring(5, 6);
			console.log('Detected click from team ',teamBuzzer);
			if (buzzerActive == false){
				buzzerActive = true;
				//lightBuzzer(teamBuzzer);
			}else{
				console.log('Buzzer Already Active');
			}
		break;
		case 'name':
			//TEAM NAME BEING CHANGED
			// register a team name change
			team = path.substring(5,6);
			newname = decodeURIComponent(search.substring(2, search.length));
			team.names[team - 1] = newname;
			console.log(search, search.length);
			console.log('Team', team, 'name changed to', newname);
		break;
		case 'view':
			//
			fs.readFile('./pages/viewPage.html', function(err, data) {
				res.writeHead(200, {'Content-Type': 'text/html'});
				let currentIP = res.socket.remoteAddress;
				console.log('Displaying page to: ',currentIP);
				//var output = ``;
				//var output = viewPage;
				//res.write(viewPage);
				//res.write('<!DOCTYPE html><html><body><h1>QUIZ TIME</h1></html>');
				res.write(data);
				res.end();
			});
		break;
		case 'admin':
			fs.readFile('admin.html', function(err, data) {
				res.writeHead(200, {'Content-Type': 'text/html'});
				currentIP = res.socket.remoteAddress;
				res.write(data);
				res.end();
			});
		break;
		case 'team':
			fs.readFile('team.html', function(err, data) {
				res.writeHead(200, {'Content-Type': 'text/html'});
				//eventEmitter.emit('newPlayer');
				currentIP = res.socket.remoteAddress;
				//teamNum = teamList.length;
				var teamNum = null;
				for (let i = 0; i < teams.IPs.length; i++){
					if (teams.IPs[i] === currentIP){
						teamNum = i + 1;
					}
				}
				if (teamNum === null){
					teamNum = teams.IPs.length + 1;
				}
				var output = ``;
				res.write(output);
				//res.write(data);
				res.end();
			});
		break;
		default:
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write('<h1>404 - Page Not Found!');
			res.end();
		break;
	}
}).listen(config.defaultPort);