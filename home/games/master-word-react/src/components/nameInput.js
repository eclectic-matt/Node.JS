import React, { useState } from 'react';
import './styles/nameInput.css';

const NameInput = ({socket}) => {
	//VALUE IS THE SET NAME
	const [value, setValue] = useState(localStorage.riverdaleRoadPlayerName || '');
	const submitForm = (e) => {
		e.preventDefault();
		if(value === '') return;
		if(value !== socket.name){
			let update = {};
			update.method = 'playerName';
			update.name = value;
			storeName(value);
			socket.emit('player-update', update);
			console.log('sending update to server',update);
		}else{
			console.log('Already signed up with this name!');
		}
	};

	const storeName = (name) => {
		//if(localStorage.getItem['riverdaleRoadPlayerName'] !== undefined){
			
		//}
		localStorage.setItem('riverdaleRoadPlayerName',name);
	}

	//<h2 id="NameInputHeader">Player Name Input</h2>
	return (
		<section id="NameInputSection">
			
			<form onSubmit={submitForm}>
				<label htmlFor="name">Enter your name: </label>
				<input
					id="playerNameInput"
					autoFocus
					value={value}
					name="name"
					placeholder="Your name..."
					onChange={(e) => {
						setValue(e.currentTarget.value);
					}}
				/>
				<button 
					id="changeNameButton"
					type="submit"
					value="submit"
				>Change Name</button>
			</form>
		</section>
	);
};

export default NameInput;
