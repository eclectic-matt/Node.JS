//GET UTILITIES
import { shuffle, outputDiscordName } from "../utils.js";
//GET CORE RESOURCES
import { playerCounts } from '../resources/playerCounts.js';
import { CharacterMap } from '../classes/characters/CharacterMap.js';



//REQUIRE WILL BE NEEDED FOR CANVAS BUT NOT YET
import { createRequire } from "module";
const require = createRequire(import.meta.url);
//const { createCanvas, loadImage } = require('canvas');


//IMPORT AND GET INSTANCE OF THE ScriptHelper CLASS
import { ScriptHelper } from '../classes/ScriptHelper.js';
let SH = new ScriptHelper();
//IMPORT AND GET INSTANCE OF THE RolesHelper CLASS
import { RolesHelper } from '../classes/RolesHelper.js';
let RH = new RolesHelper();
//IMPORT AND GET INSTANCE OF THE GameManager CLASS
import { GameManager } from '../classes/GameManager.js';
let GM = new GameManager();
//IMPORT AND GET INSTANCE OF THE DiscordManager CLASS
import { DiscordManager } from '../messages/DiscordManager.js';
let DM = new DiscordManager();

/**
 CHARACTER
 .name = playerName
 .role = roleName
 .alive = true|false
**/


/**
  * The main class which holds game information.
**/
export var StoryTeller = /** @class */ (function () {
  
  /**
   * Initialize with a game object (managed by the GameManager).
   * Used once the game is "started" by a Discord user.
   * @param game {object} The game object initialized by GameManager.
   */
  function StoryTeller(game) 
  {
    //DISCORD SETTINGS
    this.gameChannel = game.channel;
    
    //===============
    // GAME SETTINGS
    //===============
    //GET PLAYER COUNT FROM GAME SETTINGS
    this.playerCount = game.settings.playerCount;
    //GET THE PLAYERS ARRAY FOR THE GAME
    this.players = shuffle(game.players);
    this.scriptName = game.settings.script;
    //INITIALIZE THE ACTUAL SCRIPT DATA
    this.script = {};
    
    //===============
    // PLAYERS
    //===============
    //GET THE PLAYER TEAMS ARRAY (townsfolk:1,minion:1,demon:1) FROM RESOURCES
    this.playerTeams = this.getPlayerTeamsArray();
    
    //================
    // SCRIPT ROLES
    //================
    //STORE ROLES LOADED BY THE ScriptHelper
    const roles = SH.loadScript(this.scriptName);
    //STORE THE ROLES IN THIS SCRIPT
    this.script.roles = JSON.parse(JSON.stringify(roles));
    //SHUFFLE THE ROLES IN THIS SCRIPT
    this.script.roles = shuffle(this.script.roles);
    
    //=================
    // GAME STATE 
    //=================
    //NOTE: THE GameManager OBJECT HAS THE "STATE", SUCH AS "init"/"started"/"ended"
    //THIS IS WITHIN THE CURRENT GAME, e.g. NIGHT 1
    //actionsOutstanding - how many actions pending completion in this phase
    //e.g. nightChoices remaining, dayNominations remaining
    this.state = {
      phase: "night",
      dayIndex: 1,
      actionsOutstanding: 0
    }
    
    //=================
    // ROLES SETUP
    //=================
    this.assignRoles();
    
    //SEND ROLES
    this.sendOutRoles();
    
    //==================
    // START NIGHT ONE
    //==================
    //PROCESS NIGHT ONE
    this.processNight();
  }
  
  StoryTeller.prototype.assignRoles = function()
  {
    //==========
    // INITIAL
    // PASS
    //==========

    this.roles = [];
    //ROLES HAVE BEEN SHUFFLED - "i" IS THIS IS THE SEAT POSITION
    for(var i = 0; i < this.playerCount; i++){
      //GET THE CURRENT TEAM (minion, townsfolk) FROM THE PLAYER TEAMS ARRAY
      var thisTeam = this.playerTeams[i];
      //GET A NEW (UNUSED) ROLE FROM THE HELPER METHOD
      var role = this.getNewRole(thisTeam);
      //console.log('new role in team', thisTeam,'role',role.name);
      //GET AN INSTANCE OF THE CHARACTER'S CLASS INITIALIZED WITH (player, seat, script)
      let roleObj = new CharacterMap[role.name.replace(' ','')](this.players[i], i, this.scriptName);
      //WHILE TESTING - CHECK IF ROLE INSTANCE EXISTS
      if(!roleObj){
        throw "Cannot find Character class for the role '" + role + '"';
      }
      //ASSIGN PLAYER NAME
      //role.playerName = this.players[i].name;
      this.roles.push(roleObj);
    }

    //==========
    // MODIFIED
    // SETUP
    //(e.g. BARON)
    //==========
    
    //DO MARIONETTE FIRST TO GET VALID POSITION
    let marioIndex = this.roles.findIndex( (r) => { return r.role == 'Marionette'; });
    if(marioIndex >= 0){
      //GET DEMON NEIGHBOURS
      let demon = this.roles.find( (r) => { return r.team == 'demon'; });
      let nb = this.getNeighbours(demon.playerName);
      if(nb.leftRole.name == 'Marionette' || nb.rightRole.name == 'Marionette') {
        //NO SWAP NEEDED!
      }else{
        //GET NEIGHBOUR TO SWAP WITH MARIO
        let selectedDirection = (Math.random() > 0.5 ? -1 : 1);
        let demonIndex = this.roles.findIndex( (r) => { return r.team == 'demon'; });
        //console.log('mario swap',selectedDirection, demonIndex);
        //GET THE INDEX OF THIS PLAYER
        let swapIndex = ((demonIndex + selectedDirection) > this.roles.length ? 0 : (demonIndex + selectedDirection));
        //let swapIndex = this.roles.findIndex( (r) => { return r.player === selectedDirection.playerName; });
        //STORE OLD PLAYER
        let swapRole = JSON.parse(JSON.stringify(this.roles[swapIndex].player.name));
        //console.log('swapIndex', swapIndex, 'swapRole', swapRole);
        //OVERWRITE SWAP ROLE WITH THE MARIONETTE
        this.roles[swapIndex] = JSON.parse(JSON.stringify(this.roles[marioIndex]));
        this.roles[swapIndex].reminderTokens.push('Is the Marionette');
        //SWAP INTO OLD MARIO ROLE
        this.roles[marioIndex] = JSON.parse(JSON.stringify(swapRole)); 
        
      }
    }
    
    //ITERATE THROUGH ROLES
    for (var roleId in this.roles) {
      //GET THE CURRENT ROLE
      var role = this.roles[roleId];

      //CHECK IF THIS ABILITY HAS A TRIGGER, AND THAT TRIGGER IS SETUP
      if (role.setup === true) {
        
        /*
          Drunk [You think you are a Townsfolk]
          Baron [+2 Outsiders]
          Godfather [−1 or +1 Outsider]
          Fang-Gu [+1 Outsider]
          Vigormortis [-1 Outsider]
          Bounty Hunter [1 Townsfolk is evil]
          Balloonist [+1 Outsider]
          Damsel [+the Damsel]
          Choirboy [+ the King]
          Athiest [No evil characters]
          Marionette [You neighbour the Demon]
          Lil' Monsta [+1 Minion]
          Legion [Most players are Legion]
          Riot [All Minions are Riot]
          Village Idiot [+0 to +2 Village Idiots. 1 of the extras is drunk]
        */
        let villageIdiotsDone = false;
        switch(role.role){
          case 'Baron':
            //BARON MODIFICATION (GENERALISED AS A TEMPLATE)
            var setupTeam = 'townsfolk';
            var modifiedTeam = 'outsider';
            var setupCount = 2;
            //FOR EACH ROLE TO MODIFY
            for (var i = 0; i < setupCount; i++) {
              //GET A NEW ROLE FOR THIS PLAYER
              var newRole = this.getNewRole(modifiedTeam);
              //IF NO AVAILABLE ROLE - BREAK
              if(!newRole) break;
              //ITERATE ROLES TO FIND MATCHING ROLE TO REPLACE
              for (var j = 0; j < this.roles.length; j++) {
                //IF team MATCHES
                if (this.roles[j].team === setupTeam) {
                  //STORE OLD NAME (CHANGING ROLE REMOVES NAME)
                  //var oldName = this.roles[j].player.name;
                  //REPLACE ROLE
                  //this.roles[j] = JSON.parse(JSON.stringify(newRole));
                  let oldPlayer = JSON.parse(JSON.stringify(this.roles[j].player));
                  this.roles[j] = new CharacterMap[newRole.replace(' ','')](oldPlayer, j, this.scriptName);
                  //GETTING NEW ROLE REMOVES NAME - USE OLD NAME
                  //this.roles[j].player.name = oldName;
                  //HAVE MADE THIS MODIFICATION, BREAK OUT OF FOR LOOP
                  break;
                }
              }
            }
          break;  //END BARON
          case 'Drunk':
            //DRUNK MODIFICATION
            let thinksRole = this.getNewRole('townsfolk');
            this.roles[roleId] = new CharacterMap[thinksRole.replace(' ','')](this.roles[roleId].player, roleId, this.scriptName);
            //this.roles[roleId].thinksRole = JSON.parse(JSON.stringify(thinksRole));
            //this.roles[roleId].role = this.roles[roleId].thinksRole.role;
            //DEBUG ONLY - APPEND DRUNK TO THINKS ROLE
            //this.roles[roleId].name = thinksRole.name + ' (Drunk)';
            this.roles[roleId].reminderTokens.push('is the drunk');
          break; //END DRUNK
          case 'Marionette':
            //HANDLED ABOVE, FIRST TO ENSURE VALIDITY OF SWAP
          break;
          case 'Village Idiot':
            //PREVENT OTHER IDIOTS ADDING MORE IDIOTS
            if(!villageIdiotsDone){
            //GET A RANDOM NUMBER (0-2) OF OTHER VILLAGE IDIOTS TO ADD
            let addedIdiotCount = Math.floor(Math.random() * 3);
            //console.log('Adding',addedIdiotCount,'idiots');
            //FLAG WHEN ONE DRUNK V.I. ADDED
            let drunkIdiotAdded = false;
            //ITERATE THROUGH V.I.s TO ADD
            for(let i = 0; i < addedIdiotCount; i++){
              //FIND A NON-V.I. TOWNSFOLK
              let swapIndex = this.roles.findIndex( (r) => { return ( (r.team == 'townsfolk') && (r.role !== 'Village Idiot') ); });
              //NO VALID ROLES - BREAK
              if(swapIndex == -1) break;
              //REPLACE WITH V.I.
              this.roles[swapIndex].role = 'Village Idiot';
              //MAKE ONE OF THE EXTRAS DRUNK
              if(!drunkIdiotAdded){
                //this.roles[swapIndex].name += ' who is drunk';
                this.roles[swapIndex].reminderTokens.push('drunk idiot');
                drunkIdiotAdded = true;
              }
            }
            //SHUFFLE THE ROLES AGAIN (ELSE V.I.s ADDED IN A ROW)
            this.roles = shuffle(this.roles);
            villageIdiotsDone = true;
            }
          break; //END VILLAGE IDIOT
          case 'Godfather':
            //[−1 or +1 Outsider]
            if(Math.random() > 0.5){
              //ADD OUTSIDER
              this.swapTeamMember('townsfolk', 'outsider', 'debug:godfather +1');
            }else{
              //CAN REMOVE OUTSIDER?
              let osIndex = this.roles.findIndex((r) => { return r.team == 'outsider'; });
              //NO AVAILABLE OUTSIDERS?
              if(osIndex == -1){
                //ADD OUTSIDER INSTEAD?
                this.swapTeamMember('townsfolk', 'outsider', 'debug:godfather +1');
                //this.roles[].reminders.push('debug:godfather +1');
              }else{
                this.swapTeamMember('outsider', 'townsfolk', 'debug:godfather -1');
              }
            }
          break; //END GODFATHER
          case 'Fang-Gu':
            //Fang-Gu [+1 Outsider]
            this.swapTeamMember('townsfolk', 'outsider', 'debug:fang-gu +1');
          break;
          case 'Vigormortis':
            //Vigormortis [-1 Outsider]
            this.swapTeamMember('outsider', 'townsfolk', 'debug:vigormortis -1');
          break;
          case 'Balloonist':
            //Balloonist [+1 Outsider]
            this.swapTeamMember('townsfolk', 'outsider', 'debug:ballonist -1');
          break;
          case 'Bounty Hunter':
            //Bounty Hunter [1 Townsfolk is evil]
          break;
          case 'Lil Monsta':
          //Lil' Monsta [+1 Minion]
            this.swapTeamMember('demon', 'minion', 'debug:lil monsta');
          break;
        }
      }
    } //END setup modification
  }; //assignRoles
  
  StoryTeller.prototype.getNewRole = function(team)
  {
    //THESE ARE NOW INSTANCED OBJECTS WITH .role
    var roles = this.roles.map(function (role) {
      return role.role;
    });
    //console.log('current roles', roles);
    //HOWEVER SCRIPT ROLES ARE DOWN AS .name
    var possible = this.script.roles.filter(function (r) {
      return !roles.includes(r.name) && r.team === team;
    });
    //SO THIS ALSO NEEDS TO MAP THE .name
    const possibleRoles = possible.map( (r) => { return r.name; });
    //HANDLE TEENSY GAMES WITH 2 OUTSIDERS AND A BARON
    if(possibleRoles.length === 0){
      return false;
    }else{
      //possible[0].reminderTokens = [];
      return possible[0];
    }
  }  //END getNewRole
  
  //SWAP ROLES FOR SETUP MODIFICATION
  StoryTeller.prototype.swapTeamMember = function(previousTeam, newTeam, cause) 
  {
    //Find the index of a matching role
    let swapIndex = this.roles.findIndex( (r) => { return r.team == previousTeam; });
    //No valid index, return false
    if(!swapIndex) return false;
    //Get an unused role in the new team
    let newRole = this.getNewRole(newTeam);
    //Store the old player
    let oldPlayer = JSON.parse(JSON.stringify(this.roles[swapIndex].player));
    //Swap to the new role and pass in the old player
    this.roles[swapIndex] = new CharacterMap[newRole.replace(' ','')](oldPlayer, swapIndex, this.scriptName);
                                                                      
    //let oldName = this.roles[swapIndex].player.name;
    //this.roles[swapIndex] = JSON.parse(JSON.stringify(newRole));
    //this.roles[swapIndex].player.name = oldName;
    //this.roles[swapIndex].reminderTokens.push(cause);
    //this.roles[oldIndex].reminders.push('debug:was ' + previousTeam);
  }

  StoryTeller.prototype.getPlayerTeamsArray = function()
  {
    //0-indexed
    const pCounts = playerCounts[this.playerCount - 1];
    //Start with townsfolk
    let pArr = Array(pCounts.townsfolk).fill('townsfolk');
    //outsiders
    for(let i = 0; i < pCounts.outsider; i++){
      pArr.push('outsider');
    }
    //minions
    for(let i = 0; i < pCounts.minion; i++){
      pArr.push('minion');
    }
    //Add demon
    pArr.push('demon');
    //Return shuffled playerTeams array
    return shuffle(pArr);
  }
  
  StoryTeller.prototype.sendOutRoles = function()
  {
    //DEBUG
    let rolesOutput = "**Sending out roles...**\n\n";
    
    //ITERATE ROLES
    for(let i = 0; i < this.roles.length; i++){
      let roleInfo = '';
      let role = this.roles[i];
      //console.log('Tell ' + role.player.name + ' they are the ' + role.role);
      roleInfo += 'Hey, *' + role.player.name + '* - you are the **' + role.role + "**";
      //DEMON INFO
      if(role.team == 'demon'){
        let minions = this.roles.filter( (r) => {
          return r.team == 'minion';
        });
        
        minions = minions.map( (r) => {
          return r.player.name;
        }).join(', ');
        //console.log('Also say your minions are: ', minions);
        roleInfo += "\n" + 'Your minion(s) are: ' + minions;
      }
      //MINION INFO
      if(role.team == 'minion'){
        let demon = this.roles.find( (r) => {
          return r.team == 'demon';
        }).player.name;
        roleInfo += "\nYour Demon is: " + demon;
        let otherMinions = this.roles.filter( (r) => {
          return (r.team == 'minion' && r.player.name !== role.player.name);
        });
        if(otherMinions.length > 0){
          otherMinions = otherMinions.map( (r) => {
            return r.player.name;
          }).join(', ');
          //console.log('Also say your Demon is: ' + demon + ' and your fellow minion(s): ' + otherMinions);
          roleInfo += ' and your fellow minion(s) are: ' + otherMinions;
        }
      }
      
      //SEND THIS INFO OUT
      //DM.sendDirectMessage(role.player, roleInfo);
      //PASS TO UTILITY FUNCTION TO HANDLE BOT PLAYERS
      this.sendInfo(role.player, roleInfo);
      //DEBUG - SEND ALL MESSAGE TO MAIN CHANNEL
      //this.postToChannel(roleInfo);
      rolesOutput += roleInfo + "\n\n";
    }
    
    //DEBUG
    this.postToChannel(rolesOutput);
  }

  
  StoryTeller.prototype.processNight = function()
  {
    return true;
    //LOAD SCRIPT DATA FROM ScriptHelper CLASS
    let scriptData = SH.loadScript(this.scriptName);
    switch(this.state.dayIndex)
    {
      //FIRST NIGHT
      case 1:
        //FILTER OUT ROLES WHICH DO NOT ACT FIRST NIGHT
        scriptData = scriptData.filter((r) => {
          return r.firstNight != 0;
        });
        //SORT ON FIRST NIGHT ORDER
        scriptData.sort((a, b) => {
          return a.firstNight - b.firstNight;
        });
      break;
      //OTHER NIGHT
      default:
        //FILTER OUT ROLES WHICH DO NOT ACT ON OTHER NIGHTS
        scriptData = scriptData.filter((r) => {
          return r.otherNight != 0;
        });
        //SORT ON OTHER NIGHT ORDER
        scriptData.sort((a, b) => {
          return a.otherNight - b.otherNight;
        });
      break;
    }
    
    //Debug
    let nightOutput = "**Night " + this.state.dayIndex + "**\n";
    
    //ITERATE NIGHT
    for(let i = 0; i < scriptData.length; i++){
      let currentRole = scriptData[i];
      let gameRole = this.roles.find( (r) => {
        return r.role == currentRole.name;
      });
      if(gameRole){
        
        //console.log('Visit ' + gameRole.player.name + ' the ' + gameRole.role);
        //this.postToChannel('Visit '
        nightOutput += "* Visit **" + gameRole.player.name + "** the *" + gameRole.role + "*\n";
        
        //CHECK IF CHAR ACTS AT NIGHT
        let actResult = gameRole.actNight(this.roles);
        if(actResult !== false){
          //HANDLE ACT RESULT - CHOOSE OR INFO
          if(actResult.optionType !== undefined){
            //SEND OPTIONS TO PLAYER
            this.sendOptions(gameRole.player, actResult);
            //GAME NEEDS TO KNOW TO WAIT FOR THIS TO PROCESS
            this.state.actionsOutstanding++;
          }else{
            //SEND INFO TO PLAYER
            this.sendInfo(gameRole.player, actResult);
          }
        }
      }
    }
    //WAIT FOR ALL RESPONSES
    this.postToChannel(nightOutput);
  }
  
  StoryTeller.prototype.sendOptions = function(player, options)
  {
    //CHECK BOT, MAKE CHOICE AUTO
  }
 
  StoryTeller.prototype.handleChoice = function(player, choice)
  {
    //ALSO BOT
    
    //DECREMENT OUTSTANDING ACTIONS
    this.state.actionsOutstanding--;
    if(this.state.actionsOutstanding == 0){
      this.endPhase();
    }
  }
  
  StoryTeller.prototype.endPhase = function()
  {
    //IF CURRENTLY AT NIGHT
    if(this.state.phase == 'night'){
      //CHANGE TO DAY
      this.state.phase == 'day';
      //ACTIONS OUTSTANDING = num of alive players
      let aliveCount = this.roles.filter( (r) => {
        return r.alive == true;
      }).length;
      //GAME IS NOW WAITING FOR ALIVE PLAYERS TO NOMINATE
      this.state.actionsOutstanding = aliveCount;
      //SETUP START OF DAY
      this.processDayStart();
    }else{
      //CHANGE TO NIGHT
      this.state.phase == 'night';
      //INCREMENT DAY INDEX
      this.state.dayIndex++;
    }
    //SEND MESSAGE ANNOUNCING NEW STATE
    let timeOfDay = (this.state.phase == 'night'? 'night': 'morning');
    console.log('Good ' + timeOfDay + ' everyone...');
  }
  
  StoryTeller.prototype.sendInfo = function(player, info)
  {
    //CHECK IF BOT
    if(player.type === "human"){
      //SEND DIRECT MESSAGE TO PLAYER
      DM.sendDirectMessage(player, info);
    }else{
      //BOT - STORE INFO
      
    }
  }
  
  StoryTeller.prototype.postToChannel = function(info)
  {
    DM.sendPublicMessage(this.gameChannel, info);
  }
  
  StoryTeller.prototype.processDayStart = function()
  {
    //ITERATE ROLES
    for(let i = 0; i < this.roles.length; i++){
      this.roles[i].hasBeenNominatedToday = false;
      this.roles[i].hasNominatedToday = false;
    }
  }
  
  
  //=================
  // OUTPUT INFO
  //=================
  /**
    * output the roles as "roleName (team) => playerName"
   **/
  StoryTeller.prototype.outputRoles = function () {    
    return this.roles.map(function (role) {
      return this.outputRole(role);
    }, this).join("\n");
  };
  
  StoryTeller.prototype.outputRole = function (role) {
    //START OUTPUT
    let output = "* [" + role.getRoleName() + "]";
    output += "(https://wiki.bloodontheclocktower.com/" + role.role.toString().replace(' ','_') + ")";
    if(role.team == 'demon' || role.team == 'minion'){
      output += " **(" + role.team + ")**";
    }else{
      output += " *(" + role.team + ")*";
    }
    output += " => " + outputDiscordName(role.player);
    //output += " => " + role.getPlayerName();
    /*if(role.reminderTokens.length > 0){
     output += ' (' + role.reminderTokens.join(', ') + ')';
    }*/
    //output += "\n";
    return output;
  }
  
  StoryTeller.prototype.outputGrimoire = function()
  {
    
    // Write "Awesome!"
    /*ctx.font = '30px Impact'
    ctx.rotate(0.1)
    ctx.fillText('Awesome!', 50, 100)

    // Draw line under text
    var text = ctx.measureText('Awesome!')
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'
    ctx.beginPath()
    ctx.lineTo(50, 102)
    ctx.lineTo(50 + text.width, 102)
    ctx.stroke()

    // Draw cat with lime helmet
    //loadImage('examples/images/lime-cat.jpg').then((image) => {
    //  ctx.drawImage(image, 50, 0, 70, 70)
    //  console.log('<img src="' + canvas.toDataURL() + '" />')
    //})

    console.log("data:img/png;base64," + canvas.toDataURL());
    return "data:img/png;base64," + canvas.toDataURL();

    let cnv = document.getElementById('grim');
    */
    
    /*const w = 300;
    const h = 300;
    const r = 30;
    const cnv = createCanvas(w, h);
    const ctx = cnv.getContext('2d');
    const pCount = this.roles.length;
    const angleDiff = 2 * Math.PI / pCount;
    let angle = -Math.PI/2;
    const tokenDist = Math.min(cnv.width, cnv.height) / 3;
    //ctx settings
    ctx.fillStyle = '#000';
    ctx.fontStyle = '12pt Arial';
    let midx = w / 2;
    let midy = h / 2;
    for(let i = 0; i < this.roles.length; i++)
    {
      let x = midx + (tokenDist * (Math.cos(angle)));
      let y = midy + (tokenDist * (Math.sin(angle)));
      angle += angleDiff;
      ctx.beginPath();
      ctx.moveTo(x,y);
      //TOKEN CIRCLE
      ctx.arc(x, y, r, 0, 2*Math.PI);
      //NAME BOX
      ctx.fillRect(x-r, y+r, r, r);
      ctx.fillText(outputDiscordName(this.roles[i].player), x-r, y+r);
      ctx.fill();
      ctx.closePath();
    }
    //console.log("data:img/png;base64," + cnv.toDataURL());
    return "data:img/png;base64," + cnv.toDataURL();
    */
  }
  
  return StoryTeller;
})();