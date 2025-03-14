import { Character } from '../Character.js';

export class Washerwoman extends Character {
  
  constructor(name, seat, script){
    super(name, seat, script);
    this.role = 'Washerwoman';
  }
  
  //ACTS DURING THE NIGHT
  actNight(roles)
  {
    //CHECK IF ABLE TO ACT
    if(!super.actNight()) return;
    //MARK ABILITY USED
    this.hasAbility = false;
    //GET INCORRECT FLAG FROM Character.class
    let incorrect = super.getIncorrectFlag(roles);
    //RETURN THE INFO
    return super.learnRoleFromTeam(roles, 1, 2, 'townsfolk', incorrect);
  }
  
  //NO OTHER METHODS REQUIRED
  
}