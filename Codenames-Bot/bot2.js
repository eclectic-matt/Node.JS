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
const TIMER_SECONDS = 30; // Checked sand timer - 90 seconds!?!

var sm1 = '';
var sm2 = '';
var firstTeam = '';
var thisSpyGrid = '';
var thisWordGrid = '';
var thisCurrentWords = '';
var wordArr = [];
var gridTemplate = -1;
var blueToFind = 0;
var redToFind = 0;
var dupSpymasterAllowed = true;
var timerSet = -1;

// Example HiddenGrid array
// First row is a single element
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

function updateWordGrid(index, team){
  let output = '-----------------------------------------------\n';
  wordArr[index] = team;
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
  thisCurrentWords = '```' + output + '```';
}

function changeTeam(){
  if (firstTeam === 'BLUE'){
    firstTeam = 'RED';
  }else{
    firstTeam = 'BLUE';
  }
}

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

// Not implemented yet - still in each message function
function gameOver(team){

}

// https://stackoverflow.com/a/53452241
// Wait function, user to aynchronously countdown timer
function wait(ms) {
  return new Promise((resolve, reject) => {
    if (timerSet > 0){
      setTimeout(() => {
        //console.log("Done waiting");
        resolve(ms)
      }, ms )
    }
  })
}

(async function AsyncTickTimer() {
  await wait(10000);
  console.log("Timer ticked down!")
})();

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
  // If the message is "cn start"
  if (message.content === '!cn start') {

    console.log('Start message received...');
    if (sm1 === ''){

      sm1 = message.author.id;

      // Generate spy grid
      gridTemplate = Math.floor(Math.random() * SPY_GRIDS.length);
      thisSpyGrid = gridArrToMarkdown(SPY_GRIDS[gridTemplate]);

      // Generate word grid
      thisWordGrid = generateWordGrid();
      thisCurrentWords = thisWordGrid;

      let thisMsg = 'OK, you are the BLUE spymaster and here is the grid for this game:\n\n```' + thisSpyGrid + '```\n\nThe first team should be: ' + firstTeam + '\n\nHere is your word grid!\n\n```' + thisCurrentWords + '```';;
      console.log(thisMsg);
      const sm1embed = new MessageEmbed()
        // Set the title of the field
        .setTitle('Codenames Bot Help')
        // Set the color of the embed
        .setColor(0x0000ff)
        // Set the main content of the embed
        .setDescription(thisMsg);
      // Send message to the author using:
      message.author.send(sm1embed);

      const sm1regEmbed = new MessageEmbed()
        // Set the title of the field
        .setTitle('Spymaster 1 - BLUE TEAM - ' + message.author.username + ' - registered!')
        // Set the color of the embed
        .setColor(0x0000ff)
        // Set the main content of the embed
        .setDescription('We have our first spymaster - it\'s ' + message.author.username + '! Check your private messages from Codenames Bot for your word grid and spymaster grid!');
      // Send the embed to the same channel as the message
      message.channel.send(sm1regEmbed);

    }else if (sm2 === ''){

      if ( (sm1 === message.author.id) & (dupSpymasterAllowed === false)){
        let thisMsg = 'Sorry! You cannot be the spymaster for both teams! Get another player in this channel to step up to the plate!';
        //console.log(thisMsg);
        const sm2embed = new MessageEmbed()
          // Set the title of the field
          .setTitle('Codenames Bot Help')
          // Set the color of the embed
          .setColor(0xff0000)
          // Set the main content of the embed
          .setDescription(thisMsg);
        // Send the embed to the same channel as the message
        message.channel.send(sm2embed);
      }else{
        sm2 = message.author.id;
        let thisMsg = 'OK, you are the RED spymaster and here is the grid for this game:\n\n```' + thisSpyGrid + '```\n\nThe first team should be: ' + firstTeam + '\n\nHere is your word grid!\n\n```' + thisCurrentWords + '```';
        //console.log(thisMsg);
        const sm2embed = new MessageEmbed()
          // Set the title of the field
          .setTitle('Codenames Bot Help')
          // Set the color of the embed
          .setColor(0xff0000)
          // Set the main content of the embed
          .setDescription(thisMsg);
        // Send the embed to the same channel as the message
        message.author.send(sm2embed);
      }

      const sm2regEmbed = new MessageEmbed()
        // Set the title of the field
        .setTitle('Spymaster 2 - RED TEAM - ' + message.author.username + ' - registered!')
        // Set the color of the embed
        .setColor(0xff0000)
        // Set the main content of the embed
        .setDescription('We have our second spymaster - it\'s ' + message.author.username + '! Check your private messages from Codenames Bot for your word grid and spymaster grid!');
      // Send the embed to the same channel as the message
      message.channel.send(sm2regEmbed);

      let groupOutput = 'The spymasters have been chosen! Here is your word grid!\n\n```' + thisCurrentWords + '```' + '\n\n*The first team to make a guess should be the ' + firstTeam + ' team!*';

      let teamCol = 0x0000ff;
      if (firstTeam === 'RED'){
        teamCol = 0xff0000;
      }
      const groupEmbed = new MessageEmbed()
        // Set the title of the field
        .setTitle('Game Started! Word Grid Below')
        // Set the color of the embed
        .setColor(teamCol)
        // Set the main content of the embed
        .setDescription(groupOutput);
      // Send the embed to the same channel as the message
      message.channel.send(groupEmbed);


    }else{
      console.log('Spymasters already assigned!');
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
        --- TIMER COMMAND
    */
  }else if (message.content === '!cn timer'){

      timerSet = TIMER_SECONDS;

      while (timerSet > 0){
        // Clock down in 10 sec intervals using aync wait function
        message.channel.send('Time left to guess - ' + timerSet + ' seconds!');
        /// ASYNC HERE
        AsyncTickTimer();
        timerSet -= 10;
      }

      // Should only get to this if no guess received!
      if (timerSet !== -1){
        changeTeam();
        message.channel.send('Timed out! It is now the ' + firstTeam + ' TEAM turn!');
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

    changeTeam();
    let thisCol = 0x0000ff;
    if (firstTeam === 'RED'){
      thisCol = 0xff0000;
    }
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

    resetGame();
    message.channel.bulkDelete(100);
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

    if (sm1 === ''){
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

    if (foundIndex !== -1){

      // Reset timer!
      timerSet = -1;
      let foundRow = Math.floor(foundIndex / GRID_ROWS);
      let foundCol = foundIndex % GRID_COLS;
      let thisTeam = SPY_GRIDS[gridTemplate][foundRow + 1][foundCol];
      let thisTitle = '';
      let thisCol = 0x00ff00;
      let thisDesc = '';
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
    // If match - check if r/b/a/i
      // if r and firstTeam = r
    // If no match -
  }
});

// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login('NjkxNDIyNTA0NjA2MjM2ODMy.Xnf2Aw.-B1VMSJqjA0I8Vvm1JosOso2kP0');
