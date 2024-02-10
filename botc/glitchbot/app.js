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
import { StoryTeller } from './storyteller.js';
import { ScriptHelper } from './classes/ScriptHelper.js';
import { RolesHelper } from './classes/RolesHelper.js';

let SH = new ScriptHelper();
let RH = new RolesHelper();

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
    
    //============
    //start game
    //============
    if (name === "start") {
      const userId = req.body.member.user.id;
      //INIT THE PLAYER COUNT
      let playerCount = 5;
      
      let scriptName = 'trouble brewing';
      let selScript = data.options.filter( (opt) => { return opt.name === 'script'; });
      if(selScript[0].value){
        scriptName = selScript[0].value;
      }
      //console.log('script', scriptName);
      
      let selCount = data.options.filter( (opt) => { return opt.name === 'count'; });
      if(selCount[0].value){
        playerCount = parseInt(selCount[0].value);
      }
      //console.log('playerCount',playerCount);
      
      let st = new StoryTeller(playerCount, scriptName);
      let response = st.outputToDiscord(playerCount);
      
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: response,
        },
      });
    }
    
    //============
    //output script info
    //============
    if (name === "script") {
      let scriptName = 'trouble brewing';
      let selScript = data.options.filter( (opt) => { return opt.name === 'script'; });
      if(selScript[0].value){
        scriptName = selScript[0].value;
      }
      //console.log('script', scriptName);
      //let st = new StoryTeller(5, scriptName, true);
      //let response = st.outputScriptInfo(scriptName);
      //let response = StoryTeller.outputScriptInfo(scriptName);
      let response = SH.outputScriptInfo(scriptName);
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: response
        },
      });
    }
    
    
    //=================
    //output role info
    //=================
    if (name === "role") {
      let roleName = 'Imp';
      let selRole = data.options.filter( (opt) => { return opt.name === 'role'; });
      if(selRole[0].value){
        roleName = selRole[0].value;
      }
      console.log('role', roleName);
      let response = RH.outputRoleInfo(roleName);
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: response,
        },
      });
    }

    
    
  } //end APPLICATION_COMMANDs

});

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
