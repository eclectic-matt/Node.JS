"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Storyteller = void 0;
class Storyteller {
    constructor(script, playerCount, names = []) {
        this.playerCounts = [
            undefined, //1
            undefined, //2
            undefined, //3
            undefined, //4
            {
                townsfolk: 3,
                outsider: 0,
                minion: 1,
                demon: 1
            },
            {
                townsfolk: 3,
                outsider: 1,
                minion: 1,
                demon: 1
            },
            {
                townsfolk: 5,
                outsider: 0,
                minion: 1,
                demon: 1
            },
            {
                townsfolk: 5,
                outsider: 1,
                minion: 1,
                demon: 1
            },
            {
                townsfolk: 5,
                outsider: 2,
                minion: 1,
                demon: 1
            },
            {
                townsfolk: 7,
                outsider: 0,
                minion: 2,
                demon: 1
            },
            //11 - 7 1 2 1
            //12 - 7 2 2 1
            //13 - 9 0 3 1
            //14 - 9 1 3 1
            //15 - 9 2 3 1
        ];
        switch (script) {
            case 'tb':
                this.script = this.loadTB();
                break;
            default:
                return 'Not yet supported';
                break;
        }
        //ASSIGN CHARACTERS (INCL. MODIFYING SETUP)
        this.assignRoles(playerCount);
        //ASSIGN NAMES (REAL INPUTS PLUS SOME GENERATED RANDOM NAMES)
        //this.assignNames(names);
        //OUTPUT
        //document.write('<h2>Post setup modifications</h2>');
        let span = document.createElement('span');
        span.innerHTML = '<h2>Post setup modifications</h2>';
        document.body.appendChild(span);
        this.outputRoles();
        //DEBUG OUTPUT
        //console.log("roles\n",this.roles.map((role) => { return role.name + ' is the ' + role.role }).join("\n"));
    }
    loadScript(name) {
        //this.script = 
    }
    loadTB() {
        this.script = {
            name: 'Trouble Brewing',
            roles: [
                {
                    role: 'Imp',
                    alignment: 'evil',
                    team: 'demon',
                    ability: {
                        trigger: 'eachnight*',
                        target: 'any',
                        cause: 'death',
                        special: {
                            target: 'self',
                            ability: 'minionBecomesDemon'
                        }
                    }
                },
                {
                    role: 'Poisoner',
                    alignment: 'evil',
                    team: 'minion',
                    ability: {
                        trigger: 'eachnight',
                        target: 'any',
                        cause: 'droison',
                        special: undefined
                    }
                },
                {
                    role: 'Baron',
                    alignment: 'evil',
                    team: 'minion',
                    ability: {
                        trigger: 'setup',
                        target: undefined,
                        cause: '+2outsiders',
                        special: {
                            team: 'townsfolk',
                            modifiedteam: 'outsider',
                            count: 2
                        }
                    }
                },
                {
                    role: 'Spy',
                    alignment: 'evil',
                    team: 'minion',
                    ability: {
                        trigger: 'registersFalse',
                        target: undefined,
                        cause: '+2outsiders',
                        special: {
                            team: 'townsfolk',
                            modifiedteam: 'outsider',
                            count: 2
                        }
                    }
                },
                {
                    role: 'Scarlet Woman',
                    alignment: 'evil',
                    team: 'minion',
                    ability: {
                        trigger: 'execute',
                        target: undefined,
                        cause: '+2outsiders',
                        special: {
                            team: 'townsfolk',
                            modifiedteam: 'outsider',
                            count: 2
                        }
                    }
                },
                {
                    role: 'Recluse',
                    alignment: 'good',
                    team: 'outsider',
                    ability: {
                        trigger: 'detect',
                        target: undefined,
                        cause: 'registerEvilMinionDemon',
                        special: undefined
                    }
                },
                {
                    role: 'Drunk',
                    alignment: 'good',
                    team: 'outsider',
                    ability: {
                        trigger: 'thinks',
                        target: undefined,
                        cause: 'thinksTownsfolk',
                        special: undefined
                    }
                },
                {
                    role: 'Saint',
                    alignment: 'good',
                    team: 'outsider',
                    ability: {
                        trigger: 'executed',
                        target: 'self',
                        cause: 'teamLoses',
                        special: undefined
                    }
                },
                {
                    role: 'Butler',
                    alignment: 'good',
                    team: 'outsider',
                    ability: {
                        trigger: 'vote',
                        target: undefined,
                        cause: 'voteWithMaster',
                        special: undefined
                    }
                },
                {
                    role: 'Washerwoman',
                    alignment: 'good',
                    team: 'townsfolk',
                    ability: {
                        trigger: 'firstnight',
                        target: undefined,
                        cause: 'learns',
                        special: undefined
                    }
                },
                {
                    role: 'Slayer',
                    alignment: 'good',
                    team: 'townsfolk',
                    ability: {
                        trigger: 'public',
                        target: 'any',
                        cause: 'demonDies',
                        special: undefined
                    }
                },
                {
                    role: 'Mayor',
                    alignment: 'good',
                    team: 'townsfolk',
                    ability: {
                        trigger: '3AliveNoExecution',
                        target: undefined,
                        cause: 'mayorTeamWins',
                        special: undefined
                    }
                },
                {
                    role: 'Monk',
                    alignment: 'good',
                    team: 'townsfolk',
                    ability: {
                        trigger: 'eachnight*',
                        target: 'anyNotSelf',
                        cause: 'safeFromDemon',
                        special: undefined
                    }
                },
                {
                    role: 'Soldier',
                    alignment: 'good',
                    team: 'townsfolk',
                    ability: {
                        trigger: 'demonAttack',
                        target: undefined,
                        cause: 'safeFromDemon',
                        special: undefined
                    }
                },
                {
                    role: 'Librarian',
                    alignment: 'good',
                    team: 'townsfolk',
                    ability: {
                        trigger: 'eachnight*',
                        target: 'anyNotSelf',
                        cause: 'safeFromDemon',
                        special: undefined
                    }
                },
                {
                    role: 'Investigator',
                    alignment: 'good',
                    team: 'townsfolk',
                    ability: {
                        trigger: 'eachnight*',
                        target: 'anyNotSelf',
                        cause: 'safeFromDemon',
                        special: undefined
                    }
                }
            ]
        };
        //Shuffle roles 
        this.script.roles = this.shuffle(this.script.roles);
        //console.log('roles',this.script.roles);
        return this.script;
    }
    assignRoles(playerCount) {
        //==========
        // INITIAL
        // PASS
        //==========
        this.roles = [];
        let playersArr = this.getPlayersArray(playerCount);
        //console.log('playersArr', playersArr);
        for (let i = 0; i < playerCount; i++) {
            let thisTeam = playersArr[i];
            let role = this.getRole(thisTeam);
            role.name = this.getRandomName();
            this.roles.push(role);
        }
        //OUTPUT FOR DEBUGGING
        //document.write('<h2>Initial setup</h2>');
        let span = document.createElement('span');
        span.innerHTML = '<h2>Initial Setup</h2>';
        document.body.appendChild(span);
        this.outputRoles();
        //console.log('roles',this.roles.map((role) => { return role.role }).join(', '));
        //==========
        // MODIFIED
        // SETUP 
        //(e.g. BARON)
        //==========
        //ITERATE THROUGH ROLES
        for (let roleId in this.roles) {
            //GET THE CURRENT ROLE
            let role = this.roles[roleId];
            //CHECK IF THIS ABILITY HAS A TRIGGER, AND THAT TRIGGER IS SETUP
            if (role.ability.trigger && role.ability.trigger === 'setup') {
                //THIS ROLE MODIFIES SETUP (e.g. BARON)
                //console.log('modifiesSetup', role);
                //Store here, e.g. Baron: team=townsfolk, modifiedteam=outsider, count=2
                let setup = role.ability.special;
                let setupTeam = setup.team;
                let modifiedTeam = setup.modifiedteam;
                let setupCount = setup.count;
                //FOR EACH ROLE TO MODIFY
                for (let i = 0; i < setupCount; i++) {
                    //this.roles.filter( (role) => { return role.team === setupteam})[0].team = modifiedteam;
                    //GET A NEW ROLE FOR THIS PLAYER
                    let newRole = this.getRole(modifiedTeam);
                    //console.log('setupMod - new role =',newRole);
                    //ITERATE ROLES TO FIND MATCHING ROLE TO REPLACE
                    for (let j = 0; j < this.roles.length; j++) {
                        //IF team MATCHES 
                        if (this.roles[j].team === setupTeam) {
                            let oldName = this.roles[j].name;
                            //REPLACE ROLE
                            //console.log('SWAPPING',JSON.parse(JSON.stringify(this.roles[j])), JSON.parse(JSON.stringify(newRole)));
                            this.roles[j] = JSON.parse(JSON.stringify(newRole));
                            //GETTING NEW ROLE REMOVES NAME 
                            //this.roles[j].name = this.getRandomName();
                            //USE OLD NAME
                            this.roles[j].name = oldName;
                            //HAVE MADE THIS MODIFICATION, BREAK OUT OF FOR LOOP
                            break;
                        }
                    }
                }
            }
        } //END setup modification
    }
    outputRoles() {
        //console.log('this roles', this.roles);
        for (let i = 0; i < this.roles.length; i++) {
            //document.write(this.roles[i].name + ' is the ' + this.roles[i].role + '<br>');
            let span = document.createElement('span');
            span.innerHTML = this.roles[i].name + ' is the ' + this.roles[i].role + '<br>';
            document.body.appendChild(span);
            //console.log(this.roles[i].name + ' is the ' + this.roles[i].role);
        }
        //document.write('<hr>');
    }
    /**
     * Assign names to the current roles using the supplied names array.
     * @param {array} names The array of actual player names to use first (then randomly generated).
     * return void No return.
     */
    assignNames(names) {
        for (let i = 0; i < names.length; i++) {
            this.roles[i].name = names[i];
        }
        for (let i = names.length; i < this.roles.length; i++) {
            this.roles[i].name = this.getRandomName();
        }
    }
    /**
     * Get a random name which has not already been used in the current roles array.
     * @return {string} A random name.
     */
    getRandomName() {
        let names = [
            'Mat',
            'Tom',
            'Sam',
            'Ant',
            'Joe',
            'Fil',
            'Rik',
            'Ged',
            'Liz'
        ];
        let possible = names.filter((r) => { return !this.roles.map((p) => { return p.name; }).includes(r); });
        return this.shuffle(possible)[0];
    }
    getPlayersArray(pCount) {
        //scale down here for 0-index
        let pCounts = this.playerCounts[pCount - 1];
        //console.log('pCounts',pCounts);
        //Assign townsfolk
        let arr = Array(pCounts.townsfolk).fill('townsfolk');
        //Assign outsiders
        for (let i = 0; i < pCounts.outsider; i++) {
            arr.push('outsider');
        }
        //Assign minions
        for (let i = 0; i < pCounts.minion; i++) {
            arr.push('minion');
        }
        //Assign demon - modify for Legion, Lil monsta etc
        arr.push('demon');
        return this.shuffle(arr);
    }
    getRole(team) {
        let roles = this.roles.map((role) => { return role.role; });
        //console.log(roles.join(','));
        let possible = this.script.roles.filter((r) => { return (!roles.includes(r.role) && (r.team === team)); });
        //console.log('getRole',team, possible);
        return possible[0];
    }
    processNight() {
    }
    processDay() {
    }
    processNomination() {
    }
    learn(correctCount, totalCount, infoType, droisoned = false) {
        let info;
        switch (infoType) {
            case 'townsfolk':
                info = this.learnTeam('townsfolk', 2, this.name);
                break;
            case 'outsider':
                info = this.learnTeam('outsider', 2, this.name);
                break;
            case 'minion':
                info = this.learnTeam('minion', 2, this.name);
                break;
        }
        return info;
    }
    learnTeam(team, count, selfName) {
        let info = {
            possible: [],
            info: ''
        };
        //Select from the correct team (not yourself, to be kind)
        let options = this.roles.filter((player) => { return ((player.team == team) && (player.name != selfName)); });
        //librarian, no outsiders in play
        if (options.length === 0) {
            info.info = 'none';
            return info;
        }
        //Choose one at random
        let selected = options[Math.floor(Math.random() * options.length)];
        //Get the role
        info.info = selected.role;
        info.possible.push(selected.name);
        //Filter players to NOT the selected player or yourself
        let other = this.roles.filter((player) => { return ((player.name != selected.name) && (player.name != selfName)); });
        let selectedOther = other[Math.floor(Math.random() * other.length)];
        info.possible.push(selectedOther.name);
        info.possible = this.shuffle(info.possible);
        return info;
    }
    learnChefNumber() {
        let evilMax = 0;
        let currentChef = 0;
        let lastEvilIndex = false;
        //With recluse?
        for (let i = 0; i < grim.players.length; i++) {
            if (grim.players[i].alignment == 'evil') {
                if ((lastEvilIndex) && ((i - lastEvilIndex) == 1)) {
                    //increment chef
                    currentChef++;
                    if (currentChef > evilMax) {
                        evilMax = currentChef;
                    }
                }
            }
        }
    }
    shuffle(arr) {
        var j, x, i;
        for (i = arr.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = arr[i];
            arr[i] = arr[j];
            arr[j] = x;
        }
        return arr;
    }
}
exports.Storyteller = Storyteller;
/*import Washerwoman from './class/Washerwoman.js';

export class TroubleBrewing
{
    characters = {
        townsfolk: Map([
            ['Washerwoman', Washerwoman],
            ['Librarian', Librarian],
            ['Investigator', Investigator],
            ['Chef', Chef],
        ])
    }
}*/ 
