export class Player 
{
  constructor(discordId, channelId){
    //SET UNIQUE ID (DISCORD ID + CHANNEL ID
    this.uuid = discordId + '_' + channelId;
  }
  
  assignRole(role){
    this.role = role;
    this.alignment = (role.team == 'demon' || role.team == 'minion') ? 'evil' : 'good';
  }
  
  assignSeat(pos){
    this.pos = pos;
  }
  
  gameStart(){
    this.alive = true;
    this.vote = true;
  }
  
  
}