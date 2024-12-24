//THIS PANEL STORES THE SETTINGS FOR THE GAME IN data/admin.json

const fs = require('node:fs');

//LOAD CURRENT SETTINGS
const adminJson = fs.readFileSync('./data/admin.json', 'utf8');
var admin = JSON.parse(adminJson);


//WHAT THIS PANEL WILL DO: 
// - updateRound()
// - updateQuestion()
// - updateView()
// - editTeamsData()
// NOTE: nodemon WILL REFRESH WHENEVER ONE OF THE .json DATA FILES IS UPDATED 
// THIS MEANS THAT YOU WILL NEED TO EDIT ONLY ONE FILE PER UPDATE 
// AND WAIT FOR THE REFRESH

output = `
<style>
table {
	border: 1px solid black; 
	border-collapse: collapse
}
th, tr, td {
	border: 1px solid black;
}
td input {
	font-size: 0.9rem;
}
#controls, #controls label, #controls input {
	font-size: 1.1rem;
}

#controls button {
	font-size: 1.2rem;
}
</style>
</head>
<body onload="init()">
<h1>Super Secret</h1>

<div id="login">
	Enter Password: <input type="text" id="pass" name="pass" value="" />
</div>

<div id="controls" style="display: none;">

	<form name="adminForm" method="POST" enctype="application/x-www-form-urlencoded">
		<input type="hidden" name="admin" value="true" />

		<!--p>Current Round: <span id="currentRound">1</span></p>
		<p>Current Q: <span id="currentQuestion">1</span></p>
		<p>Current Team: <span id="currentTeam">1</span></p>
		<br>
		<label for="round">Select Round: </label>
		<input value="1" name="round" type="number">
		<br>
		<label for="question">Select Question: </label>
		<input value="1" name="question" type="number">
		<br>
		<label for="team">Select Team: </label>
		<input value="1" name="team" type="number">
		<br>	<br-->

		<label for="view">Display: </label>
		<select name="view">`;

		const views = [
			'welcome', 
			'questions', 
			'answers', 
			'scores'
		];

		views.forEach( (view) => {
			output += `<option value="` + view + `"`;
			if(view === admin.view){
				output += ` selected`;
			}
			output += `>` + view + '</option>';
		});
		
		output += `
		</select>

		<button type="submit">Change View</button>

	</form>

		<button id="nextTeam" onclick="nextTeam()">Next Team</button>
		<button id="nextQuestion" onclick="nextQuestion()">Next Question</button>
		<button id="nextRound" onclick="nextRound()">Next Round</button>

	<br>

	<div id="teamsBlock">
		<h2>Teams Data</h2>
		<form name="teamsForm" method="POST" enctype="application/x-www-form-urlencoded">
		<input type="hidden" name="admin" value="true" />
		<table id="teamsTable">
		</table>
		<button type="submit">Submit Team Data</button>
		</form>
	</div>

</div>

<script>
var admin = undefined;
//LOAD JSON
const init = () => {
	//CHECK FOR LOGGED IN ADMIN
	if(window.localStorage.getItem('pass')){
		if(window.localStorage.getItem('pass') === 'fuckeroo'){
			document.getElementById('login').style.display = 'none';
			document.getElementById('controls').style.display = 'block';
		}
	}
	loadAdminData();
	loadTeamsData();
}


const getJson = (file, callback) => {
	fetch(file)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
			callback(data);
    });
}

const loadAdminData = () => {
	getJson('./data/admin.json', updateAdmin);
}

const loadTeamsData = () => {
	getJson('./data/teams.json', updateTeams);
}

const updateAdmin = (admin) => {
	console.log('ADMIN LOADED', admin);
	document.getElementById('currentRound').innerHTML = admin.current.round;
	document.getElementById('currentQuestion').innerHTML = admin.current.question;
	document.getElementById('currentTeam').innerHTML = admin.current.team;
}

const makeEl = (tag) => {
	return document.createElement(tag);
}

const updateTeams = (teams) => {
	console.log('TEAMS LOADED', teams);
	//OUTPUT TEAMS TABLE (SCORES / REVEAL) 
	const teamsTable = document.getElementById('teamsTable');	
	teamsTable.innerHTML = '';
	
	//HEADER
	const headRow = makeEl('tr');
	//-team name
	//-team score
	//-reveal current answer
	let th = makeEl('th');
	th.innerHTML = 'Team Name';
	headRow.appendChild(th);
	th = makeEl('th');
	th.innerHTML = 'Score';
	headRow.appendChild(th);
	th = makeEl('th');
	th.innerHTML = 'Reveal Answers';
	headRow.appendChild(th);
	th = makeEl('th');
	th.innerHTML = 'Delete Team';
	headRow.appendChild(th);
	teamsTable.appendChild(headRow);

	teams.forEach( (team) => {

		//MAKE ROW
		let tr = makeEl('tr');

		//TEAM NAME
		let nameTd = makeEl('td');
		let nameInput = makeEl('input');
		nameInput.value = team.name;
		nameInput.id = 'teamId' + team.id;
		nameInput.name = 'team_' + team.id;
		/*nameInput.onchange = (ev) => {
			//type, team id, new data
			updateTeamData('name', ev.target.id, ev.target.value);
		}*/
		//nameTd.innerHTML = team.name;
		nameTd.appendChild(nameInput);
		tr.appendChild(nameTd);

		//TEAM SCORE
		let scoreTd = makeEl('td');
		//scoreTd.innerHTML = team.score;
		let scoreInput = makeEl('input');
		scoreInput.type = 'number';
		scoreInput.name = 'score_' + team.id;
		scoreInput.value = team.score || 0;
		/*scoreInput.onchange = (ev) => {
			updateTeamData('score', ev.target.id, ev.target.value);
		}*/
		scoreTd.appendChild(scoreInput);
		tr.appendChild(scoreTd);

		//REVEAL CURRENT ANSWER
		let revealTd = makeEl('td');
		//revealTd.innerHTML = 'REVEAL HERE';
		revealInput = makeEl('input');
		revealInput.type = 'checkbox';
		revealInput.name = 'reveal_' + team.id;
		revealTd.appendChild(revealInput)
		tr.appendChild(revealTd);

		//DELETE TEAM CHECKBOX (AS PART OF FORM)
		/*let deleteTd = makeEl('td');
		let deleteInput = makeEl('input');
		deleteInput.type = 'checkbox';
		deleteInput.name = 'delete_' + team.id;
		deleteTd.appendChild(deleteInput);
		tr.appendChild(deleteTd);*/
		
		//DELETE TEAM BUTTON WITH ALERT CONFIRM
		let deleteTd = makeEl('td');
		let deleteBtn = makeEl('button');
		deleteBtn.id = team.id;
		deleteBtn.innerHTML = 'Delete Team ' + team.id;
		deleteBtn.onclick = (ev) => {
			
		}
		deleteTd.appendChild(deleteInput);
		tr.appendChild(deleteTd);

		//ADD TEAM ROW
		teamsTable.appendChild(tr);
	});
}

const updateTeamData = (type, teamId, newData) => {
	let teamInput = document.getElementById(teamId);
	teamId = teamInput.value.replace('teamId', '');
	game.updateTeam(teamId, type, newData);
}


	var currentTeam = 0;
	var currentRound = 0;
	var currentQuestion = 0;
	var teamsCount = 1;
	var roundsCount = 5;
	var questionsThisRound = 10;
	let passEl = document.getElementById('pass');
	passEl.addEventListener('change', (ev) => {
		if(ev.target.value === 'fuckeroo'){
			//HIDE LOGIN,  SHOW CONTROLS
			document.getElementById('login').style.display = 'none';
			document.getElementById('controls').style.display = 'block';
			window.localStorage.setItem('pass', 'fuckeroo');
		}
	});
	const updateTeam = () => {
		document.getElementById('currentTeam').innerHTML = currentTeam;
	}
	const nextTeam = () => {
		currentTeam++;
		if(currentTeam > teamsCount){
			currentTeam = 0;
		}
		updateTeam();
	}
	const updateRound = () => {
		document.getElementById('currentRound').innerHTML = currentRound;
	}
	const nextRound = () => {
		currentRound++;
		if(currentRound > roundsCount){
			currentRound = 0;
		}
		updateRound();
	}
	const updateQuestion = () => {
		document.getElementById('currentQuestion').innerHTML = currentQuestion;
	}
	const nextQuestion = () => {
		currentQuestion++;
		if(currentQuestion > questionsThisRound){
			currentQuestion = 0;
		}
		updateQuestion();
	}

	updateTeam();
	updateRound();
	updateQuestion();
</script>
</body>
`;


module.exports = output;