/**
 * The Players class.
 * Consider how to implement player count limits etc.
 */
//export default class Players{
class Players{

	players = [];
	playerHistory = [];
	playerCount = 0;
	adminIP = null;

	constructor(data = null){

		//Assign players from the data object (if supplied)
		this.players = data.players || [];
		//Start a player history
		this.playerHistory = data.players || [];
		//Set the player count
		this.playerCount = this.players.length;
		//Store the standard admin IP
		this.adminIP = '::ffff:192.168.1.227';
		console.log('PLAYERS: initialized');
	}

	//Add a new player, first checking if the player is already added
	addPlayer(player){

		//Generate the result of checking for this player
		let checkPlayerResult = this.checkPlayer(player);
		//If this player already exists
		if (checkPlayerResult === true){
			return false;
		}
		//Add player to players array
		this.players = this.players.slice().push(player);
		console.log('PLAYERS: New player added - ID ' + player.id);
	}

	//Check if this player is already in the player array (by ID)
	checkPlayer(player){

		//Iterate through the players (order doesn't matter)
		for(let currentPlayer in this.players){
			//If the current id matches the player being checked
			//Note: not using "includes" here as name might be updated
			if (currentPlayer.id === player.id){
				//Existing player (id) found
				return true;
			}
		}
		//Player not found
		return false;
	}

	//Update a player (IP, Name etc)
	updatePlayer(id, newPlayer){

		//Iterate players by index
		for(let i = 0; i < this.players.length; i++){
			//If the IDs match
			if(this.players[i].id === id){
				let players = this.players.slice();
				players[i] = newPlayer;
				this.players = players;
				console.log('PLAYERS: Player ID ' + id + ' updated');
				return true;
			}
		}
		return false;
	}

	//Remove a player from the array
	removePlayer(player){

		//Check if this player is part of the array
		//Note: checking using includes here, as the ip/name should be set
		if(!this.players.includes(player)){
			//Player not found
			return false;
		}
		//Set the playerIndex to null (checked later)
		let playerIndex = null;
		//WILL THIS WORK?
		//playerIndex = this.players.indexOf(player);
		//Iterate players by index
		for(let i = 0; i < this.players.length; i++){
			//If the player is found
			if(this.players[i] === player){
				//Set the playerIndex
				playerIndex = i;
			}
		}
		//If the playerIndex was found
		if(playerIndex){
			//Update the player array to remove this player
			this.players = this.players.slice(playerIndex,1);
			console.log('PLAYERS: Player ID ' + player.id + ' removed');
			return true;
		}
	}
}
