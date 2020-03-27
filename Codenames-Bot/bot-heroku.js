'use strict';

/**
 * The Codenames Bot which handles games of codenames via Discord text chat
 */

// Import the discord.js module
const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const Canvas = require('canvas');

// Create an instance of a Discord client
const client = new Client();

// Adding this in to try and keep service alive for Heroku
const http = require('http');

const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  //respondToRequest(req, res);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

// Setup team and grid variables
const GRID_ROWS = 5;
const GRID_COLS = 5;
const BLUE_GUESS      = 'b';
const RED_GUESS       = 'r';
const ASSASSIN_GUESS  = 'a';
const INNOCENT_GUESS  = 'i';

// Canvas variables
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;
const GRID_OFFSET = 50;
const GRID_WIDTH = CANVAS_WIDTH / GRID_COLS;
const GRID_HEIGHT = CANVAS_HEIGHT / GRID_ROWS;

const COL_RED = '#EF2227';        // RED, obvs
const COL_BLUE = '#2C3485';       // BLUE, duh
const COL_ASSASSIN = '#000000';   // BLACK
const COL_INNOCENT = '#cccc00';   // YELLOW
//const COL_EMPTY = '#777777';      // LIGHT GREY
const COL_EMPTY = '#ffffff';      // WHITE
//const COL_TEXT = '#ffffff';       // WHITE
const COL_TEXT = '#000000';       // BLACK

const TEXT_HELP = '**Game rules**\nTo learn the key rules for playing Codenames, use the command\n**!cn rules**\n\n**Starting the game**\nTo start a game, decide who will be the two Spymasters. They should each send a message saying\n**!cn start**\n\nThe bot will then send them the full grid for this game. The other players in the group will receive the word grid only, and should then make their guesses.\n\n**Making a guess**\nMake your guesses using the command\n**!cn guess <clue>**\n\n**Passing your turn**\nTo stop guessing, and allow the next team to take their turn, you should use the command\n**!cn pass**\n\n**Reset the game**\nIf you need to reset the game for any reason, use the command\n**!cn reset**\n\n**Set Options**\nAllows you to change options for your game session\n\n"!cn options -d" will allow/prevent the same player becoming both Spymasters (default: true)\n\n"!cn options -c" will allow players to use the "!cn clear" command (default: false, see below)\n\n"!cn options -m" will turn on/off message deleting when the game is reset (default: false)\n\n**Clear the channel**\nTo clear all the messages in this channel to clear the view for players, use the command\n**!cn clear**\n\nNote: if "!cn options -m" is set to true then the channel will be cleared of messages when you reset the game as well!';

const TEXT_RULES_ONE = '**Game Flow**\n\nStarting with the Spymaster for the team which has been told to go first, the Spymasters should take it in turns giving a single clue to their teammates.\n\nA clue must be in the form "Word: number" and this should point their teammates towards a word or words in the grid, and how many words relate to this clue.\n\nSpymasters are **not allowed to give out any more information** (visual, audible or otherwise) but they can clarify the clue/number or spell out the clue for their teammates.\n\nThe clues should point their teammates towards the words in the grid of their team colour. **The first team to guess all their words will win!**\n\nIf they correctly guess the word, they can continue until they guess an incorrect word from the grid (they may guess up to 1 more word than the number from the Spymaster\'s clue)\n\nYour team **must guess at least 1 word during your turn**\n\nThe Spymasters should try not to give clues which relate to:\n\n+ **The "Innocent" words** - as this will end your team\'s turn\n\n+ **The other team\'s words** - as this will end your team\'s turn and put the other team one step closer to winning!\n\n+ **The "Assasin" word** - avoid this **at all costs as your team will lose the game** if your teammates guess the Assassin word!\n\nThe team who goes first will have 9 words in the grid to guess - the team who goes second will have 8 words.';

const TEXT_RULES_TWO = 'There are a few firm rules about giving clues in Codenames:\n\n+ Your clue must be about the meaning of the words (i.e. not the letters in the words, the length of the words, or their position in the grid)\n\n+ Letters and numbers are valid clue words, as long as they refer to meanings (so you can use "X" to refer to Ray, but not Xylophone, or you can use "Eight" to refer to Ball, Figure and Octopus)\n\n* The number you say must refer to the number of words, not as a clue itself (i.e. you cannot say "Citrus: 8" for Lemon and Octopus)\n\n+ You cannot use foreign words as clues unless you would use the word in an English sentence (i.e. you cannot use "Apfel" as a clue for Apple or Berlin, but you could use "Strudel")\n\n+ You cannot use any form of the words visible in the grid (i.e. if Break is a word which has not yet been guessed, you cannot use "Broken", "Breakage" or "Breakdown")\n\n+ You also cannot say part of a compound word in the grid (i.e. if Horseshoe is in the grid and has not yet been guessed, then you cannot use "Horse", "Shoe", "Unhorsed" or "Snowshoes")\n\n+ You are allowed to use homophones, but you may wish to spell out the words to make it clear you are not giving a clue to the similar-sounding word and you are not using a different spelling of the same word (i.e. you can say "K-N-I-G-H-T" while Night is in the grid, but you cannot say "T-H-E-A-T-R-E" when Theater is there)';

const TEXT_RULES_THREE = 'You can agree some flexibility with your group around other rules, but you certainly CAN USE the clue "Land" when England is in the grid, and you CAN USE "Sparrow" when Row is in the grid! They are not compound words or other forms of those words!\n\nYou can also agree with your group whether you will allow Proper Names, hyphenated-words, or abbreviations/acronyms/initialisms like "PhD" or "CIA" (so long as the words within the acronym are not words in the grid that have not been guessed)\n\n**If you are ever in doubt** then privately ask the other Spymaster whether they would be happy using your planned clue - perhaps send them a direct message when using the Codenames Bot!';

const TEXT_RESET = 'Game reset!\n\nNow decide who will be the two new spymasters. They should each send a message saying "!cn start" and the bot will send them the full grid for this game\n\nThe players in the group will receive the word grid only, and should then make their guesses.';

var botStats = {};
botStats.channelsAdded = 0;
botStats.gamesLogged = -1;

class CodenamesGame {

  /*
    Initialise the game - sets up variables
    unique to the channel where it has been added
  */
  constructor (channel){

    // The number of channels the bot gets added to
    botStats.channelsAdded++;
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = ("0" + date_ob.getHours()).slice(-2);
    let minutes = ("0" + date_ob.getMinutes()).slice(-2);
    let seconds = date_ob.getSeconds();
    let dStr = hours + ":" + minutes + ":" + seconds + " " + date + "/" + month + "/" + year;
    console.log(dStr,' New game added - games logged so far = ',botStats.channelsAdded);

    // Added the channel data for reference (not used)
    this.channel = channel;
    // Holds data for Spymasters (sm1 and sm2)
    this.users = {};
    this.users.sm1 = '';
    this.users.sm2 = '';
    this.users.sm1user = '';
    this.users.sm2user = '';
    // Holds data for the word/spy grids
    this.grid = {};
    // The grid of teams r/b/i/a
    this.grid.thisSpyGrid = '';
    // The grid of words (unchanged during game)
    this.grid.thisWordGrid = '';
    // The grid of words and guesses (changed)
    this.grid.thisCurrentWords = '';
    // The array of words used for this game
    this.grid.wordArr = [];
    // The template spy grid being used
    this.grid.gridTemplate = -1;
    // The grid image for spymasters
    this.grid.spymasterCnv = '';
    // The grid image for teams
    this.grid.teamCnv = '';
    // The team data (guesses/leftToFind)
    this.teams = {};
    // The current team
    this.teams.currentTeam = '';
    // The number of words for the blue team to find
    this.teams.blueToFind = 0;
    // The number of words for the red team to find
    this.teams.redToFind = 0;
    // The number of guesses made this turn (at least 1 needed)
    this.teams.teamGuesses = 0;
    // A flag showing if the current game has ended
    this.teams.gameOverFlag = false;
    // The options for this channel's game
    this.options = {};
    // Duplicate spymasters allowed? Both as same user
    this.options.dupSpymasterAllowed = true;
    // Clear channel messages when resetting game?
    this.options.msgClearup = false;
    // Allow players to manually clear the channel
    this.options.clearAllowed = false;
    // Data for the embed messages
    this.embed = {};
    // The embed title, colour and description
    this.embed.thisTitle = '';
    this.embed.thisCol = '';
    this.embed.thisDesc = '';
  }

  /*
    Reset the game variables to start a new game
  */
  reset(){

    this.users = {};
    this.users.sm1 = '';
    this.users.sm2 = '';
    this.users.sm1user = '';
    this.users.sm2user = '';
    this.grid = {};
    this.grid.spyGrid = '';           // was thisSpyGrid
    this.grid.wordGrid = '';          // was thisWordGrid
    this.grid.currentWords = '';      // was thisCurrentWords
    this.grid.wordArr = [];
    this.grid.gridTemplate = -1;
    this.grid.spymasterCnv = '';
    this.grid.teamCnv = '';
    this.teams = {};
    this.teams.currentTeam = '';       // was firstTeam
    this.teams.blueToFind = 0;
    this.teams.redToFind = 0;
    this.teams.teamGuesses = 0;
    this.teams.gameOverFlag = false;
    this.embed = {};
    this.embed.title = '';              // thisTitle
    this.embed.col = '';                // thisCol
    this.embed.desc = '';               // thisDesc

  }

  /*
    Set up the word grid for this game
  */
  initialiseWordGrid(){
    // Make a copy of the word list array
    this.grid.wordArr = WORD_LIST;
    // Randomise order and pick the first 25 words
    this.grid.wordArr = shuffle(this.grid.wordArr).slice(0,25);
    // Pick the grid template for this game
    this.grid.gridTemplate = Math.floor(Math.random() * SPY_GRIDS.length);

    this.grid.spyGrid = SPY_GRIDS[this.grid.gridTemplate];
    // And assign the fresh word grid to thisCurrentWords
    // which will be updated when guesses come in
    this.grid.currentWords = this.grid.wordArr.slice();

    this.teams.currentTeam = this.grid.spyGrid[0];

    for (let i = 1; i < this.grid.spyGrid.length; i++){
      let rowArr = this.grid.spyGrid[i];
      for (let j = 0; j < rowArr.length; j++){
        let thisEl = rowArr[j];
        switch (thisEl){
          case 'r':
            this.teams.redToFind++;
            break;
          case 'b':
            this.teams.blueToFind++;
            break;
        }
      }
    }
  }

  /*
    Set up the image for the team's word grid
  */
  outputTeamsCanvasGrid(){

    const canvas = Canvas.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  	const ctx = canvas.getContext('2d');

  	ctx.strokeStyle = COL_TEXT;
    ctx.fillStyle = COL_EMPTY;

    let wordIndex = 0;

    //console.log('Using word grid', gridTemplate, thisSpyGrid);

    // Loop to draw the boxes and add words
    for (var col = 0; col < GRID_COLS; col++){

      for (var row = 0; row < GRID_ROWS; row++){

      // The word in this box
      let thisWord = this.grid.wordArr[wordIndex];
      let thisCurrentWord = this.grid.currentWords[wordIndex];
      wordIndex++;
      if (thisCurrentWord === thisWord){
        // GREY BOX, NO TEAM
        ctx.fillStyle = COL_EMPTY;
      }else{
        switch (thisCurrentWord){
          case 'r':
            ctx.fillStyle = COL_RED;
            break;
          case 'b':
            ctx.fillStyle = COL_BLUE;
            break;
          case 'i':
            ctx.fillStyle = COL_INNOCENT;
            break;
          case 'a':
            ctx.fillStyle = COL_ASSASSIN;
            break;
        }
      }

      // Draw grid box
      ctx.beginPath();
      let x1 = row * GRID_HEIGHT;
      let y1 = col * GRID_WIDTH;
      let x2 = (row + 1) * GRID_HEIGHT;
      let y2 = (col + 1) * GRID_WIDTH;
      //console.log('C' + col + 'R' + row,x1,y1,x2,y2);
      ctx.rect(x1, y1, x2, y2);
      ctx.fill();
      ctx.stroke();
      ctx.closePath();

      // Output the word
      ctx.fillStyle = COL_TEXT;
      if (thisCurrentWord === 'a'){
        ctx.fillStyle = COL_EMPTY;
      }
      ctx.font = '27px sans-serif';
      ctx.fillText(thisWord, x1 + Math.floor(GRID_WIDTH / 12), y1 + Math.floor(GRID_HEIGHT / 1.75));
    }

    }

  	const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'word-grid.png');

    this.grid.teamCnv = attachment;
    //return attachment;

  }

  /*
    Set up the image for the Spymaster's word grid
  */
  outputSpymasterCanvasGrid(){

    const canvas = Canvas.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  	const ctx = canvas.getContext('2d');

  	ctx.strokeStyle = COL_TEXT;
    ctx.fillStyle = COL_EMPTY;

    let wordIndex = 0;

    //console.log('Using spy grid', gridTemplate, thisSpyGrid);

    // Loop to draw the boxes and add words
    for (var col = 0; col < GRID_COLS; col++){

      for (var row = 0; row < GRID_ROWS; row++){

        // The word in this box
        let thisWord = this.grid.wordArr[wordIndex];
        // The current word - either r/b/i/a or Clue
        let thisCurrentWord = this.grid.currentWords[wordIndex];
        wordIndex++;

        // If they are the same (no team) then empty colours
        if (thisCurrentWord === thisWord){
          // GREY BOX, NO TEAM
          ctx.fillStyle = COL_EMPTY;

        // Else - it's currently r/b/i/a so change colours
        }else{
          switch (thisCurrentWord){
            case 'r':
              ctx.fillStyle = COL_RED;
              break;
            case 'b':
              ctx.fillStyle = COL_BLUE;
              break;
            case 'i':
              ctx.fillStyle = COL_INNOCENT;
              break;
            case 'a':
              ctx.fillStyle = COL_ASSASSIN;
              break;
          }
        }

        // Draw grid box
        ctx.beginPath();
        let x1 = row * GRID_HEIGHT;
        let y1 = col * GRID_WIDTH;
        let x2 = (row + 1) * GRID_HEIGHT;
        let y2 = (col + 1) * GRID_WIDTH;
        //console.log('C' + col + 'R' + row,x1,y1,x2,y2);
        ctx.rect(x1, y1, x2, y2);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        // Extra step for spymasters - will always get the full team list
        // This is grabbed from thisSpyGrid to set the text above the clues
        let thisTeam = this.grid.spyGrid[col + 1][row];
        ctx.fillStyle = COL_ASSASSIN;
        let thisTeamFull = 'ASSASSIN';
        //let thisTeamFull = '*****';
        switch (thisTeam){
          case 'r':
            ctx.fillStyle = COL_RED;
            thisTeamFull = '   RED';
            break;
          case 'b':
            ctx.fillStyle = COL_BLUE;
            thisTeamFull = '   BLUE';
            break;
          case 'i':
            ctx.fillStyle = COL_INNOCENT;
            thisTeamFull = 'INNOCENT';
            break;
        }



        // Output the team
        ctx.font = '24px sans-serif';
        ctx.fillText(thisTeamFull, x1 + Math.floor(GRID_WIDTH / 8), y1 + Math.floor(GRID_HEIGHT / 4));
        // Output the word
        if (thisCurrentWord !== thisWord){
          ctx.fillStyle = COL_TEXT;
        }
        if (thisCurrentWord === 'a'){
          ctx.fillStyle = COL_EMPTY;
        }
        ctx.font = '27px sans-serif';
        ctx.fillText(thisWord, x1 + Math.floor(GRID_WIDTH / 12), y1 + Math.floor(GRID_HEIGHT / 1.75));

      }

    }

  	const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'spy-grid.png');

    this.grid.spymasterCnv = attachment;
    //return attachment;

  }

  /*
    Update the word grid when a guess comes in
  */
  updateWordGrid(index, team){
    this.grid.currentWords[index] = team;
    //console.log('Current words updated: ',thisCurrentWords);
    //console.log('Word list is still: ', wordArr);
  }

  /*
   Switch teams over (should also add team colour here)
  */
  changeTeam(){
    this.teams.teamGuesses = 0;
    if (this.teams.currentTeam === 'BLUE'){
      this.teams.currentTeam = 'RED';
    }else{
      this.teams.currentTeam = 'BLUE';
    }
  }



}

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
  ],
  [
    "RED",
    ["r","r","b","i","b"],
    ["b","i","i","b","i"],
    ["i","r","r","b","r"],
    ["r","r","r","r","i"],
    ["i","b","b","a","b"]
  ],
  [
    "RED",
    ["r","b","i","i","b"],
    ["i","b","r","r","r"],
    ["b","r","b","b","a"],
    ["r","i","b","r","i"],
    ["r","b","i","i","r"]
  ],
  [
    "BLUE",
    ["r","i","r","b","i"],
    ["i","b","b","b","b"],
    ["b","r","r","i","r"],
    ["a","i","b","r","r"],
    ["i","b","r","i","b"]
  ],
  [
    "BLUE",
    ["b","r","i","b","b"],
    ["r","i","b","r","r"],
    ["i","b","b","i","r"],
    ["r","a","i","i","r"],
    ["b","b","r","b","i"]
  ],
  [
    "BLUE",
    ["r","b","i","b","i"],
    ["i","b","r","r","b"],
    ["b","r","a","r","i"],
    ["i","b","i","b","b"],
    ["b","r","i","r","r"]
  ],
  [
    "RED",
    ["r","r","b","b","i"],
    ["r","r","i","i","r"],
    ["b","i","i","r","r"],
    ["b","a","i","b","b"],
    ["b","r","b","i","r"]
  ]
];

const WORD_LIST = [
'Millionaire','Shakespeare','Scuba Diver','Hollywood','Screen','Play','Marble','Dinosaur','Cat','Pitch','Bond','Greece','Deck','Spike','Center','Vacuum','Unicorn','Undertaker','Sock','Loch Ness','Horse','Berlin','Platypus','Port','Chest','Box','Compound','Ship','Watch','Space','Flute','Tower','Death','Well','Fair','Tooth','Staff','Bill','Shot','King','Pan','Square','Buffalo','Scientist','Chick','Atlantis','Spy','Mail','Nut','Log','Pirate','Face','Stick','Disease','Yard','Mount','Slug','Dice','Lead','Hook','Carrot','Poison','Stock','Foot','Torch','Arm','Figure','Mine','Suit','Crane','Beijing','Mass','Microscope','Engine','China','Straw','Pants','Europe','Boot','Princess','Link','Luck','Olive','Palm','Teacher','Thumb','Octopus','Hood','Tie','Doctor','Wake','Cricket','New York','State','Bermuda','Park','Turkey','Chocolate','Trip','Racket','Bat','Jet','Bolt','Switch','Wall','Soul','Ghost','Time','Dance','Amazon','Grace','Moscow','Pumpkin','Antarctica','Whip','Heart','Table','Ball','Fighter','Cold','Day','Spring','Match','Diamond','Centaur','March','Roulette','Dog','Cross','Wave','Duck','Wind','Spot','Skyscraper','Paper','Apple','Oil','Cook','Fly','Cast','Bear','Pin','Thief','Trunk','America','Novel','Cell','Bow','Model','Knife','Knight','Court','Iron','Whale','Shadow','Contract','Mercury','Conductor','Seal','Car','Ring','Kid','Piano','Laser','Sound','Pole','Superhero','Revolution','Pit','Gas','Glass','Washington','Bark','Snow','Ivory','Pipe','Cover','Degree','Tokyo','Church','Pie','Tube','Block','Comic','Fish','Bridge','Moon','Part','Aztec','Smuggler','Train','Embassy','Pupil','Ice','Tap','Code','Shoe','Server','Club','Row','Pyramid','Bug','Penguin','Pound','Himalayas','Czech','Rome','Eye','Board','Bed','Point','France','Mammoth','Cotton','Robin','Net','Bugle','Maple','England','Field','Robot','Plot','Africa','Tag','Mouth','Kiwi','Mole','School','Sink','Pistol','Opera','Mint','Root','Sub','Crown','Back','Plane','Mexico','Cloak','Circle','Tablet','Australia','Green','Egypt','Line','Lawyer','Witch','Parachute','Crash','Gold','Note','Lion','Plastic','Web','Ambulance','Hospital','Spell','Lock','Water','London','Casino','Cycle','Bar','Cliff','Round','Bomb','Giant','Hand','Ninja','Rose','Slip','Limousine','Pass','Theater','Plate','Satellite','Ketchup','Hotel','Tail','Tick','Ground','Police','Dwarf','Fan','Dress','Saturn','Grass','Brush','Chair','Rock','Pilot','Telescope','File','Lab','India','Ruler','Nail','Swing','Olympus','Change','Date','Stream','Missile','Scale','Band','Angel','Press','Berry','Card','Check','Draft','Head','Lap','Orange','Ice Cream','Film','Washer','Pool','Shark','Van','String','Calf','Hawk','Eagle','Needle','Forest','Dragon','Key','Belt','Cap','Drill','Glove','Paste','Fall','Fire','Spider','Spine','Soldier','Horn','Queen','Ham','Litter','Life','Temple','Rabbit','Button','Game','Star','Jupiter','Vet','Night','Air','Battery','Genius','Shop','Bottle','Stadium','Alien','Light','Triangle','Lemon','Nurse','Drop','Track','Bank','Germany','Worm','Ray','Capital','Strike','War','Concert','Honey','Canada','Buck','Snowman','Beat','Jam','Copper','Beach','Bell','Leprechaun','Pheonix','Force','Boom','Fork','Alps','Post','Fence','Kangaroo','Mouse','Mug','Horseshoe','Scorpion','Agent','Helicopter','Hole','Organ','Jack','Charge'];

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

// https://stackoverflow.com/a/196991
function toTitleCase(str) {
  return str.replace(
      /\w\S*/g,
      function(txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
  );
}

/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
client.on('ready', () => {
  console.log('Codenames Bot - ready for action!');
  console.log(' ');
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

  if (message.channel.game == undefined){
    // Set up the game object in this channel
    console.log('New game setup');
    message.channel.game = new CodenamesGame(message.channel);
  }

  /*
      --- START COMMAND
  */
  // If the message is "!cn start"
  if (message.content === '!cn start') {

    if (message.channel.game.teams.gameOverFlag === true){
      // Game has ended, so reset ready for new game!
      message.channel.game.reset();
      if (message.channel.game.options.msgClearup){
        message.channel.bulkDelete(100);
      }
    }

    //console.log('Start message received...');

    // If there is no ID for spymaster 1 registered
    if (message.channel.game.users.sm1 === ''){

      //resetGame();
      message.channel.game.teams.gameOverFlag = false;
      botStats.gamesLogged++;

      // No spymaster - so set them here
      message.channel.game.users.sm1 = message.author.id;
      message.channel.game.users.sm1user = client.users.cache.get(message.channel.game.users.sm1);

      // GENERATE SPY GRIDS
      message.channel.game.initialiseWordGrid();
      message.channel.game.outputSpymasterCanvasGrid();
      message.channel.game.outputTeamsCanvasGrid();
      //spymasterCnv = outputSpymasterCanvasGrid();
      //teamCnv = outputTeamsCanvasGrid();

      let thisMsg = 'OK, you are the BLUE spymaster.\n\nThe first team to guess is the ' + message.channel.game.teams.currentTeam + ' TEAM\n\nHere is the grid for this game:';
      const sm1embed = new MessageEmbed()
        // Set the title of the field
        .setTitle('BLUE Spymaster')
        // Set the color of the embed
        .setColor(0x0000ff)
        // Set the main content of the embed
        .setDescription(thisMsg);
      // Send message to the AUTHOR ONLY using:
      message.author.send(sm1embed);
      // Then send the grid as an image
      message.author.send(`Spymaster grid`, message.channel.game.grid.spymasterCnv);

      //console.log('First spymaster added - grids set up!');

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
  }else if (message.channel.game.users.sm2 === ''){

      // Check in case duplicate spymasters added
      if ( (message.channel.game.sm1 === message.author.id) & (message.channel.game.options.dupSpymasterAllowed === false)){
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
        message.channel.game.users.sm2 = message.author.id;
        message.channel.game.users.sm2user = client.users.cache.get(message.channel.game.users.sm2);

        //console.log('Second spymaster added - game starting!');

        let thisMsg = 'OK, you are the RED spymaster.\n\nThe first team to guess is the ' + message.channel.game.teams.currentTeam + ' TEAM\n\nHere is the grid for this game:';
        const sm2embed = new MessageEmbed()
          // Set the title of the field
          .setTitle('RED Spymaster')
          // Set the color of the embed
          .setColor(0xff0000)
          // Set the main content of the embed
          .setDescription(thisMsg);
        // Send message to the AUTHOR ONLY using:
        message.author.send(sm2embed);
        // Then send the grid as an image
        message.author.send(`Spymaster grid`, message.channel.game.grid.spymasterCnv);

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
        let groupOutput = 'The spymasters have been chosen!\n\n*The first team to make a guess should be the ' + message.channel.game.teams.currentTeam + ' team!*';

        // Set the colour of the embed
        let teamCol = 0x0000ff;
        if (message.channel.game.teams.currentTeam === 'RED'){
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
        message.channel.send(message.channel.game.grid.teamCnv);

      }

    // ELSE - Spymasters have been assigned
    }else{

      //console.log('Spymasters already assigned!');
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
      .setDescription(TEXT_HELP);
    // Send the embed to the same channel as the message
    message.channel.send(helpEmbed);

  /*
      --- RULES COMMAND
  */
}else if (message.content === '!cn rules'){

    const rulesEmbed1 = new MessageEmbed()
      // Set the title of the field
      .setTitle('Codenames Game Rules')
      // Set the color of the embed
      .setColor(0x00ff00)
      // Set the main content of the embed
      .setDescription(TEXT_RULES_ONE);
    // Send the embed to the same channel as the message
    message.channel.send(rulesEmbed1);

    const rulesEmbed2 = new MessageEmbed()
      // Set the title of the field
      .setTitle('Spymaster Clue Rules')
      // Set the color of the embed
      .setColor(0x00ff00)
      // Set the main content of the embed
      .setDescription(TEXT_RULES_TWO);
      // Send the embed to the same channel as the message
      message.channel.send(rulesEmbed2);

      const rulesEmbed3 = new MessageEmbed()
        // Set the title of the field
        .setTitle('Don\'t Be Too Strict!')
        // Set the color of the embed
        .setColor(0x00ff00)
        // Set the main content of the embed
        .setDescription(TEXT_RULES_THREE);
        // Send the embed to the same channel as the message
        message.channel.send(rulesEmbed3);

  /*
    --- CLEAR COMMAND
  */
}else if (message.content === '!cn clear' && message.channel.game.options.clearAllowed){

    message.channel.bulkDelete(100);

  /*
      --- PASS COMMAND
  */
  }else if (message.content === '!cn pass' && message.channel.game.users.sm1 !== '' && message.channel.game.users.sm2 !== ''){

    if (message.channel.game.teams.teamGuesses === 0){
      // Teams must make at least 1 guess before passing!
      message.channel.game.embed.title = 'You must make a guess!';
      message.channel.game.embed.desc = 'Your team must make at least 1 guess on your turn before passing to the other team!\n\nPlease make a guess before play passes to the other team!';
      message.channel.game.embed.col = 0x00ff00;
      //console.log('Failed pass - guess must be made!');
      // Tell the players they must guess first
      const passEmbed = new MessageEmbed()
        // Set the title of the field
        .setTitle(message.channel.game.embed.title)
        // Set the color of the embed
        .setColor(message.channel.game.embed.col)
        // Set the main content of the embed
        .setDescription(message.channel.game.embed.desc);
      // Send the embed to the same channel as the message
      message.channel.send(passEmbed);

    }else{
      // The team have passed the turn over
      // TO DO - make sure the current team have made
      // AT LEAST ONE GUESS as per the game rules
      // Swap teams
      message.channel.game.changeTeam();
      //console.log('Guesses = ' + teamGuesses + '. Play passed to the ' + currentTeam + ' team!');
      // Change the team colour for message embeds
      message.channel.game.embed.col = 0x0000ff;
      if (message.channel.game.teams.currentTeam === 'RED'){
        message.channel.game.embed.col = 0xff0000;
      }
      message.channel.game.embed.title = 'Next turn...';
      message.channel.game.embed.desc = 'The team has now changed over - the team making a guess now is ' + message.channel.game.teams.currentTeam;

      // Show the embed for the next team
      const passEmbed = new MessageEmbed()
        // Set the title of the field
        .setTitle(message.channel.game.embed.title)
        // Set the color of the embed
        .setColor(message.channel.game.embed.col)
        // Set the main content of the embed
        .setDescription(message.channel.game.embed.desc);
      // Send the embed to the same channel as the message
      message.channel.send(passEmbed);
    }

  /*
      --- RESET COMMAND
  */
  }else if (message.content === '!cn reset'){

    // Reset game variables to defaults
    message.channel.game.reset();
    message.channel.game.teams.gameOverFlag = false;
    // REMOVE 100 messages in the main channel to clean up
    if (message.channel.game.options.msgClearup){
      message.channel.bulkDelete(100);
    }
    // Send a message to the channel confirming reset
    const resetEmbed = new MessageEmbed()
      // Set the title of the field
      .setTitle('Codenames Bot Reset')
      // Set the color of the embed
      .setColor(0x00ff00)
      // Set the main content of the embed
      .setDescription(TEXT_RESET);
    // Send the embed to the same channel as the message
    message.channel.send(resetEmbed);

  }else if (message.content.indexOf('!cn options') >= 0){

    // Get the remainder of the options string
    let optionUpdate = message.content.slice(11,20);
    //console.log('Options Update ',optionUpdate);

    let optionVar = optionUpdate.slice(0,3).replace(' ','');
    //console.log('Options Var ',optionVar);

    switch (optionVar){
      case '-d':
        // Duplicate Spymasters
        message.channel.game.options.dupSpymasterAllowed = !message.channel.game.options.dupSpymasterAllowed;
        message.channel.game.embed.desc = 'Duplicate Spymasters Allowed is now set to ' + message.channel.game.options.dupSpymasterAllowed;
        break;
      case '-m':
        // Message Clearing
        message.channel.game.options.msgClearup = !message.channel.game.options.msgClearup;
        message.channel.game.embed.desc = 'Clearing Messages on Reset Game is now set to ' + message.channel.game.options.msgClearup;
        break;
      case '-c':
        // Clear Command Allowed
        message.channel.game.options.clearAllowed = !message.channel.game.options.clearAllowed;
        message.channel.game.embed.desc = 'Clear Messages Command Allowed is now set to ' + message.channel.game.options.clearAllowed;
        break;
    }

    // Send a message to the channel confirming reset
    const optionsEmbed = new MessageEmbed()
      // Set the title of the field
      .setTitle('Codenames Bot Options Changed')
      // Set the color of the embed
      .setColor(0x00ff00)
      // Set the main content of the embed
      .setDescription(message.channel.game.embed.desc);
    // Send the embed to the same channel as the message
    message.channel.send(optionsEmbed);


  /*
      --- GUESS COMMAND
  */
}else if (message.content.indexOf('!cn guess') >= 0){

    // If a guess was made before a game is running
    if (message.channel.game.users.sm1 === '' || message.channel.game.users.sm2 === ''){
      // No game running!
      message.channel.send('NO GAME RUNNING!\n\nRegister your spymasters using "!cn start" and then try again!');
      return;
    }
    //Split string to get guess
    let guessWord = message.content.slice(10,20);
    //guessWord = guessWord.replace(' ','');
    let foundIndex = -1;
    if (guessWord === BLUE_GUESS || guessWord === RED_GUESS || guessWord === INNOCENT_GUESS || guessWord === ASSASSIN_GUESS){
      // You can't just guess a single letter!
    }else{
      guessWord = toTitleCase(guessWord);
      //Loop through wordArr to check match
      let elCount = GRID_COLS * GRID_ROWS;
      //console.log('Checking for "' + guessWord + '"');
      for (let i = 0; i < elCount; i++){
        let thisWord = message.channel.game.grid.currentWords[i];
        //console.log('Check against "' + thisWord + '"');
        if (thisWord.indexOf(guessWord) >= 0){
          // WORD FOUND!
          //console.log('Match');
          foundIndex = i;
          break;
        }
      }
    }

    // If the guess word was found in the word grid
    if (foundIndex !== -1){

        // Increment the guesses
        message.channel.game.teams.teamGuesses++;
        // Calculate the row and column it was found in
        let foundRow = Math.floor(foundIndex / GRID_ROWS);
        let foundCol = foundIndex % GRID_COLS;
        // Get the team this word relates to (blue/red/assassin/innocent)
        let thisTeam = SPY_GRIDS[message.channel.game.grid.gridTemplate][foundRow + 1][foundCol];
        // Prepare the message embed
        message.channel.game.embed.title = '';
        message.channel.game.embed.col = 0x00ff00;
        message.channel.game.embed.desc = '';

        /*
          This bit gets messy. It basically checks what team this guess related to
          This should be re-written for clarity as it's just ugly at the moment
          It will take the appropriate action (changing team, showing game over)
          Depending on if the guess was correct or incorrect etc
        */
        if (thisTeam === ASSASSIN_GUESS){

          // GAME OVER
          //console.log('Updating word grid at ', foundIndex,' to "a"');
          message.channel.game.updateWordGrid(foundIndex, ASSASSIN_GUESS);
          //spymasterCnv = outputSpymasterCanvasGrid();
          message.channel.game.outputSpymasterCanvasGrid();
          message.channel.game.users.sm1user.send(message.channel.game.grid.spymasterCnv);
          // Send just the new word grid to sm2
          message.channel.game.users.sm2user.send(message.channel.game.grid.spymasterCnv);
          // Send a break to space it out
          //sm2user.send('\n\n \n\n');
          message.channel.game.embed.col = 0xff0000;
          let winTeam = 'RED';
          if (message.channel.game.teams.currentTeam === 'RED'){
            message.channel.game.embed.col = 0x0000ff;
            winTeam = 'BLUE';
          }
          message.channel.game.embed.title = 'GAME OVER - ASSASSIN GUESSED - ' + winTeam + ' TEAM WINS!';
          message.channel.game.embed.desc = 'Your guessed word - ' + guessWord + ' - was the assassin and you have lost the game!\n\n' + winTeam + ' TEAM WINS!\n\nUse "!cn start" to start a new game!\n\n';
          const guessEmbed = new MessageEmbed()
            // Set the title of the field
            .setTitle(message.channel.game.embed.title)
            // Set the color of the embed
            .setColor(message.channel.game.embed.col)
            // Set the main content of the embed
            .setDescription(message.channel.game.embed.desc);
          // Send the embed to the same channel as the message
          message.channel.send(guessEmbed);
          // Just send the whole spymaster grid to the channel!
          message.channel.send(message.channel.game.grid.spymasterCnv);
          //message.channel.send(teamCnv);
          //resetGame();
          message.channel.game.teams.gameOverFlag = true;

        }else if (thisTeam === INNOCENT_GUESS){

          // INNOCENT
          message.channel.game.updateWordGrid(foundIndex, INNOCENT_GUESS);
          //spymasterCnv = outputSpymasterCanvasGrid();
          message.channel.game.outputSpymasterCanvasGrid();
          //teamCnv = outputTeamsCanvasGrid();
          message.channel.game.outputTeamsCanvasGrid();
          //console.log('Innocent guessed - sending new grids now');
          message.channel.game.users.sm1user.send(message.channel.game.grid.spymasterCnv);
          // Send just the new word grid to sm2
          message.channel.game.users.sm2user.send(message.channel.game.grid.spymasterCnv);
          message.channel.game.embed.title = 'INNOCENT GUESSED - ' + message.channel.game.teams.currentTeam + ' TEAM TURN ENDS!';
          message.channel.game.changeTeam();
          message.channel.game.embed.col = 0x0000ff;
          if (message.channel.game.teams.currentTeam === 'RED'){
            message.channel.game.embed.col = 0xff0000;
          }
          message.channel.game.embed.desc = 'Your guessed word - ' + guessWord + ' - was an innocent and your turn is now over!\n\nIt is now the ' + message.channel.game.teams.currentTeam + ' TEAM turn!\n\n';
          // Now send the results of this guess to the channel
          const guessEmbed = new MessageEmbed()
            // Set the title of the field
            .setTitle(message.channel.game.embed.title)
            // Set the color of the embed
            .setColor(message.channel.game.embed.col)
            // Set the main content of the embed
            .setDescription(message.channel.game.embed.desc);
          // Send the embed to the same channel as the message
          message.channel.send(guessEmbed);
          message.channel.send(message.channel.game.grid.teamCnv);

        }else if (thisTeam === RED_GUESS){

          message.channel.game.teams.redToFind--;
          message.channel.game.updateWordGrid(foundIndex, RED_GUESS);
          //spymasterCnv = outputSpymasterCanvasGrid();
          message.channel.game.outputSpymasterCanvasGrid();
          //teamCnv = outputTeamsCanvasGrid();
          message.channel.game.outputTeamsCanvasGrid();
          message.channel.game.users.sm1user.send(message.channel.game.grid.spymasterCnv);
          // Send just the new word grid to sm2
          message.channel.game.users.sm2user.send(message.channel.game.grid.spymasterCnv);

          // This word belonged to the red team, so check if RED are guessing...
          if (message.channel.game.teams.currentTeam === 'RED'){

            // CORRECT

            if (message.channel.game.teams.redToFind === 0){

              // GAME OVER!
              const guessEmbed = new MessageEmbed()
                // Set the title of the field
                .setTitle('GAME OVER - RED TEAM WINS')
                // Set the color of the embed
                .setColor(0xff0000)
                // Set the main content of the embed
                .setDescription('The RED TEAM has won the game!\n\nStart a new game using "!cn reset".');
              // Send the embed to the same channel as the message
              message.channel.send(guessEmbed);
              message.channel.send(message.channel.game.grid.spymasterCnv);
              //resetGame();
              message.channel.game.teams.gameOverFlag = true;

            }else {

              message.channel.game.embed.col = 0xff0000;
              message.channel.game.embed.title = 'CORRECT - ' + message.channel.game.teams.currentTeam + ' TEAM CAN CONTINUE!';
              message.channel.game.embed.desc = 'Your guessed word - ' + guessWord + ' - was correct! You may make one more guess!\n\nYou still have ' + message.channel.game.teams.redToFind + ' words to guess!\n\n';
              // Now send the results of this guess to the channel
              const guessEmbed = new MessageEmbed()
                // Set the title of the field
                .setTitle(message.channel.game.embed.title)
                // Set the color of the embed
                .setColor(message.channel.game.embed.col)
                // Set the main content of the embed
                .setDescription(message.channel.game.embed.desc);
              // Send the embed to the same channel as the message
              message.channel.send(guessEmbed);
              message.channel.send(message.channel.game.grid.teamCnv);

            }

          }else{
            // INCORRECT

            if (message.channel.game.teams.redToFind === 0){

              const guessEmbed = new MessageEmbed()
                // Set the title of the field
                .setTitle('GAME OVER - RED TEAM WINS')
                // Set the color of the embed
                .setColor(0xff0000)
                // Set the main content of the embed
                .setDescription('The RED TEAM has won the game!\n\nStart a new game using "!cn start".');
              // Send the embed to the same channel as the message
              message.channel.send(guessEmbed);
              message.channel.send(message.channel.game.grid.spymasterCnv);
              //resetGame();
              message.channel.game.teams.gameOverFlag = true;

            }else {

              message.channel.game.embed.col = 0xff0000;
              message.channel.game.embed.title = 'INCORRECT - ' + message.channel.game.teams.currentTeam + ' TEAM TURN ENDS!';
              message.channel.game.changeTeam();
              message.channel.game.embed.desc = 'Your guessed word - ' + guessWord + ' - belonged to the other team!\n\nThey now have ' + message.channel.game.teams.redToFind + ' words to guess!\n\nIt is now the ' + message.channel.game.teams.currentTeam + ' TEAM turn!\n\n';
              // Now send the results of this guess to the channel
              const guessEmbed = new MessageEmbed()
                // Set the title of the field
                .setTitle(message.channel.game.embed.title)
                // Set the color of the embed
                .setColor(message.channel.game.embed.col)
                // Set the main content of the embed
                .setDescription(message.channel.game.embed.desc);
              // Send the embed to the same channel as the message
              message.channel.send(guessEmbed);
              message.channel.send(message.channel.game.grid.teamCnv);

            }

          }

        }else if (thisTeam === BLUE_GUESS){

          message.channel.game.teams.blueToFind--;
          message.channel.game.updateWordGrid(foundIndex, BLUE_GUESS);
          //spymasterCnv = outputSpymasterCanvasGrid();
          message.channel.game.outputSpymasterCanvasGrid();
          //teamCnv = outputTeamsCanvasGrid();
          message.channel.game.outputTeamsCanvasGrid();
          message.channel.game.users.sm1user.send(message.channel.game.grid.spymasterCnv);
          // Send just the new word grid to sm2
          message.channel.game.users.sm2user.send(message.channel.game.grid.spymasterCnv);


          if (message.channel.game.teams.currentTeam === 'BLUE'){

            // CORRECT

            if (message.channel.game.teams.blueToFind === 0){

              // GAME OVER!
              const guessEmbed = new MessageEmbed()
                // Set the title of the field
                .setTitle('GAME OVER - BLUE TEAM WINS')
                // Set the color of the embed
                .setColor(0x0000ff)
                // Set the main content of the embed
                .setDescription('The BLUE TEAM has won the game!\n\nStart a new game using "!cn start".');
              // Send the embed to the same channel as the message
              message.channel.send(guessEmbed);
              message.channel.send(message.channel.game.grid.spymasterCnv);
              //resetGame();
              message.channel.game.teams.gameOverFlag = true;

            }else{


              message.channel.game.embed.col = 0x0000ff;
              message.channel.game.embed.title = 'CORRECT - ' + message.channel.game.teams.currentTeam + ' TEAM CAN CONTINUE!';
              message.channel.game.embed.desc = 'Your guessed word - ' + guessWord + ' - was correct! You may make one more guess!\n\nYou still have ' + message.channel.game.teams.blueToFind + ' words to guess!\n\n';
              // Now send the results of this guess to the channel
              const guessEmbed = new MessageEmbed()
                // Set the title of the field
                .setTitle(message.channel.game.embed.title)
                // Set the color of the embed
                .setColor(message.channel.game.embed.col)
                // Set the main content of the embed
                .setDescription(message.channel.game.embed.desc);
              // Send the embed to the same channel as the message
              message.channel.send(guessEmbed);
              message.channel.send(message.channel.game.grid.teamCnv);

            }

        }else{

          // INCORRECT

          if (message.channel.game.teams.blueToFind === 0){

            // GAME OVER!
            const guessEmbed = new MessageEmbed()
              // Set the title of the field
              .setTitle('GAME OVER - BLUE TEAM WINS')
              // Set the color of the embed
              .setColor(0x0000ff)
              // Set the main content of the embed
              .setDescription('The BLUE TEAM has won the game!\n\nStart a new game using "!cn start".');
            // Send the embed to the same channel as the message
            message.channel.send(guessEmbed);
            message.channel.send(message.channel.game.grid.spymasterCnv);
            //resetGame();
            message.channel.game.teams.gameOverFlag = true;

          }else{

              message.channel.game.embed.col = 0x0000ff;
              message.channel.game.embed.title = 'INCORRECT - ' + message.channel.game.teams.currentTeam + ' TEAM TURN ENDS!';
              message.channel.game.changeTeam();
              message.channel.game.embed.desc = 'Your guessed word - ' + guessWord + ' - belonged to the other team!\n\nThey now have ' + message.channel.game.teams.blueToFind + ' words to guess!\n\nIt is now the ' + message.channel.game.teams.currentTeam + ' TEAM turn!\n\n';
              // Now send the results of this guess to the channel
              const guessEmbed = new MessageEmbed()
                // Set the title of the field
                .setTitle(message.channel.game.embed.title)
                // Set the color of the embed
                .setColor(message.channel.game.embed.col)
                // Set the main content of the embed
                .setDescription(message.channel.game.embed.desc);
              // Send the embed to the same channel as the message
              message.channel.send(guessEmbed);
              message.channel.send(message.channel.game.grid.teamCnv);

          }

        }

      }

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
