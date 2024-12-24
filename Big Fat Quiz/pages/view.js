const fs = require('node:fs');
//const { createCanvas } = require('canvas');

//LOAD ADMIN / TEAMS / CANVASES
var adminJson = fs.readFileSync('./data/admin.json');
var adminData = JSON.parse(adminJson);
var teamsJson = fs.readFileSync('./data/teams.json');
var teamsData = JSON.parse(teamsJson) || [];
//var cnvJson = fs.readFileSync('./data/canvases.json');
//let cnvData = JSON.parse(cnvJson);
const CanvasManager = require('../classes/CanvasManager.js');
let cnvMgr = new CanvasManager();

var view = adminData.view;
console.log('CURRENT VIEW in view.js:', view);
//const sp = require('signature_pad');

var output = '<meta http-equiv="refresh" content="5">';
output += `<link rel="stylesheet" href="./style/view.css" type="text/css" />
<title>Big Fat Quiz</title>
</head>`;


switch(view){
  case 'welcome':
    //START OUTPUT
		let join = `<body>
			<div id="headerRow" class="clearfix">
				<h1>Big Fat Quiz 
				<img 
					src="data:image/png;base64, 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" 
					width="150" 
					height="150" 
				/>
				</h1>
			</div>
			<div id="teamsBox">`;

			for(let i=0; i < teamsData.length; i++){
				let team = teamsData[i];
				let encName = encodeURI(team.name);
				join += `<div id="` + encName + `" class="teamBox">`;
				join += `<h2 class="teamHead">`;
					join += `<span id="` + encName + `Name">` + team.name + `</span> `;
					join += `<span class="score" id="` + encName + `Score">` + team.score + `</span>`;
				join += `</h2>`;
				let cnv = cnvMgr.getTeamCanvas(team.name, 0, 0);
				if(cnv){
					let cnvPng = cnv.data;
						join += `<img 
							src="` + cnvPng + `" 
							width="200"
							height="auto"
						/>`;
				}
				join += `</div>`;
			}

			join += `</div>
		</body>
		`;
		output += join;
	break;
	case 'questions':
		var questions = `<h1>Questions!</h1>`;
		output += questions;
	break;
}

module.exports = output;
