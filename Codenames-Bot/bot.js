'use strict';

/**
 * The Codenames Bot which handles games of codenames via Discord text chat
 */

// Import the discord.js module
const { Client, MessageEmbed } = require('discord.js');

// Create an instance of a Discord client
const client = new Client();

// Setup team and grid variables
const GRID_ROWS = 5;
const GRID_COLS = 5;
// The Discord IDs of spymasters 1 + 2
var sm1 = '';
var sm2 = '';
// The current team
var firstTeam = '';
// The grid for spymasters
var thisSpyGrid = '';
// The word grid for teams (not changed)
var thisWordGrid = '';
// The word grid after guesses (*BLUE* etc)
var thisCurrentWords = '';
// The array of words being loaded into the grid (also edited by guesses)
var wordArr = [];
// The grid template being used (from SPY_GRIDS array)
var gridTemplate = -1;
// The number of blue/red words left to find
var blueToFind = 0;
var redToFind = 0;
// Allow duplicate spymasters? Can force different spymasters if set to false
var dupSpymasterAllowed = true;
// Delete messages in the main channel to make the new game clear to players
var msgClearup = true;

// SPY GRIDS ARRAYS
// First row is a single element - the team to guess first
// The rest is the 5x5 grid of red/blue/innocent/assassins
const SPY_GRIDS = [
  [
    "RED",
    ["r","i","r","r","b"],
    ["i","a","b","r","b"],
    ["r","i","b","b","i"],
    ["b","i","r","r","i"],
    ["r","r","b","i","b"]
  ],
  [
    "BLUE",
    ["i","r","b","b","b"],
    ["b","i","a","i","r"],
    ["r","r","r","b","b"],
    ["b","b","r","i","b"],
    ["r","i","i","r","i"]
  ],
  [
    "RED",
    ["i","r","i","b","r"],
    ["b","r","r","i","r"],
    ["b","r","r","i","b"],
    ["a","r","b","b","i"],
    ["b","i","r","i","b"]
  ],
  [
    "BLUE",
    ["r","b","i","r","i"],
    ["r","r","i","b","r"],
    ["b","r","a","i","b"],
    ["i","b","b","r","i"],
    ["b","r","i","b","b"]
  ],
  [
    "BLUE",
    ["i","b","r","i","r"],
    ["r","a","i","r","b"],
    ["r","b","i","r","b"],
    ["b","b","r","r","b"],
    ["i","b","i","i","b"]
  ],
  [
    "RED",
    ["b","r","a","i","r"],
    ["i","r","b","r","i"],
    ["i","r","b","b","i"],
    ["b","b","r","i","b"],
    ["r","i","b","r","r"]
  ]
];
// The word list being used - spaced centrally and limited to 10 char words (Millionaire removed)
const WORD_LIST = [
  '   Duck   ','   Press  ','   Head   ','  Copper  ','  Mammoth ','  Dragon  ','   Palm   ','  Plastic ','   Line   ','  Stream  ',
  '   Pool   ','   Fall   ','  Knight  ','  Mercury ','   Crane  ','Helicopter',' Triangle ',' Australia','   Boom   ','    Kid   ',
  '    Lab   ','  Shadow  ',' New York ','    Bow   ','  Police  ','   Pass   ','   Hawk   ','   Hood   ','   Robin  ','   Match  ',
  '   Drill  ','   Organ  ','  Church  ','   Draft  ','   Court  ','  Cotton  ','    Eye    ','   Cross  ',' Ice Cream',
  '   Grace  ','   Table  ','   Calf   ','   Tube   ','   Horn   ','   Track  ','   Straw  ','   Hole   ','  Theater ','   Nurse  ',
  '  Phoenix ','  France  ','   Cell   ','   Cloak  ','  Capital ','  Strike  ',' Chocolate','    Jet   ','  Change  ','    Web   ',
  '  Jupiter ','    Key   ','  Octopus ','   Belt   ','   Thumb  ','  Diamond ','    Net   ','   Ghost  ','   Model  ','   Wave   ',
  '   Wake   ','  Engine  ','   Watch  ','  Bermuda ','    Van   ','  Tablet  ','   Pilot  ',' Horseshoe','   Agent  ',' Ambulance',
  '  Pumpkin ','   Fire   ','   Ruler  ','   Dice   ',' Scorpion ','  Needle  ','  Europe  ','   Death  ','   Lock   ',' Hospital ',
  '   Spell  ',' Contract ','  Bottle  ','   Laser  ','   Post   ','   Ball   ','   Mouse  ','    Mud   ','   Rock   '
]

// Get the current array of r/b/i/a into a markdown table
// Also sets the first team
function gridArrToMarkdown(arr){
  let output = '-----------------------------------------------\n';
  firstTeam = arr[0];
  for (let i = 1; i <= GRID_ROWS; i++){
    let thisRow = arr[i];
    for (let j = 0; j < GRID_COLS; j++){
      let thisEl = thisRow[j];
      switch (thisEl){
        case "r":
          redToFind++;
          output += '|    red   ';
          break;
        case "b":
          blueToFind++;
          output += '|   blue   ';
          break;
        case "i":
          output += '| innocent ';
          break;
        case "a":
          output += '| assassin ';
          break;
      } //End Switch
    }   //End j loop

    if (i !== GRID_ROWS){
        output += '|\n--------------------------------------------------------\n';
    }else{
        output += '|';
    }

  }     //End i loop
  return output;
}

// Function to shuffle array
//https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

// Now generate a random word grid (shuffled WORD_LIST)
// Put these words into a markdown table
function generateWordGrid(){
  let output = '-----------------------------------------------\n';
  wordArr = WORD_LIST;
  wordArr = shuffle(wordArr);
  let wordIndex = 0;
  for (let i = 1; i <= GRID_ROWS; i++){

    for (let j = 0; j < GRID_COLS; j++){
      output += '|' + wordArr[wordIndex];
      wordIndex++;
    }   //End j loop

    if (i !== GRID_ROWS){
        output += '|\n--------------------------------------------------------\n';
    }else{
      output += '|';
    }
  }     //End i loop

  return output;
}

// CHANGE the word grid once a guess has been registered
// Will amend the word guessed to the value of team (*BLUE*, *ASSASSIN* etc)
function updateWordGrid(index, team){
  let output = '-----------------------------------------------\n';
  wordArr[index] = team;
  let wordIndex = 0;
  for (let i = 1; i <= GRID_ROWS; i++){

    for (let j = 0; j < GRID_COLS; j++){
      output += '|' + wordArr[wordIndex];
      wordIndex++;
    }   //End j loop

    // On the last row, just close the row |, otherwise add a border line
    if (i !== GRID_ROWS){
        output += '|\n--------------------------------------------------------\n';
    }else{
      output += '|';
    }
  }     //End i loop

  // Wraps the word grid in 3 backticks for code formatting
  thisCurrentWords = '```' + output + '```';
}

// Switch teams over (should also add team colour here)
function changeTeam(){
  if (firstTeam === 'BLUE'){
    firstTeam = 'RED';
  }else{
    firstTeam = 'BLUE';
  }
}

// Reset the game variables so no guesses can be made
function resetGame(){
  sm1 = '';
  sm2 = '';
  firstTeam = '';
  thisSpyGrid = '';
  thisWordGrid = '';
  thisCurrentWords = '';
  wordArr = [];
  gridTemplate = -1;
  blueToFind = 0;
  redToFind = 0;
}

// Not yet implemented, currently just in the GUESS command section
function gameOver(team){

}


/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
client.on('ready', () => {
  console.log('Codenames Bot - ready for action!');
});

// Create an event listener for new guild members
client.on('guildMemberAdd', member => {
  // Send the message to a designated channel on a server:
  const channel = member.guild.channels.cache.find(ch => ch.name === 'member-log');
  // Do nothing if the channel wasn't found on this server
  if (!channel) return;
  // Send the message, mentioning the member
  channel.send(`Welcome to the server, ${member}!\n\nYou are in a room with the Codenames bot!\n\nSend a message with the following command to learn how to use the bot\n\n**!cn help**`);
});


// Create an event listener for messages
client.on('message', message => {


  /*
      --- START COMMAND
  */
  // If the message is "!cn start"
  if (message.content === '!cn start') {

    console.log('Start message received...');

    // If there is no ID for spymaster 1 registered
    if (sm1 === ''){

      // No spymaster - so set them here
      sm1 = message.author.id;

      // GENERATE SPY GRIDS
      // First, select a random grid template from SPY_GRIDS
      gridTemplate = Math.floor(Math.random() * SPY_GRIDS.length);
      // Then turn this into a markdown table
      thisSpyGrid = gridArrToMarkdown(SPY_GRIDS[gridTemplate]);

      // GENERATE WORD TABLE
      // Use the function to generate the word grid
      thisWordGrid = generateWordGrid();
      // And assign the fresh word grid to thisCurrentWords
      // which will be updated when guesses come in
      thisCurrentWords = thisWordGrid;

      let thisMsg = 'OK, you are the BLUE spymaster and here is the grid for this game:\n\n```' + thisSpyGrid + '```\n\nThe first team should be: ' + firstTeam + '\n\nHere is your word grid!\n\n```' + thisCurrentWords + '```';;
      //console.log(thisMsg);
      console.log('First spymaster added - grids set up!')

      // Most messages done as embeds so they stand out/have a colour border
      // This one is sent to the spymaster only
      const sm1embed = new MessageEmbed()
        // Set the title of the field
        .setTitle('Codenames Bot Help')
        // Set the color of the embed
        .setColor(0x0000ff)
        // Set the main content of the embed
        .setDescription(thisMsg);
      // Send message to the AUTHOR ONLY using:
      message.author.send(sm1embed);

      // Then send a message to the channel confirming this new spymaster
      const sm1regEmbed = new MessageEmbed()
        // Set the title of the field
        .setTitle('Spymaster 1 - BLUE TEAM - ' + message.author.username + ' - registered!')
        // Set the color of the embed
        .setColor(0x0000ff)
        // Set the main content of the embed
        .setDescription('We have our first spymaster - it\'s ' + message.author.username + '! Check your private messages from Codenames Bot for your word grid and spymaster grid!');
      // Send the embed to the same channel as the message
      message.channel.send(sm1regEmbed);


    // If there's no second spymaster yet
    }else if (sm2 === ''){

      // Check in case duplicate spymasters added
      if ( (sm1 === message.author.id) & (dupSpymasterAllowed === false)){
        let thisMsg = 'Sorry! You cannot be the spymaster for both teams! Get another player in this channel to step up to the plate!';
        // Send a message to the channel asking for another spymaster
        const sm2embed = new MessageEmbed()
          // Set the title of the field
          .setTitle('Codenames Bot Help')
          // Set the color of the embed
          .setColor(0xff0000)
          // Set the main content of the embed
          .setDescription(thisMsg);
        // Send the embed to the same channel as the message
        message.channel.send(sm2embed);

      // If not duplicate, or duplicates allowed...
      }else{

        // Set this player as spymaster 2
        sm2 = message.author.id;
        let thisMsg = 'OK, you are the RED spymaster and here is the grid for this game:\n\n```' + thisSpyGrid + '```\n\nThe first team should be: ' + firstTeam + '\n\nHere is your word grid!\n\n```' + thisCurrentWords + '```';

        // Message the new spymaster the grids
        const sm2embed = new MessageEmbed()
          // Set the title of the field
          .setTitle('Codenames Bot Help')
          // Set the color of the embed
          .setColor(0xff0000)
          // Set the main content of the embed
          .setDescription(thisMsg);
        // Send the embed to the same channel as the message
        message.author.send(sm2embed);

        // Then message the group with the new spymaster
        const sm2regEmbed = new MessageEmbed()
          // Set the title of the field
          .setTitle('Spymaster 2 - RED TEAM - ' + message.author.username + ' - registered!')
          // Set the color of the embed
          .setColor(0xff0000)
          // Set the main content of the embed
          .setDescription('We have our second spymaster - it\'s ' + message.author.username + '! Check your private messages from Codenames Bot for your word grid and spymaster grid!');
        // Send the embed to the same channel as the message
        message.channel.send(sm2regEmbed);

        // Then send the channel the word grid!
        let groupOutput = 'The spymasters have been chosen! Here is your word grid!\n\n```' + thisCurrentWords + '```' + '\n\n*The first team to make a guess should be the ' + firstTeam + ' team!*';

        // Set the colour of the embed
        let teamCol = 0x0000ff;
        if (firstTeam === 'RED'){
          teamCol = 0xff0000;
        }

        // Then send the word grid to the channel
        const groupEmbed = new MessageEmbed()
          // Set the title of the field
          .setTitle('Game Started! Word Grid Below')
          // Set the color of the embed
          .setColor(teamCol)
          // Set the main content of the embed
          .setDescription(groupOutput);
        // Send the embed to the same channel as the message
        message.channel.send(groupEmbed);

      }

    // ELSE - Spymasters have been assigned
    }else{

      console.log('Spymasters already assigned!');
      // Make an embed to let the channel know both spymasters have been assigned
      const assEmbed = new MessageEmbed()
        // Set the title of the field
        .setTitle('Codenames Bot Help')
        // Set the color of the embed
        .setColor(0xff0000)
        // Set the main content of the embed
        .setDescription('Both spymasters have been assigned already! You must reset to start a new game!');
      // Send the embed to the same channel as the message
      message.channel.send(assEmbed);
    }


  /*
      --- HELP COMMAND
  */
  }else if (message.content === '!cn help'){

    const helpEmbed = new MessageEmbed()
      // Set the title of the field
      .setTitle('Codenames Bot Help')
      // Set the color of the embed
      .setColor(0x00ff00)
      // Set the main content of the embed
      .setDescription('**Starting the game**\nTo start a game, decide who will be the two spymasters. They should each send a message saying\n**!cn start**\n\nThe bot will then send them the full grid for this game. The other players in the group will receive the word grid only, and should then make their guesses.\n\n**Making a guess**\nMake your guesses using the command\n**!cn guess <clue>**\n\n**Passing your turn**\nTo stop guessing, and allow the next team to take their turn, you should use the command\n**!cn next**\n\n**Reset the game**\nIf you need to reset the game for any reason, use the command\n**!cn reset**');
    // Send the embed to the same channel as the message
    message.channel.send(helpEmbed);


  /*
      --- NEXT COMMAND
  */
  }else if (message.content === '!cn next'){

    // The team have passed the turn over
    // TO DO - make sure the current team have made
    // AT LEAST ONE GUESS as per the game rules
    // Swap teams
    changeTeam();
    // Change the team colour for message embeds
    let thisCol = 0x0000ff;
    if (firstTeam === 'RED'){
      thisCol = 0xff0000;
    }
    // Show the embed for the next team
    const nextEmbed = new MessageEmbed()
      // Set the title of the field
      .setTitle('Next turn...')
      // Set the color of the embed
      .setColor(thisCol)
      // Set the main content of the embed
      .setDescription('The team has now changed over - the team making a guess now is ' + firstTeam);
    // Send the embed to the same channel as the message
    message.channel.send(nextEmbed);


  /*
      --- RESET COMMAND
  */
  }else if (message.content === '!cn reset'){

    // Reset game variables to defaults
    resetGame();
    // REMOVE 100 messages in the main channel to clean up
    if (msgClearup){
      message.channel.bulkDelete(100);
    }
    // Send a message to the channel confirming reset
    const resetEmbed = new MessageEmbed()
      // Set the title of the field
      .setTitle('Codenames Bot Reset')
      // Set the color of the embed
      .setColor(0x00ff00)
      // Set the main content of the embed
      .setDescription('Game reset!\n\nNow decide who will be the two new spymasters. They should each send a message saying "!cn start" and the bot will send them the full grid for this game\n\nThe players in the group will receive the word grid only, and should then make their guesses.');
    // Send the embed to the same channel as the message
    message.channel.send(resetEmbed);


  /*
      --- GUESS COMMAND
  */
  }else if (message.content.indexOf('guess') > 0){

    // If a guess was made before a game is running
    if (sm1 === '' || sm2 === ''){
      // No game running!
      message.channel.send('NO GAME RUNNING!\n\nRegister your spymasters using "!cn start" and then try again!');
      return;
    }
    //Split string to get guess
    let guessWord = message.content.slice(10,20);
    //Loop through wordArr to check match
    let elCount = GRID_COLS * GRID_ROWS;
    let foundIndex = -1;
    for (let i = 0; i < elCount; i++){
      let thisWord = wordArr[i];
      if (thisWord.indexOf(guessWord) > 0){
        // WORD FOUND!
        foundIndex = i;
        break;
      }
    }

    // If the guess word was found in the word grid
    if (foundIndex !== -1){

      // Calculate the row and column it was found in
      let foundRow = Math.floor(foundIndex / GRID_ROWS);
      let foundCol = foundIndex % GRID_COLS;
      // Get the team this word relates to (blue/red/assassin/innocent)
      let thisTeam = SPY_GRIDS[gridTemplate][foundRow + 1][foundCol];
      // Prepare the message embed
      let thisTitle = '';
      let thisCol = 0x00ff00;
      let thisDesc = '';

      /*
        This bit gets messy. It basically checks what team this guess related to
        This should be re-written for clarity as it's just ugly at the moment
        It will take the appropriate action (changing team, showing game over)
        Depending on if the guess was correct or incorrect etc
      */
      if (thisTeam === 'a'){
        // GAME OVER
        updateWordGrid(foundIndex, '*ASSASSIN*');
        thisCol = 0xff0000;
        let winTeam = 'RED';
        if (firstTeam === 'RED'){
          thisCol = 0x0000ff;
          winTeam = 'BLUE';
        }
        thisTitle = 'GAME OVER - ASSASSIN GUESSED - ' + winTeam + ' TEAM WINS!';
        thisDesc = 'Your guessed word - ' + guessWord + ' - was the assassin and you have lost the game!\n\n' + winTeam + ' TEAM WINS!\n\nUse "!cn start" to start a new game!\n\n' + thisCurrentWords;
        resetGame();

      }else if (thisTeam === 'i'){

        // INNOCENT
        updateWordGrid(foundIndex, '*INNOCENT*');
        thisTitle = 'INNOCENT GUESSED - ' + firstTeam + ' TEAM TURN ENDS!';
        changeTeam();
        thisCol = 0x0000ff;
        if (firstTeam === 'RED'){
          thisCol = 0xff0000;
        }
        thisDesc = 'Your guessed word - ' + guessWord + ' - was an innocent and your turn is now over!\n\nIt is now the ' + firstTeam + ' TEAM turn!\n\n' + thisCurrentWords;

      }else if (thisTeam === 'r'){

        // This word belonged to the red team, so check if RED are guessing...
        if (firstTeam === 'RED'){
          // CORRECT
          redToFind--;
          if (redToFind === 0){
            resetGame();
            const guessEmbed = new MessageEmbed()
              // Set the title of the field
              .setTitle('GAME OVER - RED TEAM WINS')
              // Set the color of the embed
              .setColor(0xff0000)
              // Set the main content of the embed
              .setDescription('The RED TEAM has won the game!\n\nStart a new game using "!cn reset".');
            // Send the embed to the same channel as the message
            message.channel.send(guessEmbed);
            return;
          }
          updateWordGrid(foundIndex, '   *RED*  ');
          thisCol = 0xff0000;
          thisTitle = 'CORRECT - ' + firstTeam + ' TEAM CAN CONTINUE!';
          thisDesc = 'Your guessed word - ' + guessWord + ' - was correct! You may make one more guess!\n\nYou still have ' + redToFind + ' words to guess!\n\n' + thisCurrentWords;
        }else{
          // INCORRECT
          redToFind--;
          if (redToFind === 0){
            resetGame();
            const guessEmbed = new MessageEmbed()
              // Set the title of the field
              .setTitle('GAME OVER - RED TEAM WINS')
              // Set the color of the embed
              .setColor(0xff0000)
              // Set the main content of the embed
              .setDescription('The RED TEAM has won the game!\n\nStart a new game using "!cn reset".');
            // Send the embed to the same channel as the message
            message.channel.send(guessEmbed);
            return;
          }
          updateWordGrid(foundIndex, '   *RED*  ');
          thisCol = 0xff0000;
          thisTitle = 'INCORRECT - ' + firstTeam + ' TEAM TURN ENDS!';
          changeTeam();
          thisDesc = 'Your guessed word - ' + guessWord + ' - belonged to the other team!\n\nThey now have ' + redToFind + ' words to guess!\n\nIt is now the ' + firstTeam + ' TEAM turn!\n\n' + thisCurrentWords;
        }

      }else if (thisTeam === 'b'){

        // This word belonged to the red team, so check if RED are guessing...
        if (firstTeam === 'BLUE'){
          // CORRECT
          blueToFind--;
          if (blueToFind === 0){
            resetGame();
            const guessEmbed = new MessageEmbed()
              // Set the title of the field
              .setTitle('GAME OVER - BLUE TEAM WINS')
              // Set the color of the embed
              .setColor(0x0000ff)
              // Set the main content of the embed
              .setDescription('The BLUE TEAM has won the game!\n\nStart a new game using "!cn start".');
            // Send the embed to the same channel as the message
            message.channel.send(guessEmbed);
            return;
          }
          updateWordGrid(foundIndex, '  *BLUE*  ');
          thisCol = 0x0000ff;
          thisTitle = 'CORRECT - ' + firstTeam + ' TEAM CAN CONTINUE!';
          thisDesc = 'Your guessed word - ' + guessWord + ' - was correct! You may make one more guess!\n\nYou still have ' + blueToFind + ' words to guess!\n\n' + thisCurrentWords;
        }else{
          // INCORRECT
          blueToFind--;
          if (blueToFind === 0){
            resetGame();
            const guessEmbed = new MessageEmbed()
              // Set the title of the field
              .setTitle('GAME OVER - BLUE TEAM WINS')
              // Set the color of the embed
              .setColor(0x0000ff)
              // Set the main content of the embed
              .setDescription('The BLUE TEAM has won the game!\n\nStart a new game using "!cn start".');
            // Send the embed to the same channel as the message
            message.channel.send(guessEmbed);
            return;
          }
          updateWordGrid(foundIndex, '  *BLUE*  ');
          thisCol = 0x0000ff;
          thisTitle = 'INCORRECT - ' + firstTeam + ' TEAM TURN ENDS!';
          changeTeam();
          thisDesc = 'Your guessed word - ' + guessWord + ' - belonged to the other team!\n\nThey now have ' + blueToFind + ' words to guess!\n\nIt is now the ' + firstTeam + ' TEAM turn!\n\n' + thisCurrentWords;
        }
      }

      // Now send the results of this guess to the channel
      const guessEmbed = new MessageEmbed()
        // Set the title of the field
        .setTitle(thisTitle)
        // Set the color of the embed
        .setColor(thisCol)
        // Set the main content of the embed
        .setDescription(thisDesc);
      // Send the embed to the same channel as the message
      message.channel.send(guessEmbed);

    }else{

      // The word was not found in the word grid!
      const notFoundEmbed = new MessageEmbed()
        // Set the title of the field
        .setTitle('Word Not Found - ' + guessWord)
        // Set the color of the embed
        .setColor(0x00ff00)
        // Set the main content of the embed
        .setDescription('This word was not found in the word grid! Try again, making sure that you capitalise the word and make sure there are no extra spaces.');
      // Send the embed to the same channel as the message
      message.channel.send(notFoundEmbed);
    }

  } // End GUESS command

}); // End channel.message function

// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login('YOUR_BOT_TOKEN');
