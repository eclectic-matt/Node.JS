const Game = require('../class/game.js');
const Deck = require('../class/deck.js');
const DeckType = require('../class/deckType.js');
const Player = require('../class/player.js');
const CardEffects = require('./card_effects.js');

/* https://stackoverflow.com/a/2392888/16384571 */

module.exports = class Shithead extends Game {
	
	ERROR_INCORRECT_TURN = 10;
	ERROR_INVALID_CARD = 20;
	ERROR_MULTIPLE_NOT_MATCHING = 30;
	ERROR_NAMES = {
		10: "It is not your turn!",
		20: "You have played a card which is not allowed!",
		30: "You have played multiple cards which are not the same value!"
	};

	setup(){

		//CREATE A DRAW PILE - called "drawPile", hidden, and owned by no-one
		let drawPile = new Deck('drawPile', true, null);
		//GENERATE THE CARDS BASED ON THE SHITHEAD RULES
		let cardArray = new DeckType('SHITHEAD_CARDS');
		//ADD CARDS IN BULK
		drawPile.addCards(cardArray,false);
		//SHUFFLE THE CARDS
		drawPile.shuffle();
		//ADD THE DRAW PILE TO THE DECK
		this.addDeck(drawPile);

		//CREATE A DISCARD PILE - called "discardPile", visible, owned by no-one
		let discardPile = new Deck('discardPile', false, null);
		//NO CARDS YET - JUST ADD IT
		this.addDeck(discardPile);

		//CREATE A BURN PILE? - called "burnPile", visible, owned by no-one
		//let burnPile = new Deck('burnPile', false, null);

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
		//alert('The first player will be ' + this.players[0].name + '!');
		console.log('The first player will be ' + this.players[0].name + '!');
		//console.log(this);
	}

	/**
	 * 
	 * @param {object} player - The player attempting to take a turn.
	 * @param {object} deck - The deck of cards being played to.
	 * @param {array} cards - The array of cards being played in this turn.
	 * @returns 
	 */
	playerTurn(player, deck, cards){
		
		//WRAP TO MAKE ARRAY IF SINGLE CARD PLAYED
		if(!Array.isArray(cards)){
			cards = [cards];	
		}

		//TESTING
		console.log(player.name + ' is taking a turn');
		console.log('Playing to ' + deck.name);
		console.log('Playing a ' + cards[0].name);

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
		
		//THE OUTCOME OF PLAYING A CARD (TRUE IF NO EXISTING EFFECTS)
		let outcome = true;
		//IF THERE IS AN EXISTING CARD ON THE DECK (FOR EFFECTS)
		if(deck.cards.length > 0){
			//CHECK THEY CAN PLAY THIS CARD - GET THE EFFECT FROM THE CARD
			let effect = deck.cards[0].callback;
			//TEST THE OUTCOME
			//outcome = eval(effect + '(this, deck, cards[0]);');
			outcome = effect(this, deck, cards[0]);
			console.log('Card Outcome = ' + outcome);
		}

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
				//REMOVE A CARD FROM THAT PLAYER
				player.decks[0].draw(1);
				//IF THERE ARE CARDS IN THE MAIN DRAW PILE
				if(this.decks[0].cards.length > 0){
					player.decks[0].addCard(this.decks[0].draw(1));
				}
			}
		}else{
			return this.ERROR_INVALID_CARD;
		}
		//CHECK GAME OVER
		let remainingPlayer = this.checkGameOverCondition();
		if(remainingPlayer !== false){
			this.gameOver(remainingPlayer);
			exit();
		}
		//APPLY IMMEDIATE CARD EFFECTS
		switch(cardValue){
			case 10:
				//MARK THIS PLAYER TAKES ANOTHER TURN
				turnOrderChanges = false;
			break;
			case 15:
				//REVERSE TURN ORDER
				this.turnOrderChange = -1 * this.turnOrderChange;
			break;
		}
		//APPLY TURN ORDER CHANGES (IF APPLICABLE)
		if(turnOrderChanges === true){
			this.nextPlayer();
		}

		//GOT TO END, TURN SUCCESSFUL
		return true;
	}

	/**
	 * Checks if the top 4 cards of this deck match (true).
	 * @param {object} deck - The deck to check.
	 * @returns boolean True if all 4 top cards match, else false.
	 */
	checkFourOfAKind(deck){
		//CHECK HOW MANY CARDS IN THIS DECK
		let cardsToCheck = (deck.cards.length > 4) ? 4 : deck.cards.length;
		//UNDER 4, DO NOT BURN
		if(cardsToCheck < 4) return false;
		//GET THE TOP VALUE OF THE DECK
		let topValue = deck.cards[0].value;
		//ITERATE THROUGH THE CARDS
		for(let i = 1; i < cardsToCheck; i++){
			//IF THE VALUE IS NOT THE SAME AS THE TOP CARD
			if(deck.cards[i].value !== topValue){
				//DO NOT BURN
				return false;
			}
		}
		//REACHED HERE, CHECKED 4 MATCHING CARDS, BURN
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
		console.log('Game is over! Player "' + player.name + '" is the Shithead!');
	}
}