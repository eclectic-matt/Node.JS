
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
var http = require('http');
// Needed to show template files
var fs = require('fs');
// Needed to get player paths
var url = require('url');
// Use npm install ip (see https://github.com/indutny/node-ip)
// Needed to get the admin view local IP address
var ip = require('ip');
var myLocalIP = ip.address();
// Needed to hook events into the code (new player joined)
var events = require('events');
const { createHash } = require('crypto');
var mp_event_emitter = new events.EventEmitter();

// The IP being checked (global)
var currentIP = '';
// The list of players
var players =  {};
//List of ips for checking
players.IPs = [];
players.data = [];
players.names = [];
players.secretRoles = [];
players.governmentRole = [];

var config = {
	// If you want to set a limit on the number of players
	playerLimit: null,
	// If you want to set a limit on how long players can join
	joinTimeLimit: null
}

/**
 * The generic player class
 * @param data An object containing the following properties:
 * 	- ip		The IP address of the client (used for checking)
 * 	- name		(optional) The name of the player
 */
class Player{
	constructor(data){
		//Assign the IP
		this.ip = data.ip;
		//Assign the user-input name
		this.name = data.name || 'Player';
		//MOVE THIS TO EXTENDED CLASS
		//this.role = data.role || 'Player';
		//Build a string to create a unique player ID (for rejoining on a different device)
		let idStr = this.ip;
		//Generate an md5 hash
		let hash = idStr.createHash('md5');
		//Assign this (hex format) as the ID
		this.id = hash.digest('hex');
	}
}

//Alternative Handle
class DuplicateIPPlayer extends Player{
	
	constructor(data){
		//Assign the IP
		this.ip = data.ip;
		//Assign the user-input name
		this.name = data.name || 'Player';
		//Includes name, allowing multiple players with different names on the same IP
		let idStr = this.ip + this.name;
		//Generate an md5 hash
		let hash = idStr.createHash('md5');
		//Assign this (hex format) as the ID
		this.id = hash.digest('hex');
	}
}

/**
 * The Players class.
 * Consider how to implement player count limits etc.
 */
class Players{

	constructor(data = null){

		//Assign players from the data object (if supplied)
		this.players = data.players || [];
		//Start a player history
		this.playerHistory = data.players || [];
		//Set the player count
		this.playerCount = this.players.length;
		//Store the standard admin IP
		this.adminIP = '::ffff:192.168.1.227';
		console.log('PLAYERS: initialized');
	}

	//Add a new player, first checking if the player is already added
	addPlayer(player){

		//Generate the result of checking for this player
		let checkPlayerResult = this.checkPlayer(player);
		//If this player already exists
		if (checkPlayerResult === true){
			return false;
		}
		//Add player to players array
		this.players = this.players.slice().push(player);
		console.log('PLAYERS: New player added - ID ' + player.id);
	}

	//Check if this player is already in the player array (by ID)
	checkPlayer(player){

		//Iterate through the players (order doesn't matter)
		for(let currentPlayer in this.players){
			//If the current id matches the player being checked
			//Note: not using "includes" here as name might be updated
			if (currentPlayer.id === player.id){
				//Existing player (id) found
				return true;
			}
		}
		//Player not found
		return false;
	}

	//Update a player (IP, Name etc)
	updatePlayer(id, newPlayer){

		//Iterate players by index
		for(let i = 0; i < this.players.length; i++){
			//If the IDs match
			if(this.players[i].id === id){
				let players = this.players.slice();
				players[i] = newPlayer;
				this.players = players;
				console.log('PLAYERS: Player ID ' + id + ' updated');
				return true;
			}
		}
		return false;
	}

	//Remove a player from the array
	removePlayer(player){

		//Check if this player is part of the array
		//Note: checking using includes here, as the ip/name should be set
		if(!this.players.includes(player)){
			//Player not found
			return false;
		}
		//Set the playerIndex to null (checked later)
		let playerIndex = null;
		//Iterate players by index
		for(let i = 0; i < this.players.length; i++){
			//If the player is found
			if(this.players[i] === player){
				//Set the playerIndex
				playerIndex = i;
			}
		}
		//If the playerIndex was found
		if(playerIndex){
			//Update the player array to remove this player
			this.players = this.players.slice(playerIndex,1);
			console.log('PLAYERS: Player ID ' + player.id + ' removed');
			return true;
		}
	}
}

class Game{
	constructor(data){
		this.name = data.name || 'Game';
	}
}