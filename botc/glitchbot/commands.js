import 'dotenv/config';
//import { getRPSChoices } from './game.js';
import { capitalize, InstallGlobalCommands } from './utils.js';
import { scripts } from './resources/scripts.js';
import { RolesHelper } from './classes/RolesHelper.js';

let RH = new RolesHelper();

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
      //min_value: 5,
      //max_value: 15,
      choices: createPlayerCountChoices()
    },
  ],
  type: 1,
};

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
  ],
  type: 1
}


const NIGHT_COMMAND = {
  name: 'night',
  description: 'Move users to a Voice Channel',
  type: 1,
};

const ALL_COMMANDS = [ START_COMMAND, SCRIPT_COMMAND, ROLE_COMMAND ]; //CHALLENGE_COMMAND, NIGHT_COMMAND ];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);