import React from 'react';
import PlayerList from './playerList'
import InfoDiv from './infoDiv'
import './styles/headerSection.css';

class HeaderSection extends React.Component {

	resetGame(e, socket){
		//e.preventDefault();
		let update = {};
		update.method = 'resetGame';
		socket.emit('player-update',update);
		console.log('requested game reset');
	}

	render(){
		return (
			<section id="HeaderSection">
				<h1>{this.props.info.name}</h1>
				<PlayerList socket={this.props.socket} players={this.props.players} />
				<InfoDiv info={this.props.info} status={this.props.status}/>
				<button 
					onClick={(e) => {
						this.resetGame(e.currentTarget, this.props.socket);
					}}
					socket={this.props.socket}
				>Reset Game</button>
			</section>
		)
	}
}

export default HeaderSection;