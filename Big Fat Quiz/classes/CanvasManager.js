const fs = require('node:fs');
const canvasPath = './data/canvases.json';

module.exports = class CanvasManager {

	canvases = [];

	constructor(){
		this.refreshCanvasData();
	}

	refreshCanvasData = () => {
		const cnvStr = fs.readFileSync(canvasPath);
		this.canvases = JSON.parse(cnvStr);
	}

	getTeamCanvases = (team) => {
		this.refreshCanvasData();
		const teamCanvases = this.canvases.find( (t) => {
			return t.team === team;
		});
		return teamCanvases;
	}

	getTeamCanvas = (team, round, question) => {
		//console.log('CURRENT CNV',this.canvases);
		//console.log('GET TEAM CANVAS', team, round, question);
		const teamCnv = this.getTeamCanvases(team);
		//console.log('CANVASES FOR', team, teamCnv);
		if(!teamCnv) return false;
		const cnv = teamCnv.canvases.find( (c) => {
			return ( (c.round == round) && (c.question == question));
		});
		return cnv;
	}

	storeTeamCanvas = (team, round, question, data) => {
		this.refreshCanvasData();
		//ITERATE STORED CANVASES TO FIND RELEVANT DATA
		for(let teamIndex = 0; teamIndex < this.canvases.length; teamIndex++){
			if(this.canvases[teamIndex].team === team){
				for(let canvasIndex = 0; canvasIndex < this.canvases[teamIndex].canvases.length; canvasIndex++){
					let thisCnv = this.canvases[teamIndex].canvases[canvasIndex];
					if( (thisCnv.round === round) && (thisCnv.question === question) ){
						this.canvases[teamIndex].canvases[canvasIndex].data = data;
					}
				}
			}
		}
		this.storeCanvasData(this.canvases);
	}

	storeCanvasData = (data) => {
		const cnvStr = JSON.stringify(data);
		fs.writeFile(canvasPath, cnvStr);
	}

}