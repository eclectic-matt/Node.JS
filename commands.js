import 'dotenv/config';
//import { getRPSChoices } from './game.js';
import { capitalize } from './utils.js';
import { scripts } from './resources/scripts.js';
import { RolesHelper } from './classes/RolesHelper.js';
import { DiscordManager } from './messages/DiscordManager.js';

let RH = new RolesHelper();
let DM = new DiscordManager();

//=====================
// command: /script
//=====================
const SCRIPT_COMMAND = {
  name: 'script',
  description: 'Output Script Information',
  options: [
    {
      type: 3,
      name: 'script',
      description: 'Choose a script',
      required: true,
      choices: createScriptChoices()
    },
    {
      type: 3,
      name: 'type',
      description: 'Choose output type',
      required: true,
      choices: createScriptOutputChoices()
    }
  ],
  type: 1
};

function createScriptChoices() {
  const scriptChoices = [];
  const scriptNames = scripts.map( (script) => { return script.name; });
  //Iterate available scripts
  for (let script of scriptNames) {
    scriptChoices.push({
      name: script,
      value: script
    });
  }
  return scriptChoices;
}

function createScriptOutputChoices() {
  const outputChoices = [];
  //WIKI LINK LIST
  outputChoices.push({
    name: 'List of Wiki Links',
    value: 'links'
  });
  //ABILITY LIST
  outputChoices.push({
    name: 'List Abilities',
    value: 'abilities'
  });
  //NIGHT ORDER - FIRST NIGHT
  outputChoices.push({
    name: 'Night Order, First Night',
    value: 'firstNightOrder'
  });
  //NIGHT ORDER - OTHER NIGHTS
  outputChoices.push({
    name: 'Night Order, Other Nights',
    value: 'otherNightsOrder'
  });
  return outputChoices;
}

//===================
// COMMAND: /role
//===================
const ROLE_COMMAND = {
  name: 'role',
  description: 'Output Role Information',
  options: [
    {
      type: 3,
      name: 'role',
      description: 'Choose a role',
      required: true
    }
    /*
    ,{
      type: 3,
      name: 'role',
      description: 'Choose role',
      required: true,
      choices: createRoleChoices()
    }
    */
  ],
  type: 1
}

//NOTE: this is too big to send :-/
function createRoleChoices() {
  const roleChoices = [];
  const roleNames = RH.getRolesList();
  //Iterate available scripts
  for (let role of roleNames) {
    roleChoices.push({
      name: role,
      value: role
    });
  }
  return roleChoices;
}

//==================
// COMMAND: /start
//==================
// Setup a game command
const START_COMMAND = {
  name: 'start',
  description: 'Setup a game',
  options: [
    {
      type: 3,
      name: 'script',
      description: 'Choose a script',
      required: true,
      choices: createScriptChoices()
    },
    {
      type: 3,
      name: 'count',
      description: 'How many players',
      required: true,
      min_value: 5,
      max_value: 15,
      choices: createPlayerCountChoices()
    },
  ],
  type: 1,
};

function createPlayerCountChoices() {
  const minCount = 5;
  const maxCount = 15;
  const countChoices = [];
  for(let i = minCount; i <= maxCount; i++){
    countChoices.push({
      name: String(i),
      value: String(i)
    });
  }
  return countChoices;
}

//====================
// COMMAND: /public
//====================
const PUBLIC_COMMAND = {
  name: 'public',
  description: 'Claim a public role and use the ability',
  options: [
    {
      type: 3,
      name: 'role',
      description: 'Choose a publicly-acting role',
      required: true,
      choices: createPublicRolesChoices()
    }
  ],
  type: 1
}

function createPublicRolesChoices(){
  const roleChoices = [];
  let roleNames = RH.getPublicRolesList();
  for (let role of roleNames) {
    roleChoices.push({
      name: role,
      value: role
    });
  }
  return roleChoices;
}

//==================
// TESTING ONLY!!
//==================
const RESET_COMMAND = {
  name: 'reset',
  description: 'Reset all games',
  type: 1
}

const TEST_COMMAND = {
  name: 'test',
  description: 'Test Command',
  type: 1
}

//==================
// NOT IN USE
//==================
const NIGHT_COMMAND = {
  name: 'night',
  description: 'Move users to a Voice Channel',
  type: 1,
};

//=======================
// OUTPUT ALL COMMANDS
//=======================

//These get picked up and sent to Discord by using the node command:
// npm run register
// @see package.json -> scripts -> register

const ALL_COMMANDS = [ 
  START_COMMAND, 
  SCRIPT_COMMAND, 
  ROLE_COMMAND, 
  PUBLIC_COMMAND, 
  RESET_COMMAND,
  TEST_COMMAND
]; 

//CHALLENGE_COMMAND, NIGHT_COMMAND ];

DM.InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);