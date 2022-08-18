//import logo from './logo.svg';
//import './App.css';
import HeaderSection from '../components/headerSection';
//import PlayerInputSection from './components/playerInputSection';
import SecretsSection from '../components/secretsSection';
import RoundsSection from '../components/roundsSection';
import React, { useEffect, useState } from 'react';

//SOCKET/SERVER STUFF
/*const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);*/

//import Socket from 'socket.io';
//var socket = io();
var socket;

const GamePage = ({socket}) => {

	//DEFINE AND PROVIDE DEFAULTS FOR PLAYERS
	const [players, setPlayers] = useState([
		{
			id: 1,
			name: 'Matt',
			role: 'Guide'
		}
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
	//NOTE [varname, methodname] = useState
	//IS THE PATTERN WHICH EXPOSES
	//methodname(newvarname) TO SET THE STATE



	/*
	//NOT WORKING/ANTI-PATTERN?
	updateApp((game) => {
		//setMessages([...messages, data]);
		setPlayers([...players, game.players]);
		setRounds([...rounds, game.rounds]);
		setInfo([...info, game.info]);
		setSecrets([...secrets, game.secrets]);
	});*/

	//USE EFFECT ALLOWS UPDATES TO THE APP FROM EXTERNAL INPUTS
	//IN THIS CASE, SOCKET.IO UPDATES
	useEffect(() =>  
		{
			//socket.on('server-update', (game) => updateApp(game));
			
			//socket.on('server-update-players', (newPlayers) => setPlayers([...players, newPlayers]));
			//socket.on('server-update-rounds', (newRounds) => setRounds([...rounds, newRounds]));
			//socket.on('server-update-info', (newInfo) => setInfo([...info, newInfo]));
			//socket.on('server-update-secrets', (newSecrets) => setSecrets([...secrets, newSecrets]));
		}, [socket]
	);
	
	return (
		<>
			<h1>GamePage</h1>
			<HeaderSection players={players} info={info}/>
			<div id="inputDiv">
			</div>
			<SecretsSection category="Famous People" word="butts" />
			<RoundsSection rounds={rounds} clues={rounds.clues}/>
		</>
	)
	
}

/*
class App extends React.Component {
	
	constructor(props){
		super(props);
		this.state = {
			players: [],
			info: {},
			rounds: { clues: []},
		}
	};

	useEffect(() => {

	});

	render(){
		return (
			<>
				<HeaderSection players={this.state.players} info={this.state.info}/>
				<div id="inputDiv">
				</div>
				<SecretsSection category="Famous People" word="butts" />
				<RoundsSection rounds={this.state.rounds} clues={this.state.rounds.clues}/>
			</>
		)
	}
	
}*/

export default GamePage;