import { playerCounts } from './resources/playerCounts.js';
//import { scripts } from './resources/scripts.js';
//const rolesJSON = require("./resources/roles.json");

/*
//REQUIRE WILL BE NEEDED FOR CANVAS BUT NOT YET
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { createCanvas, loadImage } = require('canvas');
*/

//IMPORT AND GET INSTANCE OF THE ScriptHelper CLASS
import { ScriptHelper } from './classes/ScriptHelper.js';
let SH = new ScriptHelper();
//IMPORT AND GET INSTANCE OF THE RolesHelper CLASS
import { RolesHelper } from './classes/RolesHelper.js';
let RH = new RolesHelper();

/**
  * The main class which holds game information.
**/
export var StoryTeller = /** @class */ (function () {
  
  /**
   * Initialize with a player count and script
   */
  function StoryTeller(playerCount, script, infoOnly = false) {
    if(!infoOnly){
      //console.log('Init StoryTeller',playerCount, script);
      this.playerCounts = playerCounts;
      this.playerCount = playerCount;
      //INITIALISE SCRIPT
      this.script = {};
      const roles = SH.loadScript(script);
      //console.log('loadedRoles', roles);
      this.script.roles = JSON.parse(JSON.stringify(roles));
      this.script.roles = this.shuffle(this.script.roles);
      //console.log('thisScriptRoles', this.script.roles);
      this.scriptName = script;
      //this.roles = [];
      this.assignRoles();
    }
  }
  
  /*
   * get the stored script name 
   */
  StoryTeller.prototype.getScriptName = function(){
    if(this.scriptName){
      return this.scriptName;
    }else{
      return "No script selected";
    }
  }  

  /**
    * assign roles to the players stored in the players array.
  **/
  StoryTeller.prototype.assignRoles = function () {
    //==========
    // INITIAL
    // PASS
    //==========

    this.roles = [];
    var playersArr = this.getPlayersArray();

    for (var i = 0; i < this.playerCount; i++) {
      var thisTeam = playersArr[i];
      var role = this.getNewRole(thisTeam);
      role.playerName = this.getRandomName();
      this.roles.push(role);
    }

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
      if (role.setup === true) {
        
        switch(role.name){
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
                  var oldName = this.roles[j].playerName;
                  //REPLACE ROLE
                  this.roles[j] = JSON.parse(JSON.stringify(newRole));
                  //GETTING NEW ROLE REMOVES NAME - USE OLD NAME
                  this.roles[j].playerName = oldName;
                  //HAVE MADE THIS MODIFICATION, BREAK OUT OF FOR LOOP
                  break;
                }
              }
            }
          break;  //END BARON
          case 'Drunk':
            //DRUNK MODIFICATION
            let thinksRole = this.getNewRole('townsfolk');
            this.roles[roleId].thinksRole = JSON.parse(JSON.stringify(thinksRole));
            //DEBUG ONLY - APPEND DRUNK TO THINKS ROLE
            this.roles[roleId].name = thinksRole.name + ' (Drunk)';
          break;
          case 'Marionette':
            //MARIONETTE MODIFICATION
            let thinksMarioRole = this.getNewRole('townsfolk');
            this.roles[roleId].thinksRole = JSON.parse(JSON.stringify(thinksMarioRole));
            //DEBUG ONLY - APPEND MARIO TO THINKS ROLE
            this.roles[roleId].name = thinksMarioRole.name + ' (Marionette)';
          break;
        }
      }
    } //END setup modification
  }; //assignRoles
  
  /**
   * get a role which has not yet been used for the specified team.
   **/
  StoryTeller.prototype.getNewRole = function (team) {
    var roles = this.roles.map(function (role) {
      return role.name;
    });
    //console.log('getNewRole for', team);
    //console.log('currentRoles',roles.join(','));
    var possible = this.script.roles.filter(function (r) {
      return !roles.includes(r.name) && r.team === team;
    });
    const possibleRoles = possible.map( (r) => { return r.name; });
    //console.log('possible', possibleRoles.join(','));
    //HANDLE TEENSY GAMES WITH 2 OUTSIDERS AND A BARON
    if(possibleRoles.length === 0){
      return false;
    }else{
      return possible[0];  
    }
  };


  
  /**
   * get roles stored in the roles array.
  **/
  StoryTeller.prototype.getRoles = function () {
    return this.roles;
  };

  /**
    * output the roles as "roleName (team) => playerName"
   **/
  StoryTeller.prototype.outputRoles = function () {    
    return this.roles.map(function (role) {
      //TESTING COLOURS - NOT WORKING
      if(role.team === 'minion' || role.team === 'demon'){
        return (
          "* [" + role.name + "](https://wiki.bloodontheclocktower.com/" + role.name.toString().replace(' ','_') + ") **(" + role.team + ")**" + " => " + role.playerName + "\n"
        );
      }else{
        return (
          "* [" + role.name + "](https://wiki.bloodontheclocktower.com/" + role.name.toString().replace(' ','_') + ") *(" + role.team + ")*" + " => " + role.playerName + "\n"
        );
      }
    });
  };

  /*
  //NEEDS MORE TESTING
  StoryTeller.prototype.generateGrimoireImage = function () {
    const canvas = createCanvas(200, 200)
    const ctx = canvas.getContext('2d')
    // Write "Awesome!"
    ctx.font = '30px Impact'
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
  }
  */
  
  
  /**
   * output the count for each type of player at this player count.
  **/
  StoryTeller.prototype.outputCounts = function (playerCount) {
    var counts = this.playerCounts[playerCount - 1] || [];
    let output = 'This game by default has:' + "\n";
    for(let i = 0; i < Object.keys(counts).length; i++){
      let thisType = Object.keys(counts)[i];
      let thisCount = counts[thisType];
      output += '* ' + thisType + ': ' + thisCount + "\n";
    }
    //return JSON.stringify(counts);
    return output;
  };

  
  /**
     * Get a random name which has not already been used in the current roles array.
     * @return {string} A random name.
     */
  StoryTeller.prototype.getRandomName = function () {
    var _this = this;

    var names = [
      "Ant",
      "Bek",
      "Cid",
      "Dak",
      "Eve",
      "Fil",
      "Ged",
      "Haz",
      "Ian",
      "Joe",
      "Kim",
      "Lee",
      "Mat",
      "Niz",
      "Ola",
      "Pat",
      "Rik",
      "Sam",
      "Tom",
      "Una",
      "Val",
      "Xia",
    ];

    var possible = names.filter(function (r) {
      return !_this.roles
        .map(function (p) {
          return p.playerName;
        })
        .includes(r);
    });

    return this.shuffle(possible)[0];
  };

  
  /**
   * get the current players array.
  **/
  StoryTeller.prototype.getPlayersArray = function () {
    //DEFAULT COUNTS (5 PLAYERS)
    var defaultCount = {
      townsfolk: 3,
      outsider: 0,
      minion: 1,
      demon: 1,
    };
    //scale down here for 0-index
    var pCounts = this.playerCounts[this.playerCount - 1] || defaultCount;
    //Assign townsfolk
    var arr = Array(pCounts.townsfolk).fill("townsfolk");
    //Assign outsiders
    for (var i = 0; i < pCounts.outsider; i++) {
      arr.push("outsider");
    }
    //Assign minions
    for (var i = 0; i < pCounts.minion; i++) {
      arr.push("minion");
    }
    //Assign demon - will need to modify here for Legion, Lil monsta etc
    arr.push("demon");
    return this.shuffle(arr);
  };

  

  
  
  StoryTeller.prototype.getPlayerRole = function (name) {
    return this.roles.filter(function (r) {
      return r.playerName === name;
    })[0].name;
  };
  
  StoryTeller.prototype.getActiveRole = function (role) {
    //FILTER ROLES TO THE SPECIFIED ROLE
    const match = this.roles.filter(function (r) {
      return r.name === role;
    });
    //IF THERE IS A MATCHING ROLE
    if(match.length === 1){
      //RETURN THE MATCH
      return match[0];
    }else{
      //THIS ROLE IS NOT IN THE GAME
      return false;
    }
 }
  
 StoryTeller.prototype.getSeatPosition = function(name){
   for(let i = 0; i < this.roles.length; i++){
     if(this.roles[i].playerName === name){
       return i;
     }
   }
   return false;
   //const role = this.roles.filter( (r) => { return r.name === name; });
   //return this.roles.indexOf(role);
 }
  
 StoryTeller.prototype.getNeighbours = function (name, alive = false) {
   //WORK OUT WHERE THIS PLAYER IS SITTING
   const pos = this.getSeatPosition(name);
   //console.log('empathSeatPos', pos);
   const roleCount = this.roles.length;
   let leftPos = false;
   let leftNb = false;
   let rightPos = false;
   let rightNb = false;
   
   //WRAP AROUND LIST OF PLAYERS
   let empathRoles = JSON.parse(JSON.stringify(this.roles));
   for(let i = 0; i < this.roles.length - 1; i++){
      empathRoles.push(this.roles[i]);
   }
   //console.log('empathRoles', empathRoles.map( (r) => { return r.name }).join(','));
   

   //NOT FINDING LIVING NEIGHBOURS?
   if(alive === false){
     //LEFT NEIGHBOUR
     leftPos = ((pos === 0) ? roleCount - 1 : pos - 1);
     //console.log('leftNB', this.roles[leftPos]);
     leftNb = JSON.parse(JSON.stringify(this.roles[leftPos]));
     //RIGHT NEIGHBOUR
     rightPos = ((pos === roleCount - 1) ? 0 : pos + 1);
     //console.log('rightNb', this.roles[rightPos]);
     rightNb = JSON.parse(JSON.stringify(this.roles[rightPos]));
   }else{
     //FIND LEFT LIVING NEIGHBOUR
     if (pos === 0){
       //ITERATE BACK FROM END TO FIND 
       for(let i = roleCount - 1; i > 0; i--){
       }
     }
     //FIND RIGHT LIVING NEIGHBOUR
   }
   //RETURN MATCHED NEIGHBOURS
   return {
     left: leftNb,
     right: rightNb
   }
 }
  
 
 StoryTeller.prototype.learn = function (
    correctCount,
    totalCount,
    infoType,
    selfName,
    droisoned
  ) {
    if (droisoned === void 0) {
      droisoned = false;
    }
    var info;
    //const selfName = "Zam";
    switch (infoType) {
      case "townsfolk":
        info = this.learnTeam("townsfolk", 2, selfName);
      break;
      case "outsider":
        info = this.learnTeam("outsider", 2, selfName);
      break;
      case "minion":
        info = this.learnTeam("minion", 2, selfName);
      break;
    }
    if (info === undefined) {
      info = {
        possible: ["none"],
        info: "none",
      };
    }
    return info;
  };

  
  
  StoryTeller.prototype.learnTeam = function (team, count, selfName) {
    var info = {
      possible: new Array(),
      info: "",
    };
    //Select from the correct team (not yourself, to be kind)
    var options = this.roles.filter(function (r) {
      return r.team == team && r.playerName != selfName;
    });
    //librarian, no outsiders in play
    if (options.length === 0) {
      info.info = "none";
      return info;
    }
    //Choose one at random
    var selected = options[Math.floor(Math.random() * options.length)] || {
      name: "none",
      playerName: "none",
    };
    //Get the role name
    info.info = selected.name;
    //Get the possible (correct) player name
    info.possible.push(selected.playerName);
    //Filter players to NOT the selected player or yourself
    var other = this.roles.filter(function (r) {
      return r.name != selected.name && r.playerName != selfName;
    });
    var selectedOther = other[Math.floor(Math.random() * other.length)] || {
      role: "none",
      name: "none",
    };
    //Push the other possible player name
    info.possible.push(selectedOther.playerName);
    //Shuffle the possible names
    info.possible = this.shuffle(info.possible);
    return info;
  };

  
  
  StoryTeller.prototype.learnChefNumber = function () {
    var evilMax = 0;
    var currentChef = 0;
    var lastEvilIndex = false;
    
    //APPROACH 2 - GENERATE A WRAP-AROUND ARRAY
    let chefRoles = JSON.parse(JSON.stringify(this.roles));
    for(let i = 0; i < this.roles.length - 1; i++){
      chefRoles.push(this.roles[i]);
    }
    //console.log('chefRoles', chefRoles.map( (r) => { return r.name }).join(','));
    let evilPings = [];
    for (let i = 0; i < chefRoles.length; i++){
      //DETECT EVIL PLAYERS
      if(
        this.detectEvil(chefRoles[i])
      ){
        //Was the last player evil?
        if(i - lastEvilIndex == 1){
          //increment chef
          currentChef++;
          //Higher than current chef number?
          if(currentChef >= evilMax){
            //STORE MAX CHEF NUM
            evilMax = currentChef;
            //RESET PINGS ARRAY
            evilPings = [];
            //ITERATE BACK TO GENERATE PINGS ARRAY
            for(let j = i; j >= i - evilMax; j--){
              evilPings.push(chefRoles[j].name);
            }
          }
        }else{
          //RESET CHEF
          currentChef = 0;
        }
        //STORE LAST EVIL INDEX
        lastEvilIndex = i;
      }
    }
        
    //DEBUG - WITH PING NAMES
    return {
      num: evilMax,
      pings: evilPings
    }
    //ACTUAL USE        
    return evilMax;
  };
  
  StoryTeller.prototype.detectEvil = function(role) 
  {
    //DEFAULT TO FALSE
    let evil = false;
    //THE DEMON
    if(role.team === "demon"){
      evil = true;
    //MINION WHO IS NOT THE SPY
    }else if (role.team == "minion" && role.name !== "Spy"){
      evil = true;
    //ELSE IF THE SPY + RANDOM
    }else if (role.name == "Spy" && Math.random() > 0.5){
      evil = true;
    //ELSE THE RECLUSE + RANDOM
    }else if (role.name == 'Recluse' && Math.random() > 0.5){
      evil = true;
    }
    //RETURN EVILNESS
    return evil;
  }
  
  StoryTeller.prototype.learnEmpathNumber = function() {
    const empath = this.getActiveRole('Empath');
    if(!empath){
      //NO EMPATH IN CURRENT GAME
      return false;
    }
    let empathNum = 0;
    const nb = this.getNeighbours(empath.playerName, false);
    //PASS THROUGH DETECT EVIL METHOD
    if(this.detectEvil(nb.left)){
      empathNum++;
    }
    if(this.detectEvil(nb.right)){
      empathNum++;
    }
    return empathNum;
  }
  
  StoryTeller.prototype.outputToDiscord = function(i) {
    //let i = 10;
    let defaultName = 'Zak';
    //let st = new StoryTeller(i);
    let response = "# Clocktower Setup\n\n";
    response += "## Setting up a " + i + " player game of " + this.scriptName + "\n\n";
    
    //response += this.generateGrimoireImage();
    //var st = new StoryTeller(i);
    //OUTPUT TEAM COUNTS
    response += this.outputCounts(i);
    response += "## Generated Roles\n"
    //OUTPUT GENERATED ROLES
    response += this.outputRoles().join("");
    response += "## Example Info\n";
    
    //EXAMPLE INFO
    let empathRole = this.getActiveRole('Empath');
    //console.log('empathRole=',empathRole);
    let empathInfo = this.learnEmpathNumber();
    if(!empathInfo){
      response += "There is no Empath in the game!\n";
    }else{
      response += "The Empath learns a " + empathInfo + "\n";
    }
    response += "\n";
    
   
    var chefInfo = this.learnChefNumber();
    response += "A chef would learn " + chefInfo.num + " *(debug: " + chefInfo.pings.reverse().join(',') + ")*\n";
    //response += "A chef would learn " + chefInfo + "\n";
    
    //var wwInfo = st.learn(1, 2, "townsfolk", st.roles[0].name, false);
    var wwInfo = this.learn(1, 2, "townsfolk", defaultName, false);
    response +=
      "\n" +
      'A washerwoman would learn that there is a "' +
      wwInfo.info +
      '" between "' +
      wwInfo.possible[0] +
      '" and "' +
      wwInfo.possible[1] +
      '"!';
    //var libInfo = st.learn(1, 2, "outsider", st.roles[1].name, false);
    var libInfo = this.learn(1, 2, "outsider", defaultName, false);
    if (libInfo.info !== "none") {
      response +=
        "\n\n" +
        'A librarian would learn there is a "' +
        libInfo.info +
        '" between  "' +
        libInfo.possible[0] +
        '" and "' +
        libInfo.possible[1] +
        '"';
    }else{
      response +=
        "\n\n" +
        'A librarian would learn there are no outsiders in play!';
    }
    //var invInfo = st.learn(1, 2, "minion", st.roles[2].name, false);
    var invInfo = this.learn(1, 2, "minion", defaultName, false);
    response +=
      "\n\n" +
      'A investigator would learn there is a "' +
      invInfo.info +
      '" between "' +
      invInfo.possible[0] +
      '" and "' +
      invInfo.possible[1] +
      '"';
    return response;
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
})();
