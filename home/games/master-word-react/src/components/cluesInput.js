import React, { useState } from 'react';
import './styles/nameInput.css';

const CluesInput = ({socket}) => {
	//VALUE IS THE SET NAME
	const [value, setValue] = useState('');
	const submitForm = (e) => {
		e.preventDefault();
		let update = {};
		update.method = 'clueInput';
		update.guess = value;
		socket.emit('player-update', update);
		//console.log('sending update to server',update);
		//CLEAR VALUE
		setValue('');
	};

	return (
		<section id="CluesInputSection">
			<h2 id="CluesInputHeader">Clue Input</h2>
			<form onSubmit={submitForm}>
				<label htmlFor="guess">Enter your clue: </label>
				<input
					autoFocus
					value={value}
					name="clue"
					placeholder="Your clue..."
					onChange={(e) => {
						setValue(e.currentTarget.value);
					}}
				/>
				<button 
					id="clueInputButton"
					type="submit"
					value="submit"
				>Submit Clue</button>
			</form>
		</section>
	);
};

export default CluesInput;
