import React, { useState } from 'react';
//import './NameInput.css';

const NameInput = ({socket}) => {
	//VALUE IS THE SET NAME
	const [value, setValue] = useState('');
	const submitForm = (e) => {
		e.preventDefault();
		if(value !== socket.name){
			let update = {};
			update.method = 'playerName';
			update.name = value;
			//socket.name = value;
			console.log(socket.name);
			socket.emit('player-update', update);
			console.log(update);
			//window.location.href += 'game';
			//setValue(value);	//VALUE ALREADY IN STATE
		}else{
			console.log('Already signed up with this name!');
		}
	};

	return (
		<section id="NameInputSection">
			<form onSubmit={submitForm}>
				<label htmlFor="name">Enter your name: </label>
				<input
					autoFocus
					value={value}
					name="name"
					placeholder="Type your name"
					onChange={(e) => {
						setValue(e.currentTarget.value);
					}}
				/>
			</form>
		</section>
	);
};

export default NameInput;
