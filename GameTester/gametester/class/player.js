module.exports = class Player{

	/**
	 * A player object to be used in the game.
	 * @constructor
	 * @param {string} name - The name of the player.
	 * @see Game
	 */
	constructor(name){
		this.name = name;
		this.decks = [];
	}
	addDeck(deck){
		this.decks.push(deck);
	}
}

