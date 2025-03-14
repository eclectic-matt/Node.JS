import { ReadableStream } from "node:stream/web";
this.global.ReadableStream = ReadableStream;

import "dotenv/config";
import express from "express";
//IMPORT DISCORD INTERACTIONS
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from "discord-interactions";
//IMPORT UTILS
import {
  getRandomEmoji,
  outputDiscordName,
  getUsername,
  getUserId,
  getUUID,
} from "./utils.js";
//IMPORT DISCORD.JS UTILITIES
import { Client, GatewayIntentBits } from 'discord.js';
//IMPORT MY DISCORD MANAGER
import { DiscordManager } from './messages/DiscordManager.js';
import { EndpointManager } from './messages/EndpointManager.js';
import { StoryTeller } from './classes/StoryTeller.js';
import { ScriptHelper } from './classes/ScriptHelper.js';
import { RolesHelper } from './classes/RolesHelper.js';
import { EventLogger } from './classes/EventLogger.js';
import { GameManager } from './classes/GameManager.js';

//INITIALIZE INSTANCES (NOT STORYTELLER WHICH IS GAME-SPECIFIC)
let SH = new ScriptHelper();
let RH = new RolesHelper();
let Logger = new EventLogger(); 
let GM = new GameManager();
let DM = new DiscordManager();
let EM = new EndpointManager();

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: DM.VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Store for in-progress games. In production, you'd want to use a DB
const activeGames = {};



// KEEP THIS PROJECT ALIVE USING A SET INTERVAL OF 60s
//NOTE: THIS WILL COUNT TOWARDS THE PROJECT'S "ACTIVE HOURS"
//BUT YOU GET 1000hrs PER MONTH AND 31*24 = 744 HOURS

const callbackFunc = () => {
  console.log('Keeping alive');
}
const timeoutObj = setInterval(callbackFunc, 60000);
const intervalId = timeoutObj[Symbol.toPrimitive](); //intervalId is an interger

// Later you can clear the timer by calling clearInterval with the intervalId like,
//clearInterval(intervalId);



/*
import { DatabaseManager } from './mongodb/DatabaseManager.js';
let DataMgr = new DatabaseManager();
DataMgr.run().catch(console.dir);
*/


/*
//MONGO DB INITALIZATION
import { MongoClient, ServerApiVersion } from "mongodb";
const uri = `mongodb+srv://${process.env.MONGO_BOTCBot_USER}:${process.env.MONGO_BOTCBot_PASS}@botc-bot.rstguck.mongodb.net/?retryWrites=true&w=majority&appName=BOTC-Bot`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
*/





/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post("/interactions", async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;
  
  //DEBUG - GET CURRENT IP 
  //const ipAddress = req.socket.remoteAddress; // Current IP  ::ffff:127.0.0.1

  const ipAddress = req.header('x-forwarded-for');
  console.log('Current IP ', ipAddress);

  
  
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
    //GET NAME FROM DATA (THE SLASH COMMAND)
    const { name } = data;
    //VARIABLES USED IN MULTIPLE RESPONSES
    let userName = getUsername(req.body);
    let response = '';
    let scriptName = 'trouble brewing';
    
    //======================
    // UTILITY FUNCTIONS
    //======================
    
    switch(name)
    {
      //TESTING 
      case 'test':
        response += 'DIRECT MESSAGE';
        let user = {
          id: getUserId(req.body),
          name: userName,
          channel: req.body.channel_id,
        }
        DM.sendDirectMessage(user, response);
      break;
      //GET SCRIPT INFO
      case 'script':
        //GET USERNAME TO LOG
        //let userName = getUsername(req.body);
        //GET SCRIPT NAME FROM MESSAGE OPTIONS
        scriptName = DM.getMessageOptionByName(data, 'script') || 'trouble brewing';
        //GET OUTPUT TYPE FROM MESSAGE OPTIONS
        let outputOption = DM.getMessageOptionByName(data, 'type') || 'links';
        //LOG THIS REQUEST
        Logger.log('request', 'Script requested', { username: userName, script: scriptName, type: outputOption } );
        //PREPARE RESPONSE
        //let response;
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
        return res.send(DM.generateTextMessage(response));
      break;
      //GET ROLE INFORMATION
      case 'role':
        //GET USERNAME TO LOG
        //let userName = getUsername(req.body);
        //GET ROLE NAME FROM OPTIONS
        let roleName = DM.getMessageOptionByName(data, 'role') || 'Imp';
        //LOG THIS REQUEST
        Logger.log('request', 'Role requested', { username: userName, role: roleName } );
        //GENERATE RESPONSE FROM THE ROLE HELPER CLASS
        response = RH.outputRoleInfo(roleName);
        //RETURN THE GENERATED RESPONSE
        return res.send(DM.generateTextMessage(response));
      break;
      //USE PUBLIC ABILITY
      case 'public':
        //GET GAME IN THIS CHANNEL?
        //CHECK GAME ACTIVE
        //CHECK GAME IN DAY PHASE
        //RESPOND WITH PLAYER CHOICES
        let role = DM.getMessageOptionByName(data, 'role');
        return res.send(DM.generateTextMessage('You used the **' + role + '** ability!'));
      break;
      //RESET GAMES
      case 'reset':
        //RESET GAMES VIA GameManager
        GM.resetGames();
        res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '**Games data reset!**'
          }
        });
      break;
      //START GAME
      case 'start':
        //GET REQUESTED PLAYER COUNT
        let playerCount = parseInt(DM.getMessageOptionByName(data, 'count')) || 5;
        scriptName = DM.getMessageOptionByName(data, 'script') || 'trouble brewing';
        //GET USERNAME TO LOG AND PREP GAME
        //let userName = getUsername(req.body);
        let userId = getUserId(req.body);
        //LOG THIS REQUEST
        Logger.log('request', 'Game started', { username: userName, script: scriptName, playerCount: playerCount } );
        //EXTRACT SOME CORE DATA
        let channelId = req.body.channel.id;
        let gameId = GM.init({ channelId: channelId, userName: userName, userId: userId, script: scriptName, playerCount: playerCount})
        let heading = 'A ' + playerCount + '-player game of ' + scriptName;
        heading += " was started by <@" + userId + ">\n\n";
        heading += "Join the game by clicking below!";
        //let buttons = [ DM.generateButton(`join_button_${gameId}`, 'Join Game', 'primary') ];
        //console.log(DM.generateActionRow(heading, buttons));
        //return res.send(DM.generateActionRow(heading, buttons));
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            // SHOW THE JOIN BUTTON FOR THIS GAME
            content: heading,
            components: [
              {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  DM.generateButton(`join_button_${gameId}`, 'Join Game', 'primary')
                ]
              }
            ]
          }
        });
      break;
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
        //let pIds = players.map( (p) => { return "* <@" + p.id + '>'; }).join("\n");
        let pIds = players.map( (p) => { 
          return "* " + DM.outputDiscordName(p);
        }).join("\n");
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
    
    //start_button_$gameId 
    if (componentId.startsWith('start_button_')) 
    {
      //GET THE GAME ID
      const gameId = componentId.replace('start_button_', '');
      //GET THE GAME FROM THE GameManager
      let game = GM.startGame(gameId);
      //PASS TO THE STORYTELLER, SETS UP GAME
      let ST = new StoryTeller(game);
      //OUTPUT ROLES ONCE SETUP
      let output = ST.outputRoles();
      let grim = ST.outputGrimoire();
      //console.log('grimoire',grim);
      //SEND THE GAME START INFO
      /*res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "**Game starting**\n\n" + output,
          "attachments": [
              { "contentUrl": grim }
          ]
        }
      });*/
      res.send(DM.generateTextMessage(output));
    }
  }
});

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});

