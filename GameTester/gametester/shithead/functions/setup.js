//CREATE A DRAW PILE - called 'drawPile', hidden, and owned by no-one
let drawPile = new Deck('drawPile', true, null);
//GENERATE THE CARDS BASED ON THE SHITHEAD RULES
let cardArray = new DeckType('SHITHEAD_CARDS');
//ADD CARDS IN BULK
drawPile.addCards(cardArray,false);
//SHUFFLE THE CARDS
drawPile.shuffle();
//ADD THE DRAW PILE TO THE DECK
this.addDeck(drawPile);

//CREATE A DISCARD PILE - called 'discardPile', visible, owned by no-one
let discardPile = new Deck('discardPile', false, null);
//NO CARDS YET - JUST ADD IT
this.addDeck(discardPile);

//CREATE A BURN PILE? - called 'burnPile', visible, owned by no-one
//let burnPile = new Deck('burnPile', false, null);

//CREATE PLAYERS
for(var i = 1; i <= this.playerCount; i++){
	
	//GENERATE A PLAYER NAME
	let playerName = 'Player' + i;
	
	//CREATE A PLAYER CALLED 'P' + i (1,2,3,4)
	let player = new Player(playerName);

	//CREATE THE PLAYER'S HAND
	let playerHand = new Deck(playerName + 'Hand', false, player);
	//DRAW 3 CARDS FROM THE DECK
	let handCards = this.decks[0].draw(3, true);
	//ADD THEM TO THE HAND DECK
	playerHand.addCards(handCards);
	//ADD THIS DECK TO THE PLAYER
	player.addDeck(playerHand);
	
	//ADD A FACE DOWN 'DECK'
	let playerFaceDownOne = new Deck(playerName+'FaceDownOne',true, player);
	let faceDownCardOne = this.decks[0].draw(1, true);
	playerFaceDownOne.addCard(faceDownCardOne);
	player.addDeck(playerFaceDownOne);

	//ADD THE OTHER FACE DOWN 'DECK'
	let playerFaceDownTwo = new Deck(playerName+'FaceDownTwo',true, player);
	let faceDownCardTwo = this.decks[0].draw(1, true);
	playerFaceDownTwo.addCard(faceDownCardTwo);
	player.addDeck(playerFaceDownTwo);
	
	//ADD A FACE UP 'DECK'
	let playerFaceUpOne = new Deck(playerName+'FaceUpOne',false, player);
	let faceUpCardOne = this.decks[0].draw(1, true);
	playerFaceUpOne.addCard(faceUpCardOne);
	player.addDeck(playerFaceUpOne);

	//ADD THE OTHER FACE DOWN 'DECK'
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