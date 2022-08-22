import React from 'react';
import './styles/resetGameButton.css';

class HeaderSection extends React.Component {

	resetGame(e, socket){
		if(window.confirm('This will reset the game for all players - continue?') === false){
			return false;
		}
		//e.preventDefault();
		let update = {};
		update.method = 'resetGame';
		socket.emit('player-update',update);
		console.log('requested game reset');
	}

	render(){
		return (
			<button 
				id="resetGameButton"
				className="resetButton"
				onClick={(e) => {
					this.resetGame(e.currentTarget, this.props.socket);
				}}
				socket={this.props.socket}
			>Reset Game</button>
		)
	}
}

export default HeaderSection;