module.exports = class Game {
	
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
