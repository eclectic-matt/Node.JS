//IMPORT REACT, USEEFFECT AND USESTATE
import React, { useEffect, useState } from 'react';
//IMPORT COMPONENTS
import HeaderSection from '../components/headerSection';
import NameInput from '../components/nameInput';
import CluesInput from '../components/cluesInput';
import GuideInput from '../components/guideInput';
import SecretsSection from '../components/secretsSection';
import StartGameButton from '../components/startGameButton';
import RoundsSection from '../components/roundsSection';

//IMPORT STYLES (VAR COLOURS)
import './styles/homePage.css';
const {
	PLAYER_LIMIT_MIN, PLAYER_LIMIT_MAX, CLUES_PER_ROUND, SOLUTIONS_PER_GAME,
	ROUND_LIMIT_MAX, GAME_NAME, DEFAULT_LOBBY_ID, HIDDEN_SECRET_WORD,
	GAME_STAGE_LOBBY, GAME_STAGE_SEEKER, GAME_STAGE_GUIDE, GAME_STAGE_OVER
} = require('../constants.js');
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
	//DEFINE DEFAULTS FOR STATUS (STAGE NEEDED)
	const [status, setStatus] = useState({stage: 0});

	//GET THE CURRENT PLAYER (LINKED TO THIS SOCKET)
	const currentPlayer = (players, socket) => {
		if(players[0] === undefined){
			return false;
		}
		//console.log('checking for current player', players);
		for(let i = 0; i < players[0].length; i++){
			if(players[0][i].id === socket.id){
				//console.log('matched current player', players[0][i]);
				return players[0][i];
			}
		}
	};

	const renderSection = (stage) => {

		let thisPlayer = currentPlayer(players, socket);
		//console.log('current-player',thisPlayer);

		switch(stage){

			//GAME STAGE LOBBY
			case GAME_STAGE_LOBBY:
				
				let startGameBtn = null;
				if(players[0]?.length !== undefined){
					//console.log('players length found -',players[0].length);
					if( 
						(players[0].length >= info.playerLimitMin) && 
						(players[0].length <= info.playerLimitMax)
					){
						//console.log('players limit suitable',players[0].length);
						startGameBtn = <StartGameButton socket={socket}/>;
					}
				}
				return (
					<>
					<HeaderSection socket={socket} players={players} info={info} status={status}/>
						{ socket.name === undefined && 
							<NameInput socket={socket} />
						}
						{startGameBtn}
					</>
				)

			//IN ROUND - SEEKERS GUESS
			case GAME_STAGE_SEEKER:
				
				let cluesInput = null;
				if(thisPlayer.role === 'Seeker'){
					cluesInput = <CluesInput socket={socket} />
				}
				return (
					<>
						<HeaderSection socket={socket} players={players} info={info} status={status}/>
						<SecretsSection category="Famous People" word="butts" />
						{ cluesInput }
						{<RoundsSection rounds={rounds}/>}
					</>
				)

			//IN ROUND - GUIDE THUMBS
			case GAME_STAGE_GUIDE:

				let guideInput = null;
				if(thisPlayer.role === 'Guide'){
					guideInput = <GuideInput socket={socket} rounds={rounds} info={info} status={status}/>
				}
				return (
					<>
						<HeaderSection socket={socket} players={players} info={info} status={status}/>
						<SecretsSection category="Famous People" word="butts" />
						{guideInput}
						{<RoundsSection rounds={rounds}/>}
					</>
				)

			//GAME OVER STAGE
			case GAME_STAGE_OVER:
				//GAME OVER
				return (
					<>
						<h1>Game Over!</h1>
					</>
				)
		}
	};

	//USE EFFECT 
	//----------
	//ALLOWS UPDATES TO THE APP FROM EXTERNAL INPUTS
	//IN THIS CASE, SOCKET.IO UPDATES
	useEffect(() =>  
		{
			socket.on('server-update', (game) => {
				//console.log('server update received!', game, socket.name);
				//UPDATE PLAYERS
				setPlayers([...players, game.players]);
				//UPDATE ROUNDS (DURING GAME)
				setRounds([...rounds, game.rounds]);
				//UPDATE INFO (GAME SETTINGS)
				setInfo({...info, ...game.info});
				//UPDATE STATUS (GAME CURRENT STATUS)
				setStatus({...status, ...game.status});
				//UPDATE SECRETS (HIDDEN INFO)
				setSecrets({...secrets, ...game.secrets});
		});
		}, [socket]
	);
	
	//RENDER
	//------
	//<h1>HomePage</h1>
	return (
		<>
		{
			renderSection(status.stage)
		}
		</>
	)
	
}

export default HomePage;