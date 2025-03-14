/*import 'dotenv/config';
import fetch from 'node-fetch';
import { verifyKey } from 'discord-interactions';

export function VerifyDiscordRequest(clientKey) {
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

export async function DiscordRequest(endpoint, options) {
  // append endpoint to root API URL
  const url = 'https://discord.com/api/v10/' + endpoint;
  // Stringify payloads

  if (options.body) options.body = JSON.stringify(options.body);

  // Use node-fetch to make requests

  const res = await fetch(url, {

    headers: {

      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,

      'Content-Type': 'application/json; charset=UTF-8',

      'User-Agent': 'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)',

    },

    ...options

  });

  // throw API errors

  if (!res.ok) {

    const data = await res.json();

    console.log(res.status);

    throw new Error(JSON.stringify(data));

  }

  // return original response

  return res;
}

export async function InstallGlobalCommands(appId, commands) {
  // API endpoint to overwrite global commands
  const endpoint = `applications/${appId}/commands`;

  try {
    // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
    await DiscordRequest(endpoint, { method: 'PUT', body: commands });
  } catch (err) {
    console.error(err);
  }
}
*/
// Simple method that returns a random emoji from list
export function getRandomEmoji() {
  const emojiList = ['😭','😄','😌','🤓','😎','😤','🤖','😶‍🌫️','🌏','📸','💿','👋','🌊','✨'];
  return emojiList[Math.floor(Math.random() * emojiList.length)];
}

//CONVERT A STRING TO FIRST CAPITAL ONLY (fortune teller => Fortune teller)
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

//CONVERT A STRING TO TITLE CASE (fortune teller => Fortune Teller)
export function titleCase(str) {
  return str.replace(/(^|\s)\S/g, function(t) { return t.toUpperCase() });
}

/**
 * Shuffle an array and return.
 * @param arr {array} The array to sort randomly.
 */
export const shuffle = (arr) => {
  var j, x, i;
  for (i = arr.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = arr[i];
    arr[i] = arr[j];
    arr[j] = x;
  }
  return arr;
}

//GET A DISCORD USERNAME (CHANNEL OR DM)
export const getUsername = (body) => {
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
export const getUserId = (body) => {
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
export const getUUID = (body) => {
  let channel = body.channel.id;
  let userId;
  if(body.member){
    userId = body.member.user.id;
  }else{
     userId = body.user.id; 
  }
  return channel + "_" + userId;
}

//OUTPUT A PLAYER NAME (EITHER BOT OR HUMAN)
export const outputDiscordName = (player) => {
  let emoji = (player.type === "human" ? '🧍' : '🤖');
  if (player.type == "human"){
    //HUMAN, OUTPUT DISCORD LINK
    return emoji + " <@" + player.id + ">";
  }else{
    //BOT, OUTPUT BOT NAME
    return emoji + " " + player.name;
  }
}
/*
export const getMessageOptionByName = (data, name) => {
  let selOpt = data.options.filter( (opt) => { return opt.name === name; });
  if(selOpt[0].value){
    return selOpt[0].value;
  }else{
    return false;
  }
}
*/