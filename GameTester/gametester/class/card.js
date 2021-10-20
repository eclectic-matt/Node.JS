//NO DEPENDENCIES

module.exports = class Card {

	/**
	 * Set up a new card.
	 * @constructor
	 * @param {string} name - The name of this card.
	 * @param {string} suit - The suit of this card.
	 * @param {int} value - The value of this card (default: 0).
	 * @param {string} callback - The callback function to apply the card effects (default: null).
	 * @param {object} owner - The player object, owner of this card (default: null).
	 * @see Deck
	 * @see Card
	 */
	constructor(name, suit, value=0, callback=null, owner=null){
		this.name = name;
		this.suit = suit;
		this.value = value;
		this.callback = callback;
		this.owner = owner;
	}

	compareSuit(card){
		if(card.suit == this.suit){
			return true;
		}else{
			return false;
		}
	}

	compareValue(card){
		if(card.value > this.value){
			return 1;
		}else if(card.value === this.value){
			return 0;
		}else{
			return -1;
		}
	}
}

