var Engine = import('gametester');

//GENERATE THE GAME
var game = new Engine.game();
game.title = 'Shithead';
game.stages.add({'name': 'faceUp'})

//MAKE A DRAW PILE
game.locations.add('locationDrawPile');

//MAKE A PLAYED PILE
game.locations.add('locationPlayedPile');

//AUTO-GENERATE THE CARD DECK
game.objects.add({'type': TYPE_CARD, 'array': 'standardPokerDeck'});
//var cardDeck = new Engine.object({'type': TYPE_CARD, 'array': 'standardPokerDeck'});
//THE ABOVE WILL GENERATE card = {value:1-13, name:Ace-King, suit:Diamonds-Hearts}
//NOTE - ACES ARE LOW - SEE MODIFICATION LATER

//ADD EFFECTS TO CARDS BASED ON THEIR VALUE
for (card in game.objects){
	switch (card.value){
		//ACE
		case 1:
			//SET TO HIGH
			card.value = 14;
		break;
		case 2:
			card.name = 'Play Anything';
			card.effect = effectPlayAnything;
		break;
		case 3:
			card.name = '3 or an 8';
			card.effect = effectPlayThreeEight;
		break;
		case 8:
			card.name = 'Invisible';
			card.effect = effectInvisible;
		break;
		case 9:
			card.name = 'Lower Than';
			card.effect = effectLowerThanNine;
		break;
		case 10:
			card.name = 'Burn Deck';
			card.effect = effectBurnDeck;
		break;
		default:
			card.effect = effectSameOrHigher;
		break;
	}
}

//DEFINE EFFECTS
game.effects.add({
	'name': 'effectPlayAnything',
	'effect': function(nextCard){
		if (nextCard.value > 1){
			return true;
		}else{
			return false;
		}
	}
});

game.effects.add({
	'name': 'effectSameOrHigher',
	'effect': function(nextCard, cardStack){
		if (nextCard.value >= cardStack[0].value){
			return true;
		}else{
			return false;
		}
	}
});

game.effects.add({
	'name': 'effectPlayThreeEight',
	'effect': function(nextCard){
		if ( (nextCard.value === 3) || (nextCard.value === 8) ){
			return true;
		}else{
			return false;
		}
	}
});

game.effects.add({
	'name': 'effectInvisible',
	'effect': function(nextCard, cardStack){
		if (nextCard.value >= cardStack[1].value){
			return true;
		}else{
			return false;
		}
	}
});

game.effects.add({
	'name': 'effectLowerThanNine',
	'effect': function(nextCard){
		if (nextCard.value <= 9){
			return true;
		}else{
			return false;
		}
	}
});

game.effects.add({
	'name': 'effectBurnDeck',
	'effect': function(nextCard, cardStack){
		cardStack = [];
	}
});

var playerCount = 4;
for (var i = 1; i < playerCount; i++){
	game.players.add('player' + i);
	game.location.add('locationPlayer' + i + 'faceupPile');
}

