import { Character } from '../Character.js';

export class Librarian extends Character {
  
  constructor(name, seat, script){
    super(name, seat, script);
    this.role = 'Librarian';
  }
  
  //ACTS DURING THE NIGHT
  actNight(roles)
  {
    //CHECK ABLE TO ACT 
    if(!super.actNight()) return;
    //MARK ABILITY USED
    this.hasAbility = false;
    //GET INCORRECT FLAG FROM Character.class
    let incorrect = super.getIncorrectFlag(roles);
    //RETURN INFO
    return super.learnRoleFromTeam(roles, 1, 2, 'outsider', incorrect);
  }
  
  
  
  //NO OTHER METHODS REQUIRED
  
}