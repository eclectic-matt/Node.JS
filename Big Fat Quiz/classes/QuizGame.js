const fs = require('node:fs');
const teamsPath = './data/teams.json';
const adminPath = './data/admin.json';

module.exports = class QuizGame {
  name = undefined;
  teams = [];
  canvases = [];
  admin = {};

  constructor (data) {
    this.name = data.name;
    this.teams = data.teams;
    this.teams ??= [];
    this.canvases = data.canvases;
    this.canvases ??= [];
    this.admin = data.admin;
    this.admin ??= {
      state: "ready",
      view: "welcome",
      current: {
        round: 0,
        question: 0,
        revealed: []
      }
    }
  }

  addTeam(teamName){
  	//const teamResult = Array.prototype.includes.call(this.teams, teamName); 
		
		let existingTeam = true;
		//console.log('QuizGame this.teams ===',this.teams);
		if(this.teams.length === 0){
			existingTeam = undefined;
		}else{
  		existingTeam = this.teams.find( (team) => {
   			return team.name === teamName;
  		});
		}

		const teamResult = (existingTeam === undefined ? false : true);
	  if(teamResult){
      console.log(teamName,'already in the list of teams with', this.teams.join(','));
      return false;
    }else{
     //this.teams = [this.teams, teamName];
     //this.teams.push(teamName);
     const newTeamId = this.teams.length;
     const newTeam = { id: newTeamId, name: teamName, score: 0 };
     this.teams.push(newTeam);
     console.log('New Team Added', teamName);
     console.log('All teams:', this.teams.map( (el) => { return el.name; }).join(','));
     return true;
    }
  }

  getTeams = () => {
    return this.teams;
  }

	updateTeam = (teamId, type, newValue) => {
		for(let i = 0; i < this.teams.length; i++){
			if(this.teams[i].id == teamId){
				this.teams[i][type] = newValue;
			}
		}
		//this.storeJson();
	}

	deleteTeam = (team) => {
		for(let i = 0; i < this.teams.length; i++){
			if(this.teams[i].name === team){
				break;
			}
		}
		if(!i) return false;
		this.teams.splice(i, 1);
		//this.storeJson();
	}



	//VIEW / ADMIN SETTINGS 
	changeView = (view) => {
    this.admin.view = view;
    this.storeAdminJson();
	}

	// UTILITY METHODS
	storeJson = (path, data) => {
		const dataStr = JSON.stringify(data);
		fs.writeFileSync(path, dataStr);
	}

	storeTeamsJson = () => {
		const teamStr = JSON.stringify(this.teams);
		fs.writeFileSync(teamsPath, teamStr);
	}

	storeAdminJson = () => {
		const adminStr = JSON.stringify(this.admin);
    fs.writeFileSync(adminPath, adminStr);
	}



	//

}
