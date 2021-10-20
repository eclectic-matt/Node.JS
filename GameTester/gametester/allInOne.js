class Card {

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





class Deck {

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



class DeckType{

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
				let thisCard = new Card('Joker', suits[j], 15, 'card_effect_play_reverses');
				thisDeck.push(thisCard);
			}
		}
		for(let suit of suits){
			for(let value of [2,3,4,5,6,7,8,9,10,11,12,13,14]){
				let name = '' + value;
				let callback = 'card_effect_play_higher_or_magic';
				switch(value){
					case 2:
						name = value + ' - Play Anything';
						callback = 'card_effect_play_anything';
					break;
					case 3:
						name = value + ' - Play 3 or 8';
						callback = 'card_effect_play_three_or_eight'
					break;
					case 8:
						name = value + ' - Invisible';
						callback = 'card_effect_play_invisible';
					break;
					case 9:
						name = value + ' - Lower Than';
						callback = 'card_effect_play_lower_than';
					break;
					case 10:
						name = value + ' - Burn The Pile';
						callback = 'card_effect_play_burn_card';
					break;
					case 11:
						name = 'Jack';
					break;
					case 12:
						name = 'Queen';
					break;
					case 13:
						name = 'King';
					break;
					case 14:
						name = 'Ace';
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

class Player{

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


class Game {
	
	constructor(name='Game', playerCount=1){
		this.name = name;
		this.decks = [];
		this.locations = [];
		this.players = [];
		this.playerCount = playerCount;
		this.activePlayerIndex = 0; //first player
		this.turnOrderChange = 1;	//1 = p1->p2->p3, else p3->p2->p1
	}

	update(time) {
	}

	/**
	 * Change turn order so the game expects the next player to play, based on turnOrderChange.
	 */
	nextPlayer(){
		if(this.turnOrderChange === 1){
			if(this.activePlayerIndex === (this.players.length - 1)){
				this.activePlayerIndex = 0;
			}else{
				this.activePlayerIndex++;
			}
		}else{
			if(this.activePlayerIndex === 0){
				this.activePlayerIndex === (this.players.length - 1);
			}else{
				this.activePlayerIndex--;
			}
		}
	}

	set setTurnOrder(order){
		this.turnOrderChange = order;
	}

	addDeck(deck){
		this.decks.push(deck);
	}

	addPlayer(player){
		this.players.push(player);
		this.playerCount++;
	}

	removePlayer(player){
		for(let i = 0; i < this.playerCount; i++){
			if(this.players[i] === player){
				this.players.slice(i,i+1);
			}
		}
	}

	set setPlayers(players){
		this.players = players;
	}

	shufflePlayers(){
		this.setPlayers = this.players.map((value) => ({ value, sort: Math.random() }))
		.sort((a, b) => a.sort - b.sort)
		.map(({ value }) => value);
	}
}


class Shithead extends Game {
	
	ERROR_INCORRECT_TURN = 10;
	ERROR_INVALID_CARD = 20;
	ERROR_MULTIPLE_NOT_MATCHING = 30;

	setup(){

		//CREATE A DRAW PILE - called "drawPile", hidden, and owned by no-one
		var drawPile = new Deck('drawPile', true, null);
		//GENERATE THE CARDS BASED ON THE SHITHEAD RULES
		var cardArray = new DeckType('SHITHEAD_CARDS');
		//ADD CARDS IN BULK
		drawPile.addCards(cardArray,false);
		//SHUFFLE THE CARDS
		drawPile.shuffle();
		//ADD THE DRAW PILE TO THE DECK
		this.addDeck(drawPile);

		//CREATE PLAYERS
		for(var i = 1; i <= this.playerCount; i++){
			
			//GENERATE A PLAYER NAME
			let playerName = 'Player' + i;
			
			//CREATE A PLAYER CALLED "P" + i (1,2,3,4)
			let player = new Player(playerName);

			//CREATE THE PLAYER'S HAND
			let playerHand = new Deck(playerName + 'Hand', false, player);
			//DRAW 3 CARDS FROM THE DECK
			let handCards = this.decks[0].draw(3, true);
			//ADD THEM TO THE HAND DECK
			playerHand.addCards(handCards);
			//ADD THIS DECK TO THE PLAYER
			player.addDeck(playerHand);
			
			//ADD A FACE DOWN "DECK"
			let playerFaceDownOne = new Deck(playerName+'FaceDownOne',true, player);
			let faceDownCardOne = this.decks[0].draw(1, true);
			playerFaceDownOne.addCard(faceDownCardOne);
			player.addDeck(playerFaceDownOne);

			//ADD THE OTHER FACE DOWN "DECK"
			let playerFaceDownTwo = new Deck(playerName+'FaceDownTwo',true, player);
			let faceDownCardTwo = this.decks[0].draw(1, true);
			playerFaceDownTwo.addCard(faceDownCardTwo);
			player.addDeck(playerFaceDownTwo);
			
			//ADD A FACE UP "DECK"
			let playerFaceUpOne = new Deck(playerName+'FaceUpOne',false, player);
			let faceUpCardOne = this.decks[0].draw(1, true);
			playerFaceUpOne.addCard(faceUpCardOne);
			player.addDeck(playerFaceUpOne);

			//ADD THE OTHER FACE DOWN "DECK"
			let playerFaceUpTwo = new Deck(playerName+'FaceUpTwo',false, player);
			let faceUpCardTwo = this.decks[0].draw(1, true);
			playerFaceUpTwo.addCard(faceUpCardTwo);
			player.addDeck(playerFaceUpTwo);

			//ADD THIS PLAYER TO THE GAME
			this.addPlayer(player);
		}

		//SHUFFLE THE PLAYERS 
		this.shufflePlayers();

		//ALERT THE FIRST PLAYER
		alert('The first player will be ' + this.players[0].name + '!');
		console.log(this);
	}

	/**
	 * 
	 * @param {object} player - The player attempting to take a turn.
	 * @param {object} deck - The deck of cards being played to.
	 * @param {array} cards - The array of cards being played in this turn.
	 * @returns 
	 */
	playerTurn(player, deck, cards){
		
		//WILL THE TURN ORDER CHANGE AFTER PLAYING THESE CARDS?
		let turnOrderChanges = true;
		//GET PLAYER INDEX
		let thisPlayerIndex = this.players.indexOf(player);
		//CHECK IT IS THIS PLAYER'S TURN
		if(thisPlayerIndex !== this.activePlayerIndex){
			//THROW A "NOT YOUR TURN" ERROR
			return this.ERROR_INCORRECT_TURN;
		}
		let cardValue = -1;
		//CHECK IF ALL CARDS ARE THE SAME VALUE
		if(cards.length > 1){
			//SET THE MATCH VALUE TO THE FIRST CARD VALUE
			let cardValue = cards[0].value;
			//ITERATE THROUGH THE SUBMITTED CARDS
			for(let card of cards){
				//IF THE CARD VALUE DOESN'T MATCH
				if(card.value !== cardValue){
					//THROW A "CARDS DO NOT MATCH" ERROR
					return this.ERROR_MULTIPLE_NOT_MATCHING;
				}
			}
		}
		//CHECK THEY CAN PLAY THIS CARD - GET THE EFFECT FROM THE CARD
		effect = deck.cards[0].callback;
		//TEST THE OUTCOME
		outcome = effect(this, deck, cards[0]);
		//IF THE OUTCOME IS A SUCCESS
		if(outcome === true){
			//ADD EACH OF THE CARDS TO THE DECK
			for(let card of cards){
				deck.addCard(card);
				//CHECK BURN 4-of-a-kind
				if(this.checkFourOfAKind(deck) === true){
					//BURN THE DECK
					deck.empty();
					turnOrderChanges = false;
				}
			}
		}else{
			return this.ERROR_INVALID_CARD;
		}
		//CHECK GAME OVER
		remainingPlayer = this.checkGameOverCondition();
		if(remainingPlayer !== false){
			this.gameOver(remainingPlayer);
		}
		//APPLY IMMEDIATE CARD EFFECTS
		switch(cardValue){
			case 10:
				//MARK THIS PLAYER TAKES ANOTHER TURN
				turnOrderChanges = false;
			break;
			case 15:
				//REVERSE TURN ORDER
				this.turnOrderChange = -1;
			break;
		}
		//APPLY TURN ORDER CHANGES (IF APPLICABLE)
		if(turnOrderChanges === true){
			this.nextPlayer();
		}
	}

	/**
	 * Checks if the top 4 cards of this deck match (true).
	 * @param {object} deck - The deck to check.
	 * @returns boolean True if all 4 top cards match, else false.
	 */
	checkFourOfAKind(deck){
		let topValue = deck.cards[0].value;
		for(let i = 1; i < 4; i++){
			if(deck.cards[i].value !== topValue){
				return false;
			}
		}
		return true;
	}

	/**
	 * The condition for game over (only 1 player with cards left in all decks).
	 * @returns The losing player, or false.
	 */
	checkGameOverCondition(){
		//Array of players still with cards
		let playersWithCards = [];
		//Iterate through the players
		for(let player in this.players){
			//Iterate through that players' decks
			for(let deck in player.decks){
				//If there are cards in this deck
				if(deck.cards.length != 0){
					//Add this player to the array
					playersWithCards.push(player);
					//Move to next player
					break;
				}
			}
		}
		//If there is only 1 player left with cards
		if(playersWithCards.length === 1){
			//Return that player
			return playersWithCards[0];
		}else{
			return false;
		}
	}

	/**
	 * 
	 * @param {object} player - The player who lost!
	 */
	gameOver(player){
		alert('Game is over! Player "' + player.name + '" is the Shithead!');
	}
}



//ALLOWS PLAYING OF ANYTHING ON TOP OF IT (2)
function card_effect_play_anything(game, deck, card){
	//ADD THIS CARD TO THE DECK
	//deck.addCard(card);
	//MOVE TO THE NEXT PLAYER
	//game.nextPlayer();
	return true;
}

//BURN THE DECK - SAME PLAYER'S TURN (10 OR 4-of-a-kind)
function card_effect_play_burn_card(deck){
	//deck.empty();
	return -1;
}

function card_effect_play_higher_or_magic(deck, card){
	let magicArray = [2,3,8,9,10,15];
	let compareCard = deck.cards[0];
	if(magicArray.includes(card.value)){
		//deck.addCard(card);
		return true;
	}else if(compareCard.value <= card.value){
		//deck.addCard(card);
		return true;
	}else{
		return false;
	}
}

function card_effect_play_invisible(deck, card){
	let deckLen = deck.length;
	for(let i = 0; i < deckLen; i++){
		//FOUND AN INVISIBLE, SKIP
		if(deck.cards[i].value === 8){
			continue;
		}else{
			//FOUND A CARD TO MATCH TO
			if(deck.cards[i].value === 3){
				//3 OR 8
				return card_effect_play_three_or_eight(deck, card);
			}else if(deck.cards[i].value === 9){
				//9
				return card_effect_lower_than(deck, card);
			}else{
				//OTHER CARD
				return card_effect_play_higher_or_magic(deck, card);
			}
		}
	}
}

function card_effect_play_lower_than(deck, card){
	let magicArray = [2,3,8,9,10];
	let compareCard = deck.cards[0];
	if(magicArray.includes(card.value)){
		//deck.addCard(card);
		return true;
	}else if(compareCard.value >= card.value){
		//deck.addCard(card);
		return true;
	}else{
		return false;
	}
}

function card_effect_play_three_or_eight(deck, card){
	if( (card.value === 3) || (card.value === 8)){
		//deck.addCard(card);
		return true;
	}else{
		return false;
	}
}

//CREATE THE GAME OBJECT (EXTENDED BY Shithead)
var shithead = new Shithead('Shithead', 4);


console.log(shithead);

//SET UP THE GAME
shithead.setup();

console.log(shithead.decks[0]);

/*console.log(drawPile.cards);
//SHUFFLE THE CARDS IN THE DECK
drawPile.shuffle();
console.log(drawPile.cards);*/