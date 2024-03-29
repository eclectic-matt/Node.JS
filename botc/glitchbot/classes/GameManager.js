import { createRequire } from "module";
const require = createRequire(import.meta.url);
const fs = require('fs');
const path = require("path");
//THE PATH TO THE GAMES FILE (USE "refresh" IN THE TERMINAL TO SEE CHANGES!)
const gamesFilePath = '/data/games.json';

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
    console.log('current games', channelGames);
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
      name: options.userName
    };
    
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
      this.store(game);
    }
    //RETURN THE CURRENT PLAYERS ARRAY
    return game.players;
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
  
  GameManager.prototype.store = function(gameData){
    //GET THE LOG JSON
    let gamesJSON = this.getGamesData();
    //PUSH TO EVENTS ARRAY
    gamesJSON.games.push(gameData);
    
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