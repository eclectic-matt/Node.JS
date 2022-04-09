/*
//HACKY WAY TO LOAD IN JS MODULES IN BROWSER EASILY
let modules = ['class/shithead.js', 'class/game.js', 'class/deck.js', 'class/decktype.js', 'class/card.js', 'class/player.js'];
//ITERATE TO LOAD THIS SCRIPT IN
for(let module in modules){
	dynamicallyLoadScript(module);
}
//LOAD A SINGLE SCRIPT IN
function dynamicallyLoadScript(url) {
	var script = document.createElement("script");  // create a script DOM node
	script.src = url;  // set its src to the provided URL
	//document.head.appendChild(script);  // add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
	//window.appendChild(script);
	document.body.appendChild(script);
}


var dex = new Deck('main','P1');

//var cardArray = new DeckType('POKER_CARDS');
//var cardArray = new DeckType('ALPHABET_CARDS');
var cardArray = new DeckType('SHITHEAD_CARDS');

//ADD CARDS IN BULK
dex.addCards(cardArray,false);
*/
/*
//ADD RANDOM CARDS INDIVIDUALLY
for(var i = 0; i < 100; i++){
	card = randomAlpha();
	dex.addCard(card);
}*/

//console.log(dex.cards);
//SHUFFLE THE CARDS IN THE DECK "dex"
//dex.shuffle();
//console.log(dex.cards);

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