//import CharacterMap from './characters/CharacterMap.js';


export class Character 
{
  constructor(player, seat, script)
  {
    //Initialise core info
    this.alive = true;
    this.vote = true;
    this.alignment = "good";
    this.team = "townsfolk";
    this.droisoned = false;
    //SETUP PLAYER
    this.player = player;
    //Set player name
    this.name = player.name;
    //STORE SCRIPT
    this.script = script;
    //STORE SEAT POSITION
    this.seat = seat;
    //ONE-USE ABILITY USED
    this.hasAbility = true;
    //REMINDER TOKENS 
    this.reminderTokens = [];
    //NOMINATION FLAGS
    this.hasNominatedToday = false;
    this.hasBeenNominatedToday = false;
  }
  
  //================
  // CORE FUNCTIONS
  //================
  //NOTE: FOR HARD-CHECKING, IN GAME, USE detectRole() TO APPLY MIS-REGISTRATION
  getRoleName()
  {
    return this.role;  
  }
  
  getPlayerName()
  {
    return this.name;
  }
  
  //USE IN GAME
  detectTeam()
  {
    //BY DEFAULT, JUST RETURN THE TEAM
    return this.team;
  }
  
  //USE IN GAME
  detectAlignment()
  {
    //BY DEFAULT, JUST RETURN THE ALIGNMENT
    return this.alignment;
  }
  
  //USE IN GAME
  detectRole()
  {
    //BY DEFAULT, JUST RETURN THIS ROLE
    return this.role;
  }
  
  getNeighbours(roles)
  {
    //GET THE INDEXES OF THIS PLAYER'S NEIGHBOURS
    let leftNbIndex = (this.seat - 1 < 0 ? roles.length - 1 : this.seat - 1);
    let rightNbIndex = (this.seat + 1 > roles.length - 1 ? 0 : this.seat + 1);
    //RETURN THE ROLES
    return {
      leftNb: roles[leftNbIndex],
      rightNb: roles[rightNbIndex]
    }
  }
  
  //GENERIC "CAN THIS CHARACTER USE THEIR ABILITY" METHOD
  canAct()
  {
    //IF DEAD
    if(!this.alive){
      return false;
    }
    //NO ABILITY (ONE-USE)
    if(!this.hasAbility){
      return false;
    }
    //ELSE, CAN USE ABILITY
    return true;
  }
  
  //==========
  //TRIGGERS
  //==========
  //FT red herring etc.
  onSetup()
  {
    //NO SPECIAL EFFECT
    return true;
  }
  
  onNomination(nominator)
  {
    //CHECK IF HAS BEEN NOMINATED TODAY
    if(!this.hasBeenNominatedToday){
      //NO SPECIAL EFFECT
      return true;
    }else{
      //NOT PERMITTED
      return false;
    }
  }
  
  onNominate(nominee)
  {
    //DEAD PLAYERS CANNOT NOMINATE
    if(!this.alive){
      return false;
    }
    //CHECK IF HAS NOMINATED TODAY ALREADY
    if(!this.hasNominatedToday){
      //NO SPECIAL EFFECT
      return true;
    }else{
      //NOT PERMITTED
      return false;
    }
  }
  
  onExecution()
  {
    //NO SPECIAL EFFECT
    return true;
  }
  
  //goon?
  onChosen(chooser)
  {
    //NO SPECIAL EFFECT
    return true;
  }
  
  //soldier, monk
  onDeath(killer)
  {
    //NO SPECIAL EFFECT
    return true;
  }
  
  
  //============
  //INFORMATION
  //============
  
  //called first, determines if able to act
  actNight()
  {
    return this.canAct();
  }
  
  /**
   * All players can use the /public command and
   * this information will be displayed.
   * Obviously only the actual role will have an effect.
   **/
  actPublic(roles)
  {
    //GET THE PUBLIC ROLES ON THE SCRIPT
    let publicRoles = roles.filter( (r) => {
      return r.ability.contains('public');
    });
    //RETURN THE PUBLIC ROLES AVAILABLE
    return publicRoles.map( (r) => { return r.name; });
  }
  
  /**
   * Return the choices available to this public role.
   * TODO: DECIDE IF BETTER TO GET THE ROLE CLASS
   * AND HANDLE AS PER THE ROLE?
   */
  choosePublic(role)
  {
    switch(role){
      case 'Slayer':
        return this.choose('player', 1);
      break;
      case 'Gossip':
        //NO IDEA HOW TO MAKE THIS WORK
        //CHAT GPT? ALSO FOR ARTIST
        return false;
      break;
      case 'Juggler':
        return this.choose('playerAndCharacter', 1, 5);
      break;
      case 'Klutz':
        return this.choose('player', 1);
      break;
    }
  }
  
  /**
   * Generic method to make a choice - returns an array of options.
   * @param roles {array} The roles array.
   * @param type {string} The type of choice (player, character, team).
   * @param minCount {int} The minimum number of choices to make.
   * @param maxCount {int|boolean} The maximum number of choices, or false if exactly the minCount.
   * @param restriction {string|boolean} The type of restriction to this choice (not self, alive etc).
   * @param modification {string|boolean} The modification to make (e.g. Pit-Hag, Hatter).
   * @param optional {boolean} Whether the player can choose NOT to make this choice.
   **/
  
  //examples:
  // FortuneTeller - choose(player, 2)
  // Monk - choose(player, 1, false, 'notself')
  // Juggler - choose(playerAndCharacter, 1, 5)
  
  choose(roles, type, minCount, maxCount=false, restriction=false, modification=false, optional=false)
  {
    //INIT THE RETURN OBJECT - THESE WILL BE MESSAGED TO THE USER/CHOSEN BY THE BOT
    let options = {
      optionType: type,
      choiceOptions: [],
      modificationOptions: [],
      choiceCount: minCount,
      required: optional
    };
    
    //IS THERE A VARIABLE COUNT?
    if(maxCount){
      options.choiceCount = [minCount, maxCount]
    }
    
    //SWITCH BASED ON CHOICE TYPE
    switch(type){
      case 'player':
        //RETURN PLAYERS ARRAY
        options.choiceOptions = roles.map( (r) => {
          return r.name;
        });
      break;
      case 'character':
        //GET ALL CHARS IN SCRIPT HERE!!
        //let scriptRoles = SH.getScriptData(this.script);
        //RETURN CHARACTERS ARRAY
        options.choiceOptions = roles.map( (r) => {
          return r.role;
        })
      break;
      case 'playerAndCharacter':
        //CERENOVUS, PIT-HAG - JUST PLAYER HERE, THEN CHAR IN modificationOptions?
        options.choiceOptions = roles.map( (r) => {
          return r.name;
        });
        /*
        //PUSH PLAYERS
        options.choiceOptions.push(roles.map( (r) => {
          return r.name;
        }));
        //PUSH CHARACTERS
        options.choiceOptions.push(roles.map( (r) => {
          return r.role;
        }));
        */
      break;
    }
    
    //APPLY RESTRICTIONS BEFORE SENDING BACK OPTIONS
    if(restriction){
      //UPDATE OPTIONS TO REMOVE INVALID CHOICES
      switch(restriction){
        case 'notSelf':
          //REMOVE this.name
          options.choiceOptions = options.choiceOptions.filter( (r) => {
            return r.name != this.name;
          });
        break;
        case 'alive':
          //REMOVE DEAD PLAYERS 
          options.choiceOptions = options.choiceOptions.filter( (r) => {
            return r.alive;
          });
        break;
        case 'dead':
          //REMOVE ALIVE PLAYERS
          options.choiceOptions = options.choiceOptions.filter( (r) => {
            return !r.alive;
          });
        break;
        case 'good':
          //REMOVE EVIL ROLES, e.g. Philo
          options.choiceOptions = options.choiceOptions.filter( (r) => {
            return (r.team == 'townsfolk' || r.team == 'outsider');
          });
        break;
      }
    }
    
    //MODIFICATION REQUIRED
    if(modification){
      options.modificationOptions = [];
    }
    return options;
  }
  
  //DEFAULT METHOD FOR HANDLING A CHOICE
  handleChoice(){
    //DEFAULT, NO EFFECT
    return true;
  }
  
  //NEED ROLES ARRAY TO CHECK FOR VORTOX
  //NOTE: THIS IS FOR *INFORMATION ROLES* ONLY
  //USE this.droisoned FOR ABILITY EFFECTS
  getIncorrectFlag(roles)
  {
    //Check for Vortox in game
    let vortox = roles.find( (r) => {
      return r.role == 'Vortox';
    });
    //IF TOWNSFOLK IN A VORTOX GAME
    if(this.team == 'townsfolk' && vortox){
      //MUST BE INCORRECT 
      return true;
    }
    //IF CURRENTLY DROISONED
    if(this.droisoned){
      //Very likely to get false
      return (Math.random() < 0.9);
    }else{
      //NOT DROISONED, NO INCORRECT INFO
      return false;
    }
  }
  
  /**
   * Generic method to learn possible members of a certain team 
   * e.g. Washerwoman, Librarian, Investigator
   * @param roles {array} The player roles array.
   * @param team {string} The team name (e.g. "minion").
   * @param correctCount {int} The number of correct players in the results.
   * @param totalCount {int} The total number of players in the results.
   * @param incorrectFlag {boolean} Whether to be incorrect with these results.
   * NOTE: use super.getIncorrectFlag() to check droison/Vortox.
   */
  learnRoleFromTeam(roles, team, correctCount, totalCount, incorrectFlag) 
  {
    //INITIALIZE THE RETURN OBJECT
    var info = {
      info: '',
      possible: new Array(),
    };
    
    //VORTOX OR rand() FOR DROISONING
    if(incorrectFlag){
      //PROVIDE STRICTLY FALSE DATA
      //TRY TO GET A VALID ROLE (WE WILL NOT BE USING THE NAME)
      let options = roles.filter( (r) => {
        return r.detectTeam() == team && r.name != this.name;
      });
      let possible = [];
      //NO INVALID OPTIONS IN THE GAME - MUST BE FALSE SO CANNOT SAY "NONE"
      if(options.length == 0){
        //GET A ROLE NOT IN THE CURRENT GAME
        info.info = this.getUnassignedRole(roles, team);
        possible = roles.filter( (r) => {
          return r.name != this.name;
        });
      }else{
        //THERE ARE VALID OPTIONS, AVOID USING THEM
        possible = roles.filter( (r) => {
          return !options.includes(r);
        });
      }
      //ITERATE THROUGH INCORRECT OPTIONS TO GET FALSE POSSIBLES
      for(let i = 0; i < totalCount; i++){
        let selectedIndex = Math.floor(Math.random() * possible.length);
        let selected = possible[selectedIndex];
        info.possible.push(selected.name);
        possible.splice(selectedIndex, 1);
      }
    //ELSE, RETURN VALID INFO
    }else{
      //Select from the correct team
      var options = roles.filter(function (r) {
        return r.detectTeam() == team && r.name != this.name;
      });
      //librarian, no outsiders in play
      if (options.length === 0) {
        info.info = "none";
        return info;
      }
      
      //INFO IS POSSIBLE TO RETURN
      options = this.shuffle(options);
      
      //ITERATE THROUGH THE CORRECT REQUIRED
      for(let i = 0; i < correctCount; i < options.length){
        //GET A VALID OPTION
        let selectedIndex = Math.floor(Math.random() * options.length);
        let selected = options[selectedIndex];
        //Get the role name
        info.info = selected.role;
        //Get the possible (correct) player name
        info.possible.push(selected.name);
        //REMOVE FROM THE OPTIONS
        options.splice(selectedIndex, 1);
      }
      
      //THEN FILL THE REMAINDER WITH INCORRECT INFORMATION
      let possibleNames = info.possible.map( (r) => { return r.name; });
      var invalid = roles.filter(function (r) {
        return !possibleNames.includes(r.name);
      });
      
      let remaining = totalCount - correctCount;
      for(let i = 0; i < remaining; i < invalid.length){
        let selectedIndex = Math.floor(Math.random() * invalid.length);
        let selected = invalid[selectedIndex];
        info.possible.push(selected.name);
        invalid.splice(selectedIndex, 1);
      }
    }
    //RETURN WHATEVER INFO
    return info;
  };
  
  learnChefNumber(roles, incorrect)
  {
    //CALCULATE CORRECT CHEF NUMBER
    
    //IF INCORRECT
    if(incorrect){
      //GIVE A NUMBER FROM 0-evilCount
      //WHICH IS NOT CORRECT
    }
  }

  //GET AN UNASSIGNED ROLE FOR THE SELECTED TEAM
  getUnassignedRoles(roles, team)
  {
    //let scriptRoles = SH.getScriptData(this.script);
    let possible = this.script.filter( (r) => {
      return !roles.includes(r) && r.team == team;
    });
    let selectedIndex = Math.floor(Math.random() * possible.length);
    return possible[selectedIndex].role;                               
  }
}