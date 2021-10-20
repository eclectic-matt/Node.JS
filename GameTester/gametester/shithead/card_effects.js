/**
 * The card effects - to be refactored.
 */

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

module.exports = {
    card_effect_play_anything: card_effect_play_anything,
    card_effect_play_burn_card: card_effect_play_burn_card,
	card_effect_play_higher_or_magic: card_effect_play_higher_or_magic,
	card_effect_play_invisible: card_effect_play_invisible,
	card_effect_play_lower_than: card_effect_play_lower_than,
	card_effect_play_three_or_eight: card_effect_play_three_or_eight
};
