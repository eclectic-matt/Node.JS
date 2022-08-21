//IMPORT REACT, USEEFFECT AND USESTATE
import React, { useEffect, useState } from 'react';
//IMPORT COMPONENTS
import HeaderSection from '../components/headerSection';
import NameInput from '../components/nameInput';
import SecretsSection from '../components/secretsSection';
//import RoundsSection from '../components/roundsSection';
//IMPORT STYLES
//import './styles/homePage.css';

//PASS SOCKET TO USE EFFECT
const HomePage = ({socket}) => {

	//SET STATE
	//---------
	//NOTE [varname, methodname] = useState
	//IS THE PATTERN WHICH EXPOSES
	//methodname(newvarname) TO SET THE STATE

	//DEFINE AND PROVIDE DEFAULTS FOR PLAYERS
	const [players, setPlayers] = useState([]);
	//DEFINE AND PROVIDE DEFAULTS FOR ROUNDS
	const [rounds, setRounds] = useState([]);
	//DEFINE AND PROVIDE DEFAULTS FOR INFO
	const [info, setInfo] = useState({
		name: 'Default',
		lobbyId: 'N/A'
	});
	//DEFINE AND PROVIDE DEFAULTS FOR PLAYERS
	const [secrets, setSecrets] = useState({});
	const [status, setStatus] = useState({});


	//USE EFFECT 
	//----------
	//ALLOWS UPDATES TO THE APP FROM EXTERNAL INPUTS
	//IN THIS CASE, SOCKET.IO UPDATES
	useEffect(() =>  
		{
			socket.on('server-update', (game) => {
				console.log('server update received!', game, socket.name);
				setPlayers([...players, game.players]);
				setRounds([...rounds, game.rounds]);
				setInfo({...info, ...game.info});
				setStatus({...status, ...game.status});
				setSecrets({...secrets, ...game.secrets});
				//console.log('new info', game.info, info);
		});
		}, [socket]
	);
	
	//RENDER
	//------
	//<h1>HomePage</h1>
	return (
		<>
			<HeaderSection socket={socket} players={players} info={info} status={status}/>
			{ socket.name === undefined && 
				<NameInput socket={socket} />
			}
			<SecretsSection category="Famous People" word="butts" />
			{/*<RoundsSection rounds={rounds} clues={rounds.clues}/>*/}
		</>
	)
	
}

export default HomePage;