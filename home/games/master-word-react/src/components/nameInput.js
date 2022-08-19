import React, { useState } from 'react';
//import './NameInput.css';

const NameInput = ({socket}) => {
	//VALUE IS THE SET NAME
	const [value, setValue] = useState('');
	const submitForm = (e) => {
		e.preventDefault();
		let update = {};
		update.method = 'playerName';
		update.name = value;
		socket.emit('player-update', update);
		console.log(update);
		//setValue(value);
	};

	return (
		<form onSubmit={submitForm}>
		<input
			autoFocus
			value={value}
			placeholder="Type your name"
			onChange={(e) => {
			setValue(e.currentTarget.value);
			}}
		/>
		</form>
	);
};

export default NameInput;
