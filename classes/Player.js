/**
 * Player holds the Player data only - anything "in game" is via the Character class.
 **/
export class Player 
{
  /**
   * Sets up a Player (human and bot).
   * @param type {string} The type of Player, either "human" or "bot".
   * @param id {int} The DiscordId for this player (used to send messages).
   * @param name {string} The DiscordName for this player (to output).
   * @return The uuid for this Player.
   **/
  constructor(type, id, name)
  {
    //SET UNIQUE ID
    this.uuid = type + "_" + id + "_" + name;
    this.type = type;
    this.discordId = id;
    this.discordName = name;
    return this.uuid;
  }
  
  message(data)
  {
    if(this.type === "bot") return;
    //const endpoint = 
  }
}