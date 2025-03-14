import 'dotenv/config';
import fetch from 'node-fetch';
import { verifyKey } from 'discord-interactions';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from "discord-interactions";

export class DiscordManager
{

  //=======================
  // CORE AND VERIFICATION
  //=======================
  
  //VERIFIES A RECEIVED DISCORD REQUEST IS VALID
  VerifyDiscordRequest(clientKey) 
  {
    return function (req, res, buf, encoding) {
      const signature = req.get('X-Signature-Ed25519');
      const timestamp = req.get('X-Signature-Timestamp');

      const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
      if (!isValidRequest) {
        res.status(401).send('Bad request signature');
        throw new Error('Bad request signature');
      }
    };
  }

  //PASSES A DISCORD REQUEST TO THE SPECIFIED ENDPOINT
  async DiscordRequest(endpoint, options) 
  {
    // append endpoint to root API URL
    const url = 'https://discord.com/api/v10/' + endpoint;
    // Stringify payloads
    if (options.body) options.body = JSON.stringify(options.body);
    // Use node-fetch to make requests
    const res = await fetch(url, {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'User-Agent': 'DiscordBot (https://glitch.com/delicious-debonair-school, 1.0.0)',
      },
      ...options
    });
    // throw API errors
    if (!res.ok) {
      const data = await res.json();
      console.log('DisRes', data);
      console.log('Res Status', res.status);
      throw new Error(JSON.stringify(data));
    }
    // return original response
    return res;
  }

  //INSTALL GLOBAL COMMANDS FOR THIS APPLICATION
  async InstallGlobalCommands(appId, commands) 
  {
    // API endpoint to overwrite global commands
    const endpoint = `applications/${appId}/commands`;

    try {
      // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
      await this.DiscordRequest(endpoint, { method: 'PUT', body: commands });
    } catch (err) {
      console.error(err);
    }
  }
  
  getMessageOptionByName(data, name) 
  {
    let selOpt = data.options.filter( (opt) => { return opt.name === name; });
    if(selOpt[0].value){
      return selOpt[0].value;
    }else{
      return false;
    }
  }
  
  outputDiscordName(player)
  {
    let emoji = (player.type === "human" ? '🧍' : '🤖');
    if (player.type == "human"){
      //HUMAN, OUTPUT DISCORD LINK
      return emoji + " <@" + player.id + ">";
    }else{
      //BOT, OUTPUT BOT NAME
      return emoji + " " + player.name;
    }
  }
  
  //===============
  //Endpoints
  //===============
  //https://discord.com/developers/docs/resources/channel#channel-object
  //https://discord.com/developers/docs/resources/channel#create-message
  //https://stackoverflow.com/a/68702308
  async sendDirectMessage(user, content)
  {
    console.log('Trying to send DM to ', user.name, 'message:', content);
    //=============================
    // NEW - GET DM CHANNELS FIRST
    //=============================
    
    //STORE RECIPIENT ID AS DATA
    let data = { 
      recipient_id: user.id
    };
    
    //data = JSON.stringify(data);
    //GET CHANNEL FOR THIS USER
    const channelEndpoint = `users/@me/channels`;
    let channelData = await this.DiscordRequest(channelEndpoint, { 
      method: 'POST', 
      body: data,
    });
    
    //
    if(channelData.id){
      this.sendMessageViaDM(channelData, content);
    }else{
      //console.log('Failed DM data',channelData)
      this.sendPublicMessage(user.channel, 'Cannot send private message to ' + user.name);
    }
    //https://discord.com/developers/docs/topics/opcodes-and-status-codes
    
    
    
    /*
    if(channelData.id){
      const endpoint = `channels/${channelData.id}/messages`;
      console.log('DM to', endpoint, content);
      this.DiscordRequest(endpoint, { 
        method: 'POST', 
        body: {
          content: content,
          components: []
        } 
      }); 
    }
    */
    
    
    /*
    //=============================
    // OLD - SEND TO USER CHANNEL
    //=============================
    //`/channels/{channel.id}/messages`
    //const endpoint = `channels/${user.id}/messages`;
    const endpoint = `channels/${user.channel}/messages`;
    console.log('DM to', endpoint, content);
    this.DiscordRequest(endpoint, { 
      method: 'POST', 
      body: {
        content: content,
        components: []
      } 
    });
    */
    
  }
  
  sendMessageViaDM(channelData, content)
  {
    //console.log('sendDM', channelData.id, content);
    const endpoint = `channels/${channelData.id}/messages`;
    //console.log('DM to', endpoint, content);
    this.DiscordRequest(endpoint, { 
      method: 'POST', 
      body: {
        content: content,
        components: []
      } 
    });
  }
  
  sendPublicMessage(channel, content)
  {
    const endpoint = `channels/${channel}/messages`;
    this.DiscordRequest(endpoint, {
      method: 'POST',
      body: {
        content: content,
        components: []
      }
    });
  }
  
  processRequest(req, content, method='POST')
  {
    
  }
  
  //=========================
  // MESSAGE BUILDERS
  //=========================
  /**
   * Generates a text message to send via webhook.
   * @param content {string} The text content to send.
  **/
  generateTextMessage(content, ephemeral=false)
  {
    let msg = {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: content,
      },
    }
    if(ephemeral){
      msg.flags = InteractionResponseFlags.EPHEMERAL;
    }
    return msg;
  }
  
  /**
   * Generates a rich message via webhook.
   **/
  generateRichContent(heading, options)
  {
    /*return res.send({
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
    });*/
  }
  
  //GENERATE ACTION ROW 
  //@see https://discord.com/developers/docs/interactions/message-components#action-rows
  generateActionRow(heading, componentsArr)
  {
    return {
      content: heading,
      components:[
        {
          type: MessageComponentTypes.ACTION_ROW,
          components: componentsArr  
        }
      ]
    }
  }
  
  //GENERATE BUTTON
  //@see https://discord.com/developers/docs/interactions/message-components#buttons
  generateButton(id, label, style, url=undefined)
  {
    //INIT BUTTON OBJECT
    let button = {
      type: MessageComponentTypes.BUTTON,
      custom_id: id,
      label: label,
    }
    //SWITCH ON STRING STYLE
    switch(style){
      case 'primary':
      default:
        button.style = ButtonStyleTypes.PRIMARY;
      break;
      case 'secondary':
        button.style = ButtonStyleTypes.SECONDARY;
      break;
      case 'success':
        button.style = ButtonStyleTypes.SUCCESS;
      break;
      case 'danger':
        button.style = ButtonStyleTypes.DANGER;
      break;
      case 'link':
        if(!url) throw 'Cannot generate link button without URL parameter!';
        button.style = ButtonStyleTypes.LINK;
      break;
    }
    //APPEND LINK BUTTON URL (optional so after required params)
    if(style=='link' && url){
      //MUST HAVE URL
      button.url = url;
      //MUST *NOT* HAVE custom_id
      delete button.custom_id;
    }
    //RETURN THE GENERATED OBJECT
    return button;
  }
  
  //GENERATE A MENU OF SELECT OPTIONS
  //@see https://discord.com/developers/docs/interactions/message-components#select-menus
  generateSelectMenu(id, placeholder, options, minCount, maxCount)
  {
    let menu = {
      type: 3,
      custom_id: id,
      options: [],
      placeholder: placeholder,
      min_values: minCount,
      max_values: maxCount
    }
    options.forEach( (opt) => {
      menu.options.push(this.generateSelectOption(opt.label, opt.value, opt.description));
    });
    return menu;
  }
  
  generateSelectOption(label, value, description)
  {
    return {
      label: label,
      value: value,
      description: description
    }
  }
  
  
}