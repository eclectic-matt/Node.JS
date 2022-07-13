//module.exports(Player);
export const player = Player;

/**
 * The generic player class
 * @param data An object containing the following properties:
 * 	- ip		The IP address of the client (used for checking)
 * 	- name		(optional) The name of the player
 */
 class Player{
	constructor(data){
		//Assign the IP
		this.ip = data.ip;
		//Assign the user-input name
		this.name = data.name || 'Player';
		//MOVE THIS TO EXTENDED CLASS
		//this.role = data.role || 'Player';
		//Build a string to create a unique player ID (for rejoining on a different device)
		let idStr = this.ip;
		//Generate an md5 hash
		let hash = idStr.createHash('md5');
		//Assign this (hex format) as the ID
		this.id = hash.digest('hex');
	}
}