class RoundData {
	name = "round";
	questionCount = 10;
	questions = [];
	canvases = [];
}
class TeamCanvases {
	team = "team_name";
	data = [];
}
class Canvas {
	round = 1;
	question = 1;
	data = {};
}

//log the path requested
//console.log('location.pathname=',location.pathname,'location.search=',location.search);
let searchPairs = location.search.substr(1).split('&');
console.log(searchPairs);

//THE CANVAS HTML ELEMENT
var cnvEl = undefined;
//INITIALIZE THE CURRENT ROUND'S RESPONSES
var currentRoundData = [];
//DEFAULT NUMBER OF QUESTIONS PER ROUND
var questionsThisRound = 10;
//THE CURRENT QUESTION NUMBER
var currentQuestionNumber = 1;

//STORED CANVAS DATA (ARRAY OF CANVASES FROM 1 - 10, ONE PER QUESTION)
var cnvData = Array.from(questionsThisRound).fill(undefined);

//SIGNATURE PAD OBJECT
var signaturePad = undefined;
//SCALING RATIO FOR CANVAS ELEMENTS (BASED ON window.devicePixelRatio)
var ratio = 1;

//LITTLE HELPER FUNCTION TO REMAP getElementById SIMILAR TO JQUERY
const $ = (id) => document.getElementById(id);

//TRIGGERED BY WINDOW RESIZE EVENTS
const resizeCanvas = () => { 
	const data = signaturePad.toData();
	cnvEl.width = window.innerWidth;
		//cnvEl.height = window.innerHeight;
	cnvEl.height = cnvEl.width;
		//HEIGHT REDUCED TO 80% FOR THE QUESTION BUTTONS ROW/ACTION BUTTONS ROW
		//cnvEl.height = window.innerHeight * 0.8;
	
	//console.log('ratio', cnvEl.offsetWidth / cnvEl.offsetHeight);
	ratio = Math.max(cnvEl.offsetWidth / cnvEl.offsetHeight || 1, 1);
	//ratio =  Math.max(window.devicePixelRatio || 1, 1);

	cnvEl.width = cnvEl.offsetWidth * ratio;
	cnvEl.height = cnvEl.offsetHeight * ratio;
	cnvEl.getContext("2d").scale(ratio, ratio);
	signaturePad.clear(); // otherwise isEmpty() might return incorrect value
	//NOW RELOAD THE CURRENT CANVAS DATA
	signaturePad.fromData(data);
}

//NEXT / PREVIOUS QUESTION BUTTONS
const nextQuestion = () => {
	storeCanvas(currentQuestionNumber);
	currentQuestionNumber++;
	if(currentQuestionNumber > questionsThisRound){
		currentQuestionNumber = 1;
	}
	updateQuestion();
}

const previousQuestion = () => {
	storeCanvas(currentQuestionNumber);
  currentQuestionNumber--;
	if(currentQuestionNumber < 1){
		currentQuestionNumber = questionsThisRound;
	}
	updateQuestion();
}

const updateQuestion = () => {
	$('currentQuestion').innerHTML = 'Question ' + currentQuestionNumber;
	loadCanvasId(currentQuestionNumber);
}

//INITIALIZE THE CANVAS ELEMENT SETTINGS 
const init = () => {
	//THE ROW OF QUESTION NUMBERS
	let qNumsEl = $('questionNumbers');
	qNumsEl.innerHTML = '';

	let previousBtn = document.createElement('button');
	previousBtn.innerHTML = '&larr;';
	previousBtn.onclick = () => {
		previousQuestion();
	}
	qNumsEl.appendChild(previousBtn);

	let currentQSpan = document.createElement('span');
	currentQSpan.innerHTML = 'Question 1';
	currentQSpan.id = 'currentQuestion';
	qNumsEl.appendChild(currentQSpan);

	let nextQuestionBtn = document.createElement('button');
	nextQuestionBtn .innerHTML = '&rarr;';
	nextQuestionBtn .onclick = () => {
		nextQuestion();
	}
	qNumsEl.appendChild(nextQuestionBtn);

	let actionBtnsEl = $('actionBtns');

	//ALSO ADD A CLEAR DATA AND A SUBMIT BUTTON TO THIS ROW?
	let resetBtn = document.createElement('button');
	resetBtn.onclick = () => {
		checkConfirm('THIS WILL DELETE ALL SAVED CANVASES', clearBackup);
	}
	resetBtn.className = 'resetBtn qBtn';
	resetBtn.innerHTML = 'Delete All';
	actionBtnsEl .appendChild(resetBtn);

	let submitBtn = document.createElement('button');
	submitBtn.onclick = () => {
		//THIS SHOULD SUBMIT - 
		backupCnvData();
	}
	submitBtn.className = 'saveBtn qBtn';
	submitBtn.innerHTML = 'Submit All';
	actionBtnsEl .appendChild(submitBtn);

	let clearBtn = document.createElement('button');
	clearBtn.onclick = () => {
		//THIS SHOULD SUBMIT - 
		clearCurrentCanvas();
	}
	clearBtn.className = 'clearBtn qBtn';
	clearBtn.innerHTML = 'Clear';
	actionBtnsEl .appendChild(clearBtn);



	//SHOW WE ARE ON QUESTION 1
	//highlightBtn(currentQuestionNumber);
	//INITIALIZE THE CANVAS (THE HTML ELEMENT IS STORED AS cnvEl)
	cnvEl = document.getElementById('canvas');
	const canvas = document.querySelector("canvas");
	signaturePad = new SignaturePad(canvas);

	//CHECK FOR STORED DATA?
	if(window.localStorage.getItem('cnvData')){
		//console.log('LOADING STORED CANVASES', window.localStorage.getItem('cnvData'));
		cnvData = JSON.parse(window.localStorage.getItem('cnvData'));
		//THEN LOAD Q1 CANVAS
		loadCanvasId(currentQuestionNumber);
	}

	
	//ADD WINDOW RESIZE EVENT LISTENER
	window.addEventListener('resize', resizeCanvas, false);
	//TRIGGER THE RESIZE FUNCTION ONCE WINDOW LOADED
	resizeCanvas();

	window.addEventListener('unload', backupCnvData, false);

	//CANVAS ONCHANGE = SAVE TO THE cnvData ARRAY (DUPLICATING CANVASES, REMOVED)
	//cnvEl.addEventListener('change', storeCanvas, false);
}

/**
	* Where multiple stored canvases are found - loads by index of the cnvData array.
	* @param int id The cnvData index to load.
	* @return void Applies changes in browser.
	*/
const loadCanvasId = (id) => {
	//console.log('CANVAS LOAD', id, cnvData);
	signaturePad.clear();
	if(!cnvData[id]){
		//alert('No data to load!');
		console.log('No data to load!');
		return false;
	}
	//console.log('Loaded data', cnvData[id]);
	const data = cnvData[id];
	signaturePad.fromData(data);
	//let modal = $('loadCanvasModal');
	//modal.style.display = 'none';
}

//NOT CURRENTLY USED - WAS USING THIS IN AN onchange EVENT BUT LED TO DUPLICATED CANVASES
const storeCanvas = () => {
	const data = signaturePad.toData();
	cnvData[currentQuestionNumber] = data;
	//alert('Saved as canvas #' + cnvData.length);
	//console.log(data);
}

//BACKS UP THE CANVAS DATA ARRAY TO LOCAL STORAGE FOR RELOADING
const backupCnvData = () => {
	window.localStorage.setItem('cnvData', JSON.stringify(cnvData));
}

//REMOVES ALL BACKED UP DATA
const clearBackup = () => {
	console.log('ALL SAVED DATA CLEARED!');
	window.localStorage.setItem('cnvData', undefined);
	//RESET CANVAS DATA AND RELOAD
	cnvData = [];
	location.reload();
}

//REMOVES ALL DATA FROM THE CURRENT CANVAS
const clearCurrentCanvas = () => {
	signaturePad.clear();
}

/*
* CHECK CONFIRMATION
* Description: Generic check, shows a confirmation box and callsback function only if confirmed
*
* @strConfirm: the string with specific text to show in the confirmation box
* @fnCallback: the function to callback if user confirms OK
*/
const checkConfirm = (strConfirm, fnCallback) => {
	const conf = confirm('Are you sure? ' + strConfirm);
	if (conf == true){
		fnCallback();
	}
}
