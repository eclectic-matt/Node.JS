const Card = require('./card.js');
const CardEffects = require('../shithead/card_effects');

module.exports = class DeckType{

	/**
	 * A set of types of deck, including the default "Poker" deck.
	 * @constructor
	 * @param {string} type - The type of deck to generate.
	 * @see Deck
	 * @see Card
	 */
	constructor(type){
		switch(type){
			case 'SHITHEAD_CARDS':
				return this.generateShitheadDeck();
			break;
			case 'ALPHABET_CARDS':
				return this.generateAlphabetDeck();
			break;
			case 'POKER_CARDS':
			default:
				return this.generatePokerDeck();
			break;
		}
	}

	/**
	 * Generate a standard Poker deck of cards (array).
	 * @returns a 52-card standard Poker deck.
	 */
	generatePokerDeck(){
		let thisDeck = [];
		let index = 0;
		for(suit of ['Hearts', 'Diamonds', 'Clubs', 'Spades']){
			for(value of ['Ace',2,3,4,5,6,7,8,9,10,'Jack','Queen','King']){
				name = value + ' of ' + suit;
				let thisCard = new Card(name, suit, value);
				thisDeck[index] = thisCard;
				index++;
			}
		}
		return thisDeck;
	}

	/**
	 * Generate a deck of shithead cards (array).
	 * @param {boolean|int} jokers - The number of joker cards to add, false for none (default: false).
	 * @returns a card deck with shithead rules.
	 */
	generateShitheadDeck(jokers=false){
		let thisDeck = [];
		let suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
		let index = 0;
		if(jokers !== false){
			for(let i = 0; i < jokers; i++){
				let j = (i < suits.length) ? i : i % suits.length;
				//let thisCard = new Card('Joker', suits[j], 15, 'card_effect_play_reverses');
				let thisCard = new Card('Joker', suits[j], 15, CardEffects.card_effect_play_reverses);
				thisDeck.push(thisCard);
			}
		}
		for(let suit of suits){
			for(let value of [2,3,4,5,6,7,8,9,10,11,12,13,14]){
				let name = '' + value + ' of ' + suit;
				//let callback = 'card_effect_play_higher_or_magic';
				let callback = CardEffects.card_effect_play_higher_or_magic;
				switch(value){
					case 2:
						name = value + ' - Play Anything - of ' + suit;
						//callback = 'card_effect_play_anything';
						callback = CardEffects.card_effect_play_anything;
					break;
					case 3:
						name = value + ' - Play 3 or 8 - of ' + suit;
						//callback = 'card_effect_play_three_or_eight';
						callback = CardEffects.card_effect_play_three_or_eight;
					break;
					case 8:
						name = value + ' - Invisible - of ' + suit;
						//callback = 'card_effect_play_invisible';
						callback = CardEffects.card_effect_play_invisible;
					break;
					case 9:
						name = value + ' - Lower Than - of ' + suit;
						//callback = 'card_effect_play_lower_than';
						callback = CardEffects.card_effect_play_lower_than;
					break;
					case 10:
						name = value + ' - Burn The Pile - of ' + suit;
						//callback = 'card_effect_play_burn_card';
						callback = CardEffects.card_effect_play_burn_card;
					break;
					case 11:
						name = 'Jack - of ' + suit;
					break;
					case 12:
						name = 'Queen - of ' + suit;
					break;
					case 13:
						name = 'King - of ' + suit;
					break;
					case 14:
						name = 'Ace - of ' + suit;
					break;
				}
				let thisCard = new Card(name, suit, value, callback);
				thisDeck[index] = thisCard;
				index++;
			}
		}
		return thisDeck;
	}

	generateAlphabetDeck(){
		let thisDeck = [];
		for(var i = 0; i < 26; i++){
			let r = String.fromCharCode(65+i);
			let thisCard = new Card(r, r, i);
			thisDeck[i] = thisCard;
		}
		return thisDeck;
	}
}
