import { Character } from '../Character.js';

export class Imp extends Character 
{
  constructor(name, seat, script)
  {
    super(name, seat, script);
    this.role = 'Imp';
    this.team = 'demon';
    this.alignment = 'evil';
  }
  
  actNight(roles)
  {
    //IF ORIGINAL IMP IS DEAD, BUT STARPASS/S.W.
    if(!super.actNight()) return;
    let incorrect = super.getIncorrectFlag(roles);
    //SHOW IMP CHOICES
    let choices = super.choose(roles, 'player', 1);
    return this.sendChoices(choices, incorrect);
  }
  
  sendChoices(choices, incorrect)
  {
    
  }
  
}