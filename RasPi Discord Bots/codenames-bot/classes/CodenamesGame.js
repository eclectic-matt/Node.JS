const c_colours = require('../constants/colours.js');
const c_canvas = require('../constants/canvasVars.js');
const c_words = require('../constants/wordsGrids.js');
const Discord = require('discord.js');
const Canvas = require('canvas');
const t_std = require('../../core-tools/coreStandardTools.js');

module.exports = class CodenamesGame {

  /*
    Initialise the game - sets up variables
    unique to the channel where it has been added
  */
  constructor (channel){

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
    this.grid.wordArr = c_words.WORD_LIST;
    // Randomise order and pick the first 25 words
    this.grid.wordArr = t_std.shuffle(this.grid.wordArr).slice(0,25);
    // Pick the grid template for this game
    this.grid.gridTemplate = Math.floor(Math.random() * c_words.SPY_GRIDS.length);

    this.grid.spyGrid = c_words.SPY_GRIDS[this.grid.gridTemplate];
    // And assign the fresh word grid to thisCurrentWords
    // which will be updated when guesses come in
    this.grid.currentWords = this.grid.wordArr.slice();
    //console.log('Spy Grid generated: ' + this.grid.spyGrid);

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

    const canvas = Canvas.createCanvas(c_canvas.CANVAS_WIDTH, c_canvas.CANVAS_HEIGHT);
  	const ctx = canvas.getContext('2d');

  	ctx.strokeStyle = c_colours.COL_TEXT;
    ctx.fillStyle = c_colours.COL_EMPTY;

    let wordIndex = 0;

    let GRID_WIDTH = c_canvas.CANVAS_WIDTH / c_canvas.GRID_COLS;
    let GRID_HEIGHT = c_canvas.CANVAS_HEIGHT / c_canvas.GRID_ROWS;

    // Loop to draw the boxes and add words
    for (var col = 0; col < c_canvas.GRID_COLS; col++){

      for (var row = 0; row < c_canvas.GRID_ROWS; row++){

        // The word in this box
        let thisWord = this.grid.wordArr[wordIndex];
        let thisCurrentWord = this.grid.currentWords[wordIndex];
        wordIndex++;
        if (thisCurrentWord === thisWord){
          // GREY BOX, NO TEAM
          ctx.fillStyle = c_colours.COL_EMPTY;
        }else{
          switch (thisCurrentWord){
            case 'r':
              ctx.fillStyle = c_colours.COL_RED;
              break;
            case 'b':
              ctx.fillStyle = c_colours.COL_BLUE;
              break;
            case 'i':
              ctx.fillStyle = c_colours.COL_INNOCENT;
              break;
            case 'a':
              ctx.fillStyle = c_colours.COL_ASSASSIN;
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
        ctx.fillStyle = c_colours.COL_TEXT;
        if (thisCurrentWord === 'a'){
          ctx.fillStyle = c_colours.COL_EMPTY;
        }
        ctx.font = '27px sans-serif';
        if (ctx.measureText(thisWord).width >= GRID_WIDTH - 20){
          //console.log(thisWord,' is too big so reducing font size');
          ctx.font = '22px sans-serif';
        }
        ctx.fillText(thisWord, x1 + Math.floor(GRID_WIDTH / 12), y1 + Math.floor(GRID_HEIGHT / 1.75));

      }

    }

  	let attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'word-grid.png');

    this.grid.teamCnv = attachment;

  }

  /*
    Set up the image for the Spymaster's word grid
  */
  outputSpymasterCanvasGrid(){

    const canvas = Canvas.createCanvas(c_canvas.CANVAS_WIDTH, c_canvas.CANVAS_HEIGHT);
  	const ctx = canvas.getContext('2d');

  	ctx.strokeStyle = c_colours.COL_TEXT;
    ctx.fillStyle = c_colours.COL_EMPTY;

    let wordIndex = 0;

    let GRID_WIDTH = c_canvas.CANVAS_WIDTH / c_canvas.GRID_COLS;
    let GRID_HEIGHT = c_canvas.CANVAS_HEIGHT / c_canvas.GRID_ROWS;

    // Loop to draw the boxes and add words
    for (var col = 0; col < c_canvas.GRID_COLS; col++){

      for (var row = 0; row < c_canvas.GRID_ROWS; row++){

        // The word in this box
        let thisWord = this.grid.wordArr[wordIndex];
        // The current word - either r/b/i/a or Clue
        let thisCurrentWord = this.grid.currentWords[wordIndex];
        wordIndex++;

        // If they are the same (no team) then empty colours
        if (thisCurrentWord === thisWord){
          // GREY BOX, NO TEAM
          ctx.fillStyle = c_colours.COL_EMPTY;

        // Else - it's currently r/b/i/a so change colours
        }else{
          switch (thisCurrentWord){
            case 'r':
              ctx.fillStyle = c_colours.COL_RED;
              break;
            case 'b':
              ctx.fillStyle = c_colours.COL_BLUE;
              break;
            case 'i':
              ctx.fillStyle = c_colours.COL_INNOCENT;
              break;
            case 'a':
              ctx.fillStyle = c_colours.COL_ASSASSIN;
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
        ctx.fillStyle = c_colours.COL_ASSASSIN;
        let thisTeamFull = 'ASSASSIN';
        //let thisTeamFull = '*****';
        switch (thisTeam){
          case 'r':
            ctx.fillStyle = c_colours.COL_RED;
            thisTeamFull = '   RED';
            break;
          case 'b':
            ctx.fillStyle = c_colours.COL_BLUE;
            thisTeamFull = '   BLUE';
            break;
          case 'i':
            ctx.fillStyle = c_colours.COL_INNOCENT;
            thisTeamFull = 'INNOCENT';
            break;
        }



        // Output the team
        ctx.font = '24px sans-serif';
        ctx.fillText(thisTeamFull, x1 + Math.floor(GRID_WIDTH / 8), y1 + Math.floor(GRID_HEIGHT / 4));
        // Output the word
        if (thisCurrentWord !== thisWord){
          ctx.fillStyle = c_colours.COL_TEXT;
        }
        if (thisCurrentWord === 'a'){
          ctx.fillStyle = c_colours.COL_EMPTY;
        }
        ctx.font = '27px sans-serif';
        if (ctx.measureText(thisWord).width >= GRID_WIDTH - 20){
          //console.log(thisWord,' is too big so reducing font size');
          ctx.font = '22px sans-serif';
        }
        ctx.fillText(thisWord, x1 + Math.floor(GRID_WIDTH / 12), y1 + Math.floor(GRID_HEIGHT / 1.75));

      }

    }

  	let attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'spy-grid.png');

    this.grid.spymasterCnv = attachment;

  }

  /*
    Update the word grid when a guess comes in
  */
  updateWordGrid(index, team){
    this.grid.currentWords[index] = team;
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



};
