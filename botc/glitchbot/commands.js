import 'dotenv/config';
import { getRPSChoices } from './game.js';
import { capitalize, InstallGlobalCommands } from './utils.js';
import { scripts } from './resources/scripts.js';


// Get the game choices from game.js
function createCommandChoices() {
  const choices = getRPSChoices();
  const commandChoices = [];

  for (let choice of choices) {
    commandChoices.push({
      name: capitalize(choice),
      value: choice.toLowerCase(),
    });
  }

  return commandChoices;
}

function createScriptChoices() {
  const scriptChoices = [];
  const scriptNames = scripts.map( (script) => { return script.name });
  //Iterate available scripts
  for (let script of scriptNames) {
    scriptChoices.push({
      name: script,
      value: script
    });
  }
  return scriptChoices;
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
    }
  ],
  type: 1
};

// Command containing options
const CHALLENGE_COMMAND = {
  name: 'challenge',
  description: 'Challenge to a match of rock paper scissors',
  options: [
    {
      type: 3,
      name: 'object',
      description: 'Pick your object',
      required: true,
      choices: createCommandChoices(),
    },
  ],
  type: 1,
};

const NIGHT_COMMAND = {
  name: 'night',
  description: 'Move users to a Voice Channel',
  type: 1,
};

const ALL_COMMANDS = [ START_COMMAND, SCRIPT_COMMAND ]; //CHALLENGE_COMMAND, NIGHT_COMMAND ];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);