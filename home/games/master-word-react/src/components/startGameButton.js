import React, { useState } from 'react';
import './styles/startGameButton.css';

const StartGameButton = ({socket}) => {
	
	const clickEvent = (e) => {
		//e.preventDefault();
		let update = {};
		update.method = 'startGame';
		socket.emit('player-update', update);
		console.log('sending update to server',update);
	};

	return (
		<button
			id="startGameButton"
			name="Start Game"
			value="Start Game"
			onClick={(e) => {
				clickEvent(e.currentTarget);
			}}
		>
			Start Game
		</button>
	);
};

export default StartGameButton;
