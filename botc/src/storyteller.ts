type Role = {
	name: string,
	role: string,
	alignment: string,
	team: string,
	ability: {
		trigger: string,
		target: string,
		ability: string,
		special: {
			target?: string,
			ability?: string,
			team?: string,
			count?: number,
			modifiedteam?: string
		}
	}
}

type AliveStatus = "alive" | "dead" | "undead";

type VoteStatus = "yes" | "no" | "once";

type PlayerType = {
	id: number,
	name: string,
	seatPosition: number,
	alive: AliveStatus,
	vote: VoteStatus
}

type Info = {
	possible: Array<string>,
	info: string
}

/*
{
  "id": "washerwoman",
  "name": "Washerwoman",
  "edition": "tb",
  "team": "townsfolk",
  "firstNightReminder": "Show the Townsfolk character token. Point to both the *TOWNSFOLK* and *WRONG* players.",
  "otherNightReminder": "",
  "reminders": [
    "Townsfolk",
    "Wrong"
  ],
  "setup": false,
  "ability": "You start knowing that 1 of 2 players is a particular Townsfolk.",
  "firstNight": 37,
  "otherNight": 0
}
*/

class StoryTeller 
{
	playerCounts = [
			undefined, //1
			undefined, //2
			undefined, //3
			undefined, //4
			{ //5
				townsfolk: 3,
				outsider: 0,
				minion: 1,
				demon: 1
			},
			{ //6
				townsfolk: 3,
				outsider: 1,
				minion: 1,
				demon: 1
			},
			{ //7
				townsfolk: 5,
				outsider: 0,
				minion: 1,
				demon: 1
			},
			{ //8
				townsfolk: 5,
				outsider: 1,
				minion: 1,
				demon: 1
			},
			{ //9
				townsfolk: 5,
				outsider: 2,
				minion: 1,
				demon: 1
			},
			{ //10
				townsfolk: 7,
				outsider: 0,
				minion: 2,
				demon: 1
			},
			{ //11
				townsfolk: 7,
				outsider: 1,
				minion: 2,
				demon: 1
			},
			{ //12
				townsfolk: 7,
				outsider: 2,
				minion: 2,
				demon: 1
			},
			{ //13
				townsfolk: 9,
				outsider: 0,
				minion: 3,
				demon: 1
			},
			{ //14
				townsfolk: 9,
				outsider: 1,
				minion: 3,
				demon: 1
			},
			{ //15
				townsfolk: 9,
				outsider: 2,
				minion: 3,
				demon: 1
			}
		]

	playerCount: number;
	script: any;
	roles: Array<Role>;

	constructor(playerCount: number)
	{
		//console.log('Setup', playerCount);
		this.playerCount = playerCount;
		this.script = this.loadScript('tb');
		this.roles = [];
		this.assignRoles();
	}

	loadScript(script: string){
		switch(script){
			case 'tb':
				this.script = {
					name: 'Trouble Brewing',
					roles: [
					{
						role: 'Imp',
						alignment: 'evil',
						team: 'demon',
						ability: {
							trigger: 'eachnight*',
							target: 'any',
							cause: 'death',
							special: {
								target: 'self',
								ability: 'minionBecomesDemon'
							}
						}
					},
					{
						role: 'Poisoner',
						alignment: 'evil',
						team: 'minion',
						ability: {
							trigger: 'eachnight',
							target: 'any',
							cause: 'droison',
							special: undefined
						}
					},
					{
						role: 'Baron',
						alignment: 'evil',
						team: 'minion',
						ability: {
							trigger: 'setup',
							target: undefined,
							cause: '+2outsiders',
							special: {
								team: 'townsfolk',
								modifiedteam: 'outsider',
								count: 2
							}
						}
					},
					{
						role: 'Spy',
						alignment: 'evil',
						team: 'minion',
						ability: {
							trigger: 'registersFalse',
							target: undefined,
							cause: '+2outsiders',
							special: {
								team: 'townsfolk',
								modifiedteam: 'outsider',
								count: 2
							}
						}
						},
						{
							role: 'Scarlet Woman',
							alignment: 'evil',
							team: 'minion',
							ability: {
								trigger: 'execute',
								target: undefined,
								cause: '+2outsiders',
								special: {
									team: 'townsfolk',
									modifiedteam: 'outsider',
									count: 2
								}
							}
						},
						{
							role: 'Recluse',
							alignment: 'good',
							team: 'outsider',
							ability: {
								trigger: 'detect',
								target: undefined,
								cause: 'registerEvilMinionDemon',
								special: undefined
							}
						},
						{
							role: 'Drunk',
							alignment: 'good',
							team: 'outsider',
							ability: {
								trigger: 'thinks',
								target: undefined,
								cause: 'thinksTownsfolk',
								special: undefined
							}
						},
						{
							role: 'Saint',
							alignment: 'good',
							team: 'outsider',
							ability: {
								trigger: 'executed',
								target: 'self',
								cause: 'teamLoses',
								special: undefined
							}
						},
						{
							role: 'Butler',
							alignment: 'good',
							team: 'outsider',
							ability: {
								trigger: 'vote',
								target: undefined,
								cause: 'voteWithMaster',
								special: undefined
							}
						},
						{
							role: 'Washerwoman',
							alignment: 'good',
							team: 'townsfolk',
							ability: {
								trigger: 'firstnight',
								target: undefined,
								cause: 'learns',
								special: undefined
							}
						},
						{
							role: 'Slayer',
							alignment: 'good',
							team: 'townsfolk',
							ability: {
								trigger: 'public',
								target: 'any',
								cause: 'demonDies',
								special: undefined
							}
						},
						{
							role: 'Mayor',
							alignment: 'good',
							team: 'townsfolk',
							ability: {
								trigger: '3AliveNoExecution',
								target: undefined,
								cause: 'mayorTeamWins',
								special: undefined
							}
						},
						{
							role: 'Monk',
							alignment: 'good',
							team: 'townsfolk',
							ability: {
								trigger: 'eachnight*',
								target: 'anyNotSelf',
								cause: 'safeFromDemon',
								special: undefined
							}
						},
						{
							role: 'Soldier',
							alignment: 'good',
							team: 'townsfolk',
							ability: {
								trigger: 'demonAttack',
								target: undefined,
								cause: 'safeFromDemon',
								special: undefined
							}
						},
						{
							role: 'Librarian',
							alignment: 'good',
							team: 'townsfolk',
							ability: {
								trigger: 'eachnight*',
								target: 'anyNotSelf',
								cause: 'safeFromDemon',
								special: undefined
							}
						},
						{
							role: 'Investigator',
							alignment: 'good',
							team: 'townsfolk',
							ability: {
								trigger: 'eachnight*',
								target: 'anyNotSelf',
								cause: 'safeFromDemon',
								special: undefined
							}
						},
						{
							role: 'Chef',
							alignment: 'good',
							team: 'townsfolk',
							ability: {
								trigger: 'eachnight*',
								target: 'anyNotSelf',
								cause: 'safeFromDemon',
								special: undefined
							}
						},
						{
							role: "Empath",
							aligment: "good",
							team: "towmsfolk",
							ability: {
								
							}
						}
					]
				}
					
				//Shuffle roles 
				this.script.roles = this.shuffle(this.script.roles);
				//console.log('roles',this.script.roles);
				return this.script;
			break;
		}
	}
	
	assignRoles()
	{
		//==========
		// INITIAL
		// PASS
		//==========
		this.roles = [];
		let playersArr = this.getPlayersArray();
		//console.log('playersArr', playersArr);
		for(let i = 0; i < this.playerCount; i++){
			let thisTeam = playersArr[i];
			let role = this.getRole(thisTeam);
			role.name = this.getRandomName();
			this.roles.push(role);
		}

		//OUTPUT FOR DEBUGGING
		//console.log('first pass');
		//console.log('roles',this.roles.map((role) => { return role.role }).join(', '));
		
		//==========
		// MODIFIED
		// SETUP 
		//(e.g. BARON)
		//==========
		//ITERATE THROUGH ROLES
		for(let roleId in this.roles){
			//GET THE CURRENT ROLE
			let role = this.roles[roleId];
			//CHECK IF THIS ABILITY HAS A TRIGGER, AND THAT TRIGGER IS SETUP
			if(role.ability.trigger && role.ability.trigger === 'setup'){
				//THIS ROLE MODIFIES SETUP (e.g. BARON)
				//console.log('modifiesSetup', role);
				//Store here, e.g. Baron: team=townsfolk, modifiedteam=outsider, count=2
				let setup = role.ability.special;
				let setupTeam = setup.team;
				let modifiedTeam = setup.modifiedteam || "outsider";
				let setupCount = setup.count || 5;
				//FOR EACH ROLE TO MODIFY
				for(let i = 0; i < setupCount; i++){
					//this.roles.filter( (role) => { return role.team === setupteam})[0].team = modifiedteam;
					//GET A NEW ROLE FOR THIS PLAYER
					let newRole = this.getRole(modifiedTeam);
					//console.log('setupMod - new role =',newRole);
					//ITERATE ROLES TO FIND MATCHING ROLE TO REPLACE
					for(let j = 0; j < this.roles.length; j++){
						//IF team MATCHES 
						if(this.roles[j].team === setupTeam){
							let oldName = this.roles[j].name;
							//REPLACE ROLE
							//console.log('SWAPPING',JSON.parse(JSON.stringify(this.roles[j])), JSON.parse(JSON.stringify(newRole)));
							this.roles[j] = JSON.parse(JSON.stringify(newRole));
							//GETTING NEW ROLE REMOVES NAME 
							//this.roles[j].name = this.getRandomName();
							//USE OLD NAME
							this.roles[j].name = oldName;
							//HAVE MADE THIS MODIFICATION, BREAK OUT OF FOR LOOP
							break;
						}
					}
				}
			}
		}//END setup modification

		//OUTPUT FOR DEBUGGING
		//console.log('after setup mod');
		//console.log('roles',this.roles.map((role: Role) => { return role.role + " => " + role.name; }));
		
	}//assignRoles

	outputRoles()
	{
		return this.roles.map((role: Role) => { return "<li>" + role.role + " (" + role.team + ")" + " => " + role.name + "</li>"; });
	}

	outputCounts(playerCount: number)
	{
		let counts = this.playerCounts[playerCount - 1] || [];
		return JSON.stringify(counts);
		//Object.keys(counts).forEach( ())
		//return counts.map( (type: string, amount: number) => { return type + ": " + amount; });
	}

	/**
	 * Get a random name which has not already been used in the current roles array.
	 * @return {string} A random name.
	 */
	getRandomName()
	{
		let names = [
			'Ant',
			'Bek',
			'Cid',
			'Dak',
			'Eve',
			'Fil',
			'Ged',
			'Haz',
			'Ian',
			'Joe',
			'Kim',
			'Lee',
			'Mat',
			'Niz',
			'Ola',
			'Pat',
			'Rik',
			'Sam',
			'Tom',
			'Una',
			'Val',
			'Xia'
		];
		let possible = names.filter( (r) => { return !this.roles.map( (p) => { return p.name; }).includes(r); });
		return this.shuffle(possible)[0];
	}

	getPlayersArray()
		{
			const defaultCount = {
				townsfolk: 3,
				outsider: 0,
				minion: 1,
				demon: 1
			};
			//scale down here for 0-index
			let pCounts = this.playerCounts[this.playerCount - 1] || defaultCount;
			//console.log('pCounts',pCounts);
			//Assign townsfolk
			let arr = Array(pCounts.townsfolk).fill('townsfolk');
			//Assign outsiders
			for(let i = 0; i < pCounts.outsider; i++){
				arr.push('outsider');
			}
			//Assign minions
			for(let i = 0; i < pCounts.minion; i++){
				arr.push('minion');
			}
			//Assign demon - modify for Legion, Lil monsta etc
			arr.push('demon');
			return this.shuffle(arr);
		}

	getRole(team: string)
	{
		let roles = this.roles.map( (role) => { return role.role});
		//console.log(roles.join(','));
		let possible = this.script.roles.filter( (r: Role) => { return (!roles.includes(r.role) && (r.team === team) ); });
		//console.log('getRole',team, possible);
		return possible[0];
	}

	learn(correctCount: number, totalCount: number, infoType: string, droisoned = false)
	{
		let info;
		const selfName = "Zam";
		switch(infoType){
    		case 'townsfolk':
	    		info = this.learnTeam('townsfolk',2,selfName);
	    	break;
	    	case 'outsider':
	    		info = this.learnTeam('outsider',2,selfName);
	    	break;
	    	case 'minion':
	    		info = this.learnTeam('minion',2,selfName);
	    	break;
		}

		if(info === undefined){
			info = {
				possible: [ 'none' ],
				info: 'none'
			}
		}
		
		//DEBUG
		console.log('learn','townsfolk',info.possible.join(' or '),info.info);
		return info;
	}

	learnTeam(team: string, count: number, selfName: string)
	{
		let info: Info = {
			possible: new Array<string>,
			info: ""
		};
			
		//Select from the correct team (not yourself, to be kind)
		let options = this.roles.filter( (player: Role) => { return ( (player.team == team) && (player.name != selfName) ) });
		console.log('options', team, count, selfName);
		//librarian, no outsiders in play
		if(options.length === 0){
			info.info = 'none';
			return info;
		}
			
		//Choose one at random
		let selected = options[Math.floor(Math.random() * options.length)] || { role: "none", name: "none" };
		//Get the role
		info.info = selected.role;
		info.possible.push(selected.name);
			
		//Filter players to NOT the selected player or yourself
		let other = this.roles.filter( (player: Role) => { return ( (player.name != selected.name) && (player.name != selfName) ) });
		let selectedOther = other[Math.floor(Math.random() * other.length)] || { role: "none", name: "none" };
		info.possible.push(selectedOther.name);
			
		info.possible = this.shuffle(info.possible);
			
		return info;
	}
		
	learnChefNumber()
	{
		let evilMax = 0;
		let currentChef = 0;
		let lastEvilIndex = false;
		//With recluse?
		for(let i = 0; i < this.roles.length; i++){
			if(this.roles[i].alignment == 'evil'){
				if( (lastEvilIndex) && ( (i - lastEvilIndex) == 1) ){
					//increment chef
					currentChef++;
					if(currentChef > evilMax){
						evilMax = currentChef;
					}
				}
			}
		}
		return evilMax;
	}

	shuffle(arr: Array<any>)
	{
		var j, x, i;
		for (i = arr.length - 1; i > 0; i--) {
			j = Math.floor(Math.random() * (i + 1));
			x = arr[i];
			arr[i] = arr[j];
			arr[j] = x;
		}
		return arr;
	}
	
}

/*
class Player extends PlayerType {
	
}
*/

const express = require("express");
const app = express();
const http = require("http").createServer(app);
const port = process.env.PORT || 3000;
 
app.get("/", (req: XMLHttpRequest, res: any) => {
 	let response: string = "<h1>Local Express Server Here!</h1>";
 	 //res.send("<h1>Local Express Server here!</h1>");
  	 console.log('connection');
  	 //TESTING
  	 for(let i = 5; i < 13; i++){
  	 	//res.send('Setting up an ' + i + ' player game');
  	 	response += "<h2>Setting up a " + i + " player game</h2>";
  	 	let st = new StoryTeller(i);
  	 	response += st.outputCounts(i);
  	 	response += "<br>";
  	 	//res.send(st.outputRoles());
  	 	response += "<ul>";
  	 	response += st.outputRoles().join("");
  	 	response += "</ul>";
  	   //st.learn(2,2,'towmsfolk');
  	 }
  	 res.send(response);
});

http.listen(port);
console.log('Listening on port ' + port);

/*
//TESTING
for(let i = 5; i < 16; i++){
	console.log('Setting up an ' + i + ' player game');
	let st = new StoryTeller(i);
	//st.learn(2,2,'towmsfolk');
}
*/
