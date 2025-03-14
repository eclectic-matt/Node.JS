import { Character } from '../Character.js';

export class Slayer extends Character {
  
  constructor(name, seat, script){
    super(name, seat, script);
    this.role = 'Slayer';
  }
  
  //ACTS DURING THE NIGHT
  actNight(roles)
  {
    //DOES NOT ACT DURING NIGHT
    return false;
  }
  
  /**
    * Apply the effects of a public choice used by this player.
    * @param roles {array} The roles array.
    * @param publicRole {string} The name of the public role used.
    * @param choice {array|string} The string|array choice made.
    **/
  applyPublicChoice(roles, publicRole, choice)
  {
    //WAS THE PUBLIC ROLE USED NOT THIS ROLE'S NAME?
    if(this.role !== publicRole){
      //NO EFFECT
      return false;
    }
    //ELSE, CAN WE STILL USE OUR ABILITY - ALIVE/ONE-USE
    if(!super.canAct()){
      //NO EFFECT
      return false;
    }
    //ELSE, APPLY PUBLIC SLAYER CHOICE - ASSUME STRING
    let choiceName = choice;
    //CHECK FOR ARRAY (SOMETHING DONE BROKE)
    if(Array.isArray(choice)){
      choiceName = choice[0].name;
    }
    let choiceRole = roles.find( (r) => {
      return r.name === choiceName;
    });
    if(choiceRole.detectTeam() === 'demon'){
      //KILL THE CHOICE
      //choiceRole.
    }
  }
  
  //NO OTHER METHODS REQUIRED
  
}