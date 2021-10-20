module.exports = class Deck {

	/**
	 * Set up a new deck.
	 * @constructor
	 * @param {string} name - The name of the deck.
	 * @param {object} owner - The player object, owner of this deck (default: null).
	 * @see DeckType
	 * @see Card
	 */
	constructor(name, hidden=true, owner=null){
		this.name = name;
		this.owner = owner;
		this.hidden = hidden;
		this.cards = [];
	}

	set setOwner(owner){
		this.owner = owner;
	}

	/**
	 * Add a single card to this deck.
	 * @param {object} card - A card object to add to this deck. 
	 * @param {boolean} top - Whether to add to the top of the deck = 0-index (default: true).
	 * @see Card
	 */
	addCard(card, top=true){
		//Only take a single card, el[0] if array
		if(Array.isArray(card) === true){
			card = card[0];
		}
		if(top === true){
			this.cards.unshift(card);
		}else{
			this.cards.push(card);
		}
	}

	/**
	 * Add an array of multiple cards to the deck.
	 * @param {array} array - An array of card objects to add.
	 * @param {boolean} top - Whether to add to the top of the deck = 0-index (default: true).
	 * @see Card
	 */
	addCards(array, top=true){
		let arrLen = array.length;
		for(var i = 0; i < arrLen; i++){
			if(top === true){
				this.cards.unshift(array[i]);
			}else{
				this.cards.push(array[i]);
			}
		}
	}

	/**
	 * @param {array} newCards - The new cards to use as this deck.
	 */
	set setCards(newCards){
		this.cards = newCards;
		//this.cards = [...newCards];
	}	

	/**
	 * Empty the deck of all cards. 
	 */
	empty(){
		this.cards = [];
	}

	/**
	 * Draw cards from this deck.
	 * @param {int} count - The number of cards to draw.
	 * @param {boolean} top - Whether to draw from the top of the deck = 0-index (default: true).
	 * @returns array - The array of drawn card objects.
	 */
	draw(count=1, top=true){
		let drawn = [];
		for(var i = 0; i < count; i++){
			if (top === true){
				drawn.push(this.cards.pop());
			}else{
				drawn.push(this.cards.shift());
			}
		}
		return drawn;
	}
	
	/**
	 * Shuffle this deck (randomise order of array).
	 */
	shuffle(){
		this.setCards = this.cards.map((value) => ({ value, sort: Math.random() }))
		.sort((a, b) => a.sort - b.sort)
		.map(({ value }) => value);
	}
}
