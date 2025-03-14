import { createRequire } from "module";
const require = createRequire(import.meta.url);
const fs = require('fs');
const path = require("path");
//THE PATH TO THE GAMES FILE (USE "refresh" IN THE TERMINAL TO SEE CHANGES!)
const gamesFilePath = '/data/games.json';
const gamesTemplatePath = '/data/games.log.backup';

/**
  * Helper class to initialize and store games data.
  */
export const GameManager = /** @class */ (function () {
  
  function GameManager(){
    console.log('Starting the Games Manager...');
    let gamesData = this.getGamesData();
    //this.nextGameId = gamesData.games.length;
  }
  
  GameManager.prototype.init = function(options)
  {
    //FILTER STORED GAMES BY CHANNEL ID
    let channelGames = this.getGamesData().games.filter( (game) => { return game.channel === options.channelId});
    //console.log('current games', channelGames);
    //IF THERE ARE PREVIOUS GAMES IN THIS CHANNEL
    if(channelGames.length > 0){
      //CHECK FOR AN ACTIVE GAME (PREVENT DUPLICATE GAMES IN ONE CHANNEL)
      if(channelGames[channelGames.length - 1].stage !== "complete"){
        //RETURN CURRENT GAME ID
        return channelGames[channelGames.length - 1].id;
      }
    }
    
    //GET THE NEXT CHANNEL GAME ID
    let nextGameId = (channelGames.length === 0) ? 1 : channelGames.length;
    //MAKE UNIQUE ID (CHANNEL ID + NEXT GAME ID)
    let uuid = options.channelId + "_" + nextGameId;
    
    //AUTOMATICALLY JOIN ADDING PLAYER?
    let playerObj = {
      type: "human",
      id: options.userId,
      name: options.userName,
      channel: options.channelId
    };
    console.log('GM - init - New Player:', playerObj);
    
    //INIT GAME OBJECT
    let gameObj = {
      id: uuid,
      channel: options.channelId,
      channelGameId: nextGameId,
      stage: "init",
      settings: {
        script: options.script,
        playerCount: options.playerCount
      },
      result: {},
      players: [
        playerObj
      ],
      roles: [],
      history: [
        {
          event: "Initialised by " + options.userName,
          type: "init",
          time: Date.now()
        }
      ]
    };
    
    //SAVE THIS GAME OBJECT BACK TO THE STORE
    this.store(gameObj);
    //RETURN THE GAME ID
    return uuid;
  }
  
  GameManager.prototype.getGameById = function(id){
    let game = this.getGamesData().games.filter( (game) => { return game.id === id; });
    if(game.length === 1){
      return game[0];
    }else{
      return false;
    }
  }
  
  GameManager.prototype.addPlayerToGame = function(gameId, user){
    let game = this.getGameById(gameId);
    if(!game){
      return false;
    }
    let currentPlayerIds = game.players.map( (p) => { return p.id; });
    //DON'T ADD TWICE
    if(!currentPlayerIds.includes(user.id)){
      let playerObj = {
        type: "human",
        id: user.id,
        name: user.name
      };
      game.players.push(playerObj);
      //CHECK IF THIS INCREASES THE PLAYER COUNT
      if(game.players.length > game.settings.playerCount){
        //INCREASE THE PLAYER COUNT SO ROLES GENERATE CORRECTLY
        game.settings.playerCount++;
      }
      this.store(game);
    }
    //RETURN THE CURRENT PLAYERS ARRAY
    return game.players;
  }
  
  GameManager.prototype.startGame = function(gameId)
  {
    let game = this.getGameById(gameId);
    if(!game){
      return false;
    }
    let emptySlots = game.settings.playerCount - game.players.length;
    console.log('start game with pCount',game.settings.playerCount,'playersLen',game.players.length,'empty',emptySlots);
    if(emptySlots > 0){
      this.fillEmptySlotsWithBots(gameId);
    }
    //RELOAD GAME FROM STORE
    game = this.getGameById(gameId);
    game.stage = "started";
    //this.store(game);
    //return game.players;
    return game;
  }
  
  GameManager.prototype.fillEmptySlotsWithBots = function(gameId)
  {
    let game = this.getGameById(gameId);
    if(!game){
      return false;
    }
    let emptySlots = game.settings.playerCount - game.players.length;
    //console.log('Filling',emptySlots,'with bots');
    for(let i = 0; i < emptySlots; i++){
      this.addBotToGame(gameId);
    }
    //RELOAD THE GAME OBJECT FROM STORE
    /*game = this.getGameById(gameId);
    if(!game){
      return false;
    }*/
    //return game.players;
    return true;
  }
  
  GameManager.prototype.addBotToGame = function(gameId)
  {
    let game = this.getGameById(gameId);
    if(!game) return false;
    //GET NAMES OF EXISTING PLAYERS AND BOTS
    let namesArr = game.players.map( (p) => {
      return p.name;
    });
    //GENERATE A BOT NAME
    let botName = this.generateBotName(namesArr);
    let botId = "bot" + namesArr.length.toString();
    let botObj = {
      type: "bot",
      id: botId,
      name: botName
    }
    game.players.push(botObj);
    this.store(game);
    //RETURN THE CURRENT PLAYERS ARRAY
    return game.players;
  }
  
  GameManager.prototype.generateBotName = function(existingNamesArray)
  {
    //AN ARRAY OF NAME PREFIXES
    /*const prefixes = [
      'Happy',
      'Secret',
      'Sly',
      'Sneaky',
      'Crafty'
    ];*/
    //UNIQUE-ISH NAMES WITH ELECTRONIC/SYNTHETIC FLAVOURS
    const names = [
      'Botticelli',
      'Clock_Bot',
      'DaemonWithAnA',
      'Electricitee',
      'Flash_Bang',
      'GearHead',
      'Human_Adjacent',
      'Intel-Inside',
      'JumpLeads',
      'KangaRoot',
      'Legit_Hooman',
      'Master-Boot',
      'Not_Flesh',
      'Pro-Grammed',
      'Robono',
      'Synthetica',
      'TransisTOR',
      'U_Compoot'
    ];
    /*let generatedName = names[Math.floor(Math.random() * names.length)];
    if(existingNamesArray.includes(generatedName)){
      //ADD A PREFIX
      let addedPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      generatedName = addedPrefix + generatedName;
    }*/
    //RETURN NAMES IN ORDER
    let generatedName = names[existingNamesArray.length];
    return generatedName;
  }
  
  
  GameManager.prototype.getGamesData = function(){
    let gamesJSON = fs.readFileSync(
      //DEFINE RELATIVE PATH
      path.resolve(process.cwd() + gamesFilePath), 
      //OPTIONS
      { encoding: 'utf8', flag: 'r' }, 
      //CALLBACK
      (error, data) => {
        //REPORT ERROR IF FILE READ FAILED
        if (error) {
          console.log('Error loading',error);
          throw error;
        }else{
          return data;
        }
      }
    );
    return JSON.parse(gamesJSON.toString());
  }
  
  GameManager.prototype.deleteGame = function(gameId)
  {
    //let game = this.getGameById(gameId);
    let gamesJSON = this.getGamesData();
    let game = gamesJSON.games.find( (g) => {
      return g.id === gameId;
    });
    //CLEAR THIS GAME
    let nullObj = {
      id: game.id,
      stage: 'init'
    }
    this.store(game);
  }
  
  GameManager.prototype.resetGames = function() 
  {
    let template = fs.readFileSync(
      path.resolve(process.cwd() + gamesTemplatePath),
      { encoding: 'utf8', flag: 'r' },
      (error, data) => {
        //HANDLE ERROR
        return data;
      }
    );
    template = JSON.parse(template.toString());
    fs.writeFileSync(path.resolve(process.cwd() + gamesFilePath), JSON.stringify(template), (error) => {
      //HANDLE ERROR
    });
    
  }
  
  GameManager.prototype.store = function(gameData){
    //GET THE LOG JSON
    let gamesJSON = this.getGamesData();
    //GET THE CURRENT GAME (BY ID)
    let gameIndex = gamesJSON.games.find( (g) => {
      return g.id === gameData.id;
    });
    //REMOVE THE OLD STORED GAME DATA
    gamesJSON.games = gamesJSON.games.splice(gameIndex, 1);
    //console.log('before',gamesJSON.games);
    //PUSH THE NEW DATA TO GAMES ARRAY
    gamesJSON.games.push(gameData);
    //console.log('after', gamesJSON.games);
    //WRITE BACK TO FILE (USE "refresh" IN THE TERMINAL TO SEE CHANGES!)
    fs.writeFileSync(path.resolve(process.cwd() + gamesFilePath), JSON.stringify(gamesJSON), (error) => {
      if (error) {
        console.log('Error while writing games data:', error);
        return;
      }
      console.log('Data written successfully to disk');
    });
  }
  
    return GameManager;
})();