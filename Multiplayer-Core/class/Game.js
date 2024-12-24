class Game {
	name = null;
	buzzerActive = null;

	constructor(data){
		this.name = data.name || 'Game';
		this.buzzerActive = false;
	}
}