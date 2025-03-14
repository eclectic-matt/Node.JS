import { Character } from '../Character.js';

export class FortuneTeller extends Character {
  
  constructor(name, seat, script){
    super(name, seat, script);
    this.role = 'Fortune Teller';
  }
  
  //ACTS DURING THE NIGHT
  actNight(roles)
  {
    //CHECK ABLE TO ACT 
    if(!super.actNight()) return false;
    
    //PLAYER MAKES A CHOICE AT NIGHT
    return super.choose(roles, 'player', 2, 2);
    
    //ABILITY USED - ONE TIME CHAR ABILITY
    //this.hasAbility = false;
    //if(!super.actNight()) return;
    //GET INCORRECT FLAG FROM Character.class
    //let incorrect = super.getIncorrectFlag(roles);
    
    //RETURN INFO
    //return super.learnRoleFromTeam(roles, 1, 2, 'TEMPLATE', incorrect);
    
 }
  
  //NO OTHER METHODS REQUIRED
  
}