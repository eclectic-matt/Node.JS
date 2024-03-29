import "dotenv/config";
import express from "express";
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from "discord-interactions";
import {
  VerifyDiscordRequest,
  getRandomEmoji,
  DiscordRequest,
} from "./utils.js";
import { Client, GatewayIntentBits } from 'discord.js';
import { getShuffledOptions, getResult } from "./game.js";
import { StoryTeller } from './classes/StoryTeller.js';
import { ScriptHelper } from './classes/ScriptHelper.js';
import { RolesHelper } from './classes/RolesHelper.js';
import { EventLogger } from './classes/EventLogger.js';
import { GameManager } from './classes/GameManager.js';

let SH = new ScriptHelper();
let RH = new RolesHelper();
let Logger = new EventLogger(); 
let GM = new GameManager();


// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Store for in-progress games. In production, you'd want to use a DB
const activeGames = {};


/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post("/interactions", async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;
  
  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) 
  {
    const { name } = data;
    
    
    //======================
    // UTILITY FUNCTIONS
    //======================
    
    //output script info
    if (name === "script") {
      //GET USERNAME TO LOG
      let userName = getUsername(req.body);

      //DEFAULT SCRIPT NAME
      let scriptName = 'trouble brewing';
      //GET REQUESTED SCRIPT 
      let selScript = data.options.filter( (opt) => { return opt.name === 'script'; });
      if(selScript[0].value){
        scriptName = selScript[0].value;
      }
      //OUTPUT OPTION
      let outputOption = 'links';
      let selOption = data.options.filter( (opt) => { return opt.name === 'type'; });
      if(selOption[0].value){
        outputOption = selOption[0].value;
      }
      //LOG THIS REQUEST
      Logger.log('request', 'Script requested', { username: userName, script: scriptName, type: outputOption} );
      //PREPARE RESPONSE
      let response;
      switch(outputOption){
          case 'links':
          default:
            response = SH.outputScriptInfo(scriptName);
          break;
          case 'abilities':
            response = SH.outputScriptAbilities(scriptName);
          break;
          case 'firstNightOrder':
            response = SH.outputScriptFirstNightOrder(scriptName);
          break;
          case 'otherNightsOrder':
            response = SH.outputScriptOtherNightsOrder(scriptName);
          break;
      }
      //SEND RESPONSE BACK TO CHANNEL
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: response
        },
      });
    }
    
    //output role info
    if (name === "role") {
      //GET USERNAME TO LOG
      let userName = getUsername(req.body);
      //INIT ROLE NAME
      let roleName = 'Imp';
      let selRole = data.options.filter( (opt) => { return opt.name === 'role'; });
      if(selRole[0].value){
        roleName = selRole[0].value;
      }
      //LOG THIS REQUEST
      Logger.log('request', 'Role requested', { username: userName, role: roleName } );
      let response = RH.outputRoleInfo(roleName);
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: response,
        },
      });
    }
    
    
    
    
    
    //============
    //start game
    //============
    if (name === "start") {      
      //INIT THE PLAYER COUNT
      let playerCount = 5;
      
      let scriptName = 'trouble brewing';
      let selScript = data.options.filter( (opt) => { return opt.name === 'script'; });
      if(selScript[0].value){
        scriptName = selScript[0].value;
      }
      
      let selCount = data.options.filter( (opt) => { return opt.name === 'count'; });
      if(selCount[0].value){
        playerCount = parseInt(selCount[0].value);
      }
      
      //GET USERNAME TO LOG AND PREP GAME
      let userName = getUsername(req.body);
      let userId = getUserId(req.body);
      //LOG THIS REQUEST
      Logger.log('request', 'Game started', { username: userName, script: scriptName, playerCount: playerCount } );
      
      //EXTRACT SOME CORE DATA
      let channelId = req.body.channel.id;
      let gameId = GM.init({ channelId: channelId, userName: userName, userId: userId, script: scriptName, playerCount: playerCount})
      
      //let st = new StoryTeller(playerCount, scriptName);
      //let response = st.outputToDiscord(playerCount);
      /*return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: response,
        },
      });*/
      
      let heading = 'A ' + playerCount + '-player game of ' + scriptName;
      heading += " was started by <@" + userId + ">\n\n";
      heading += "Join the game by clicking below!";
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // SHOW THE JOIN BUTTON FOR THIS GAME
          content: heading,
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.BUTTON,
                  // Append the game ID to use later on
                  custom_id: `join_button_${gameId}`,
                  label: 'Join Game',
                  style: ButtonStyleTypes.PRIMARY,
                },
              ],
            },
          ],
        },
      });
      
    }
    
    
  } //end APPLICATION_COMMANDs
  
  
  /**
   * Handle requests from interactive components
   * See https://discord.com/developers/docs/interactions/message-components#responding-to-a-component-interaction
   */
  if (type === InteractionType.MESSAGE_COMPONENT) 
  {
    // custom_id set in payload when sending message component
    const componentId = data.custom_id;
    //PREPARE THIS USER OBJECT
    const user = {
      name: getUsername(req.body),
      id: getUserId(req.body)
    }
    
    //JOIN BUTTON CLICKED
    if (componentId.startsWith('join_button_')) {
      // get the associated game ID
      const gameId = componentId.replace('join_button_', '');
      console.log('Join button clicked', user);
      let game = GM.getGameById(gameId);
      //NO GAME TO JOIN?
      if(!game){
        res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'No valid game found - sorry about that :-/',
          },
        })
      }else{
        let players = GM.addPlayerToGame(game.id, user);
        //let pNames = players.map( (p) => { return p.name; }).join('\n* ');
        let pIds = players.map( (p) => { return "* <@" + p.id + '>'; }).join("\n");
        let emptySlots = parseInt(game.settings.playerCount - players.length);
        
        let startResponse = "<@" + user.id + "> joined the game";
        startResponse += "\n\n**Current Players:**\n";
        startResponse += pIds;
        startResponse += "\n\n";
        if(emptySlots > 0){
          startResponse += "Start the game now to fill the " + emptySlots + " empty slots with Bot Players!";
        }else{
          startResponse += "The game is ready to start!";
        }
        
        //DELETE PREVIOUS MESSAGES?
        //const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;
        //await DiscordRequest(endpoint, { method: 'DELETE' });

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            // SHOW THE START BUTTON FOR THIS GAME
            content: startResponse,
            components: [
              {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  {
                    type: MessageComponentTypes.BUTTON,
                    // Append the game ID to use later on
                    custom_id: `start_button_${gameId}`,
                    label: 'Start Game',
                    style: ButtonStyleTypes.SUCCESS,
                  },
                  {
                    type: MessageComponentTypes.BUTTON,
                    // Append the game ID to use later on
                    custom_id: `join_button_${gameId}`,
                    label: 'Join Game',
                    style: ButtonStyleTypes.PRIMARY,
                  },
                ],
              },
            ]
          }
        })
      }
    }
    
    if (componentId.startsWith('start_button_')) {
      res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Game starting...',
        },
      })
    }
  }

});

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});

//GET A DISCORD USERNAME (CHANNEL OR DM)
const getUsername = (body) => {
  //IF IN A CHANNEL
  if(body.member){
    //GET NAME FROM MEMBER OBJECT
    return body.member.user.global_name;
  }else{
    //GET FROM USER OBJECT
    return body.user.global_name;
  }
}
//GET A DISCORD USER ID (CHANNEL OR DM)
const getUserId = (body) => {
  //IF IN A CHANNEL
  if(body.member){
    //GET NAME FROM MEMBER OBJECT
    return body.member.user.id;
  }else{
    //GET FROM USER OBJECT
    return body.user.id;
  }
}
//GET A UNIQUE ID (CHANNEL + USERID)
const getUUID = (body) => {
  let channel = body.channel.id;
  let userId;
  if(body.member){
    userId = body.member.user.id;
  }else{
     userId = body.user.id; 
  }
  return channel + "_" + userId;
}