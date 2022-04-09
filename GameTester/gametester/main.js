//REQUIRE GAME ENGINE CLASS MODULES
const Card = require('./class/card.js');
const Deck = require('./class/deck.js');
const DeckType = require('./class/deckType.js');
const Game = require('./class/game.js');
const Player = require('./class/player.js');

//REQUIRE GAME-SPECIFIC MODULES
const Shithead = require ('./shithead/shithead.js');
const CardEffects = require ('./shithead/card_effects.js');
const e = require('cors');

//PARSE DATA
var shitheadData = JSON.parse('./shithead/shithead.json');
//
var shitheadFunctions = shitheadData.functions;
for(thisFn of shitheadFunctions){
	window[thisFn.name] = new Function(thisFn.arguments, thisFn.body);
}



//CREATE THE GAME OBJECT (EXTENDED BY Shithead)
var shithead = new Shithead('Shithead', 4);
//console.log(shithead);

//SET UP THE GAME
shithead.setup();
//console.log(shithead.decks[0]);

/*
for(let player of shithead.players){
	console.log('#-#-#-#-#-#-#-#-#-#-#-#-#-#');
	console.log('Player Name - ' + player.name);
	console.log('Deck Count - ' + player.decks.length);
	console.log('---------------------------');
	for(let deck of player.decks){
		console.log('Deck Name - ' + deck.name);
		console.log('Deck Count - ' + deck.cards.length);
		console.log('___________________________');
		for(let card of deck.cards){
			console.log('Card Name - ' + card.name);
		}
		console.log('___________________________');
	}
	
}
*/

//let drawPile = shithead.decks[0];
let discardPile = shithead.decks[1];

//EMULATE A FEW TURNS
let turnsToSim = 10;
for(let i = 0; i < turnsToSim; i++){
	let activePlayer = shithead.players[shithead.activePlayerIndex];
	let cardToPlay = 0;
	let turnOutcome = shithead.playerTurn(activePlayer, discardPile, activePlayer.decks[0].cards[cardToPlay]);
	if (turnOutcome !== true){
		console.log(shithead.ERROR_NAMES[turnOutcome]);
	}else{
		console.log('Turn Successful');
		cardToPlay++;
	}
}

