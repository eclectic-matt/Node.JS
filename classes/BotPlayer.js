const discloseThreshold = 0.8;

export class BotPlayer
{
  constructor(role, team, alignment)
  {
    this.role = role;
    this.team = team;
    this.alignment = alignment;
  }
  
  /**
    * atRisk {boolean} Whether the player is at risk.
   **/
  makeAnnouncement(atRisk = false)
  {
    //Will disclose?
    let willDisclose = false;
    //Get a random "disclose chance" 0-0.5
    let disclose = Math.random() / 2;
    //Add 0.5 if atRisk (nominated, in final 3)
    disclose += (atRisk ? 0.5 : 0);
    //If disclose chance above threshold
    if(disclose > discloseThreshold){
      //Will disclose
      willDisclose = true;
    }
    let announcement = '';
    if(willDisclose){
      announcement = this.announceRole();
    }else{
      announcement = this.announceCagey();
    }
    return announcement;
  }
  
  announceRole()
  {
    const prefixes = [
      "I'm the ",
      "I am the ",
      
    ];
    const middle = this.role;
    let prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const msg = prefix + this.role;
    return msg;
  }
  
  announceCagey()
  {
    const prefixes = [
      "I am ",
      "I'm ",
    ];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const team = ( (this.team == "townsfolk" || this.team == "outsider") ? this.team : "townsfolk");
    const middles = [
      "a good character ",
      "a good role ",
      "a powerful role ",
      "a strong character ",
      team + " "
    ];
    const middle = middles[Math.floor(Math.random() * middles.length)];
    const reasons = [
      "but I don't want to announce my role ",
      "and I would rather not disclose my role ",
      "and I am keeping my role quiet ",
      "and I'd like to leave it at that ",
      "but I would prefer not to say more than that "
    ];
    const reason = reasons[Math.floor(Math.random() * reasons.length)];
    const suffixes = [
      "right now ",
      "for now ",
      "at the moment ",
      "at this point ",
      "..."
    ];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const msg = prefix + middle + reason + suffix;
    return msg;
  }
  
}