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
var mp_event_emitter = new events.EventEmitter();

// The IP being checked (global)
var currentIP = '';
// The list of players
var players =  {};
players.IPs = [];
players.names = [];
players.secretRoles = [];
players.governmentRole = [];

var config = {
  // If you want to set a limit on the number of players
  playerLimit: null,
  // If you want to set a limit on how long players can join
  joinTimeLimit: null
}

// This checks if the IP of the player
// matches an already joined player
var checkNewPlayer = function() {

  // The flag to mark if this IP was found
  var playerFlag = false;
  // The number of players currently joined
  var playerCount = players.IPs.length;

  // If the currentIP is NOT blank AND NOT the admin IP
  if ( (currentIP !== '') && (currentIP !== '::ffff:192.168.1.227') ){

    // If the current IP is found in the players.IPs array
    if (players.IPs.includes(currentIP)){

      // Do nothing - player already added!
      //playerFlag = true;

    // Else - NEW PLAYER FOUND!
    }else{

      // Check that the player limit has not been exceeded
      if (playerCount < config.playerLimit){

        // Add this new player to the players.IPs array
        players.IPs[playerCount] = currentIP;
        console.log('New player added - ' + currentIP);

      }

    }

  }

}
