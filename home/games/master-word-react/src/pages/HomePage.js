//import logo from './logo.svg';
//import './App.css';
import HeaderSection from '../components/headerSection';
//import PlayerInputSection from './components/playerInputSection';
import SecretsSection from '../components/secretsSection';
import RoundsSection from '../components/roundsSection';
import React, { useEffect, useState } from 'react';
import NameInput from '../components/nameInput';

//SOCKET/SERVER STUFF
const HomePage = ({socket}) => {

	//DEFINE AND PROVIDE DEFAULTS FOR PLAYERS
	const [players, setPlayers] = useState([
		/*{
			id: 1,
			name: 'Matt',
			role: 'Guide'
		}*/
	]);
	//DEFINE AND PROVIDE DEFAULTS FOR PLAYERS
	const [rounds, setRounds] = useState({
		clues: []
	});
	//DEFINE AND PROVIDE DEFAULTS FOR PLAYERS
	const [info, setInfo] = useState({
		name: 'Master Word',
		stage: 'Waiting in Lobby'
	});
	//DEFINE AND PROVIDE DEFAULTS FOR PLAYERS
	const [secrets, setSecrets] = useState({
		category: 'Example',
		word: 'Secret'
	});

	//SINGLE GAME STATE OBJECT
	const [game, updateGame] = useState({
		name: 'Master Word',
		players: {},
		secrets: {}
	});
	//NOTE [varname, methodname] = useState
	//IS THE PATTERN WHICH EXPOSES
	//methodname(newvarname) TO SET THE STATE


	//USE EFFECT ALLOWS UPDATES TO THE APP FROM EXTERNAL INPUTS
	//IN THIS CASE, SOCKET.IO UPDATES
	useEffect(() =>  
		{
			//socket.on('server-update', (game) => updateGame(game));
			socket.on('server-update', (game) => {
				console.log('server update received!', game)
				setPlayers([...players, game.players.names]);
				setRounds([...rounds, game.rounds]);
				setInfo([...info, game.info]);
				setSecrets([...secrets, game.secrets]);
			
		});
		}, [socket]
	);
	
	return (
		<>
			<h1>HomePage</h1>
			<HeaderSection socket={socket} players={players} info={info}/>
			{ socket.name == undefined && 
				<NameInput socket={socket} />
			}
			<SecretsSection category="Famous People" word="butts" />
			{/*<RoundsSection rounds={rounds} clues={rounds.clues}/>*/}
		</>
	)
	
}

export default HomePage;