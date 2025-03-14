import { Character } from '../Character.js';

export class Chef extends Character {
  
  constructor(name, seat, script){
    super(name, seat, script);
    this.role = 'Chef';
  }
  
  //ACTS DURING THE NIGHT
  actNight(nightIndex, roles){
    if(nightIndex === 1){
      //GET INCORRECT FLAG FROM Character.class
      let incorrect = super.getIncorrectFlag(roles);
      return super.learnChefNumber(roles, incorrect);
    }else{
      //DOES NOT ACT
      return false;
    }
  }
  
  //NO OTHER METHODS REQUIRED
  
}