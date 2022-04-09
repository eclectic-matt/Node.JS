'use strict';

/**
 * The Codenames Bot which handles games of codenames via Discord text chat
 */

 // Client ID (for invite links) - public so not in config.json
const CLIENT_ID = 693209558272966686;
//https://discordapp.com/oauth2/authorize?&client_id=693209558272966686&scope=bot&permissions=8

/*
 The ready event is vital, it means that only _after_ this will your bot start reacting to information received from Discord
*/
client.on('ready', () => {
  console.log(getDateStamp(),'Secret Hitler Bot - ready for action!');
});

// These will log errors and warnings in case of bot issues
//client.on("error", (e) => console.error(e));
//client.on("warn", (e) => console.warn(e));
//client.on("debug", (e) => console.info(e));


// Create an event listener for messages
client.on('message', message => {

  // Make a shallow copy of the game for easy referencing
  let theGame = message.channel.game;
  /*
    testing
  */
  //theGame.generateGameBoard();
  //message.channel.send(theGame.gameBoardCnv);

  /*
      --- JOIN COMMAND
  */
  let joinCommand = theGame.botData.prefix + ' join';
  if (message.content === joinCommand) {

    // TESTING HERE
    //theGame.generateGameBoard();




  }   // END JOIN COMMAND

  /*
      --- START COMMAND
  */
  // If the message is "hitler start"
  let startCommand = theGame.botData.prefix + ' start';
  if (message.content === startCommand) {




  } // END START COMMAND

  /*
      --- NOMINATE COMMAND
  */
  // If the message is "hitler nominate"
  let nominateCommand = theGame.botData.prefix + ' nominate';
  // If the message is "nominate", the author is the nominated president, and no chancellor nominated yet
  if (message.content.startsWith(nominateCommand)) {


  } // END NOMINATE COMMAND

  /*
      --- HELP COMMAND
  */
  // If the message is "hitler help"
  let helpCommand = theGame.botData.prefix + ' help';
  if (message.content.startsWith(helpCommand)) {


  }

  /*
      --- ISSUE COMMAND
  */
  // If the message is "hitler help"
  let issueCommand = theGame.botData.prefix + ' issue';
  if (message.content.startsWith(issueCommand)) {


  }



}); // End channel.message function

// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login(token);    // Update in config.json
