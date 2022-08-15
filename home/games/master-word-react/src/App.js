import logo from './logo.svg';
import './App.css';
import HeaderSection from './components/headerSection';
import SecretsSection from './components/secretsSection';
import RoundsSection from './components/roundsSection';

function App() {
	
	let players = [];
	let player = {};
	player.id = 1;
	player.name = 'Matt';
	player.role = 'Guide';
	players.push(player);
	player = {};
	player.id = 2;
	player.name = 'Lindsay';
	player.role = 'Seeker';
	players.push(player);
	player = {};
	player.id = 3;
	player.name = 'Naomi';
	player.role = 'Seeker';
	players.push(player);

	let info = {};
	info.name = 'Master Word';
	info.stage = 'Waiting for lobby to fill up...';

	let rounds = {};
	rounds.clues = [
		//ROUND 1
		['Hello', 'Test', 'Smeg'],
		//ROUND 2
		['Dick', 'Head', 'Brain'],
	];
	rounds.solutions = [];
	rounds.wins = false;

	return (
		<>
			<HeaderSection players={players} info={info}/>
			<div id="inputDiv">
			</div>
			<SecretsSection category="Famous People" word="butts" />
			<RoundsSection rounds={rounds} clues={rounds.clues}/>
		</>
	)
	
}

export default App;
