/**
 * Enum to define the "alive" statuses, as all players start alive but may become dead.
 * Note: The Zombuul is the only character that can be "undead".
 */
var AliveStatus;
(function (AliveStatus) {
    AliveStatus[AliveStatus["Alive"] = 1] = "Alive";
    AliveStatus[AliveStatus["Dead"] = 2] = "Dead";
    AliveStatus[AliveStatus["Undead"] = 3] = "Undead";
})(AliveStatus || (AliveStatus = {}));
//OLD VERSION AS A TYPE
//type AliveStatus = "alive" | "dead" | "undead";
/**
 * Enum to define a players' vote status - starting as "yes" but changing to "Ghost" when ghost vote left and "no" once ghost vote used.
 * Note: "Once" is defined for the purposes of characters that may only vote once.
 */
var VoteStatus;
(function (VoteStatus) {
    VoteStatus[VoteStatus["Yes"] = 1] = "Yes";
    VoteStatus[VoteStatus["No"] = 2] = "No";
    VoteStatus[VoteStatus["Ghost"] = 3] = "Ghost";
    VoteStatus[VoteStatus["Once"] = 4] = "Once";
})(VoteStatus || (VoteStatus = {}));
//let TroubleBrewingScript = require('TroubleBrewing');
//let tb = TroubleBrewingScript.tb;
//import * as tb from './TroubleBrewing.ts'; 
var StoryTeller = /** @class */ (function () {
    function StoryTeller(playerCount) {
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
            {
                townsfolk: 7,
                outsider: 1,
                minion: 2,
                demon: 1
            },
            {
                townsfolk: 7,
                outsider: 2,
                minion: 2,
                demon: 1
            },
            {
                townsfolk: 9,
                outsider: 0,
                minion: 3,
                demon: 1
            },
            {
                townsfolk: 9,
                outsider: 1,
                minion: 3,
                demon: 1
            },
            {
                townsfolk: 9,
                outsider: 2,
                minion: 3,
                demon: 1
            }
        ];
        //console.log('Setup', playerCount);
        this.playerCount = playerCount;
        this.script = this.loadScript('tb');
        this.roles = [];
        this.assignRoles();
    }
    StoryTeller.prototype.loadScript = function (script) {
        switch (script) {
            case 'tb':
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
                        },
                        {
                            role: 'Chef',
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
                            role: "Empath",
                            aligment: "good",
                            team: "towmsfolk",
                            ability: {}
                        }
                    ]
                };
                //Shuffle roles 
                this.script.roles = this.shuffle(this.script.roles);
                //console.log('roles',this.script.roles);
                return this.script;
                break;
        }
    };
    StoryTeller.prototype.assignRoles = function () {
        //==========
        // INITIAL
        // PASS
        //==========
        this.roles = [];
        var playersArr = this.getPlayersArray();
        //console.log('playersArr', playersArr);
        for (var i = 0; i < this.playerCount; i++) {
            var thisTeam = playersArr[i];
            var role = this.getRole(thisTeam);
            role.name = this.getRandomName();
            this.roles.push(role);
        }
        //OUTPUT FOR DEBUGGING
        //console.log('first pass');
        //console.log('roles',this.roles.map((role) => { return role.role }).join(', '));
        //==========
        // MODIFIED
        // SETUP 
        //(e.g. BARON)
        //==========
        //ITERATE THROUGH ROLES
        for (var roleId in this.roles) {
            //GET THE CURRENT ROLE
            var role = this.roles[roleId];
            //CHECK IF THIS ABILITY HAS A TRIGGER, AND THAT TRIGGER IS SETUP
            if (role.ability.trigger && role.ability.trigger === 'setup') {
                //THIS ROLE MODIFIES SETUP (e.g. BARON)
                //console.log('modifiesSetup', role);
                //Store here, e.g. Baron: team=townsfolk, modifiedteam=outsider, count=2
                var setup = role.ability.special;
                var setupTeam = setup.team;
                var modifiedTeam = setup.modifiedteam || "outsider";
                var setupCount = setup.count || 5;
                //FOR EACH ROLE TO MODIFY
                for (var i = 0; i < setupCount; i++) {
                    //this.roles.filter( (role) => { return role.team === setupteam})[0].team = modifiedteam;
                    //GET A NEW ROLE FOR THIS PLAYER
                    var newRole = this.getRole(modifiedTeam);
                    //console.log('setupMod - new role =',newRole);
                    //ITERATE ROLES TO FIND MATCHING ROLE TO REPLACE
                    for (var j = 0; j < this.roles.length; j++) {
                        //IF team MATCHES 
                        if (this.roles[j].team === setupTeam) {
                            var oldName = this.roles[j].name;
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
        //OUTPUT FOR DEBUGGING
        //console.log('after setup mod');
        //console.log('roles',this.roles.map((role: Role) => { return role.role + " => " + role.name; }));
    }; //assignRoles
    StoryTeller.prototype.outputRoles = function () {
        return this.roles.map(function (role) { return "<li>" + role.role + " (" + role.team + ")" + " => " + role.name + "</li>"; });
    };
    StoryTeller.prototype.outputCounts = function (playerCount) {
        var counts = this.playerCounts[playerCount - 1] || [];
        return JSON.stringify(counts);
        //Object.keys(counts).forEach( ())
        //return counts.map( (type: string, amount: number) => { return type + ": " + amount; });
    };
    /**
     * Get a random name which has not already been used in the current roles array.
     * @return {string} A random name.
     */
    StoryTeller.prototype.getRandomName = function () {
        var _this = this;
        var names = [
            'Ant',
            'Bek',
            'Cid',
            'Dak',
            'Eve',
            'Fil',
            'Ged',
            'Haz',
            'Ian',
            'Joe',
            'Kim',
            'Lee',
            'Mat',
            'Niz',
            'Ola',
            'Pat',
            'Rik',
            'Sam',
            'Tom',
            'Una',
            'Val',
            'Xia'
        ];
        var possible = names.filter(function (r) { return !_this.roles.map(function (p) { return p.name; }).includes(r); });
        return this.shuffle(possible)[0];
    };
    StoryTeller.prototype.getPlayersArray = function () {
        var defaultCount = {
            townsfolk: 3,
            outsider: 0,
            minion: 1,
            demon: 1
        };
        //scale down here for 0-index
        var pCounts = this.playerCounts[this.playerCount - 1] || defaultCount;
        //console.log('pCounts',pCounts);
        //Assign townsfolk
        var arr = Array(pCounts.townsfolk).fill('townsfolk');
        //Assign outsiders
        for (var i = 0; i < pCounts.outsider; i++) {
            arr.push('outsider');
        }
        //Assign minions
        for (var i = 0; i < pCounts.minion; i++) {
            arr.push('minion');
        }
        //Assign demon - modify for Legion, Lil monsta etc
        arr.push('demon');
        return this.shuffle(arr);
    };
    StoryTeller.prototype.getRole = function (team) {
        var roles = this.roles.map(function (role) { return role.role; });
        //console.log(roles.join(','));
        var possible = this.script.roles.filter(function (r) { return (!roles.includes(r.role) && (r.team === team)); });
        //console.log('getRole',team, possible);
        return possible[0];
    };
    StoryTeller.prototype.learn = function (correctCount, totalCount, infoType, droisoned) {
        if (droisoned === void 0) { droisoned = false; }
        var info;
        var selfName = "Zam";
        switch (infoType) {
            case 'townsfolk':
                info = this.learnTeam('townsfolk', 2, selfName);
                break;
            case 'outsider':
                info = this.learnTeam('outsider', 2, selfName);
                break;
            case 'minion':
                info = this.learnTeam('minion', 2, selfName);
                break;
        }
        if (info === undefined) {
            info = {
                possible: ['none'],
                info: 'none'
            };
        }
        //DEBUG
        //console.log('learn','townsfolk',info.possible.join(' or '),info.info);
        return info;
    };
    StoryTeller.prototype.learnTeam = function (team, count, selfName) {
        var info = {
            possible: new Array,
            info: ""
        };
        //Select from the correct team (not yourself, to be kind)
        var options = this.roles.filter(function (player) { return ((player.team == team) && (player.name != selfName)); });
        //console.log('options', team, count, selfName);
        //librarian, no outsiders in play
        if (options.length === 0) {
            info.info = 'none';
            return info;
        }
        //Choose one at random
        var selected = options[Math.floor(Math.random() * options.length)] || { role: "none", name: "none" };
        //Get the role
        info.info = selected.role;
        info.possible.push(selected.name);
        //Filter players to NOT the selected player or yourself
        var other = this.roles.filter(function (player) { return ((player.name != selected.name) && (player.name != selfName)); });
        var selectedOther = other[Math.floor(Math.random() * other.length)] || { role: "none", name: "none" };
        info.possible.push(selectedOther.name);
        info.possible = this.shuffle(info.possible);
        return info;
    };
    StoryTeller.prototype.learnChefNumber = function () {
        var evilMax = 0;
        var currentChef = 0;
        var lastEvilIndex = false;
        //With recluse?
        for (var i = 0; i < this.roles.length; i++) {
            if (this.roles[i].alignment == 'evil') {
                if ((lastEvilIndex) && ((i - lastEvilIndex) == 1)) {
                    //increment chef
                    currentChef++;
                    if (currentChef > evilMax) {
                        evilMax = currentChef;
                    }
                }
            }
        }
        return evilMax;
    };
    StoryTeller.prototype.shuffle = function (arr) {
        var j, x, i;
        for (i = arr.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = arr[i];
            arr[i] = arr[j];
            arr[j] = x;
        }
        return arr;
    };
    return StoryTeller;
}());
/*
class Player extends PlayerType {
    
}
*/
var express = require("express");
var app = express();
var http = require("http").createServer(app);
var port = process.env.PORT || 3000;
app.get("/", function (req, res) {
    var response = "<h1>Clocktower Setup</h1>";
    //res.send("<h1>Local Express Server here!</h1>");
    console.log('connection');
    //TESTING
    for (var i = 5; i < 13; i++) {
        //NOTE - cannot res.send() more than once - must generate a string before sending a single response!
        response += "<h2>Setting up a " + i + " player game</h2>";
        var st = new StoryTeller(i);
        response += st.outputCounts(i);
        response += "<br>";
        response += "<ul>";
        response += st.outputRoles().join("");
        response += "</ul>";
        var info = st.learn(1, 2, 'townsfolk', false);
        response += 'A washerwoman would learn that there is a "' + info.info + '" between "' + info.possible[0] + '" and "' + info.possible[1] + '"!';
    }
    res.send(response);
});
http.listen(port);
console.log('Listening on port ' + port);
