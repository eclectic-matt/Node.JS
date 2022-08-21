import React from 'react';
import PlayerListItem from './playerListItem'

class PlayerList extends React.Component {

	renderPlayerItem(player){
		//console.log('rendering player',player);
		let highlight = false;
		if(this.props.socket.id === player.id){
			highlight = true;
		}
		return (
			<PlayerListItem 
				key={player.id} 
				id={player.id} 
				name={player.name} 
				role={player.role} 
				highlight={highlight}
			/>
		)
	}

	render(){
		//GET SAFE PLAYER COUNT
		let playerCount = 0;
		//FOR SOME REASON (MY ERROR?) THE ARRAY SPREAD PUTS THEM ALL IN players[0]
		if(this.props.players[0] === undefined){
			//console.log('No players to render!');
		}else{
			playerCount = this.props.players[0].length;
			//console.log('rendering', playerCount,'players',this.props.players[0]);
		}
		return (
			<>
				<h2>Players ({playerCount}):</h2>
				{playerCount === 0 &&
					<em>No players joined yet!</em>
				}
				{playerCount > 0 &&
					<ul>
						{this.props.players[0].map((i) => this.renderPlayerItem(i)) }
					</ul>
				}
			</>
		)
	}
}

export default PlayerList;