import { Character } from '../Character.js';

export class Recluse extends Character {
  
  constructor(name, seat, script){
    super(name, seat, script);
    this.role = 'Recluse';
    this.team = 'outsider';
  }
  
  //ACTS DURING THE NIGHT
  actNight(roles)
  {
    //CHECK ABLE TO ACT 
    if(!super.actNight()) return;
    //ABILITY USED - ONE TIME CHAR ABILITY
    this.hasAbility = false;
    if(!super.actNight()) return;
    //GET INCORRECT FLAG FROM Character.class
    let incorrect = super.getIncorrectFlag(roles);
    //RETURN INFO
    return super.learnRoleFromTeam(roles, 1, 2, 'TEMPLATE', incorrect);
    
 }
  
  //NO OTHER METHODS REQUIRED
  
}