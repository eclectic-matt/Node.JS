import React from 'react';
import PlayerListItem from './playerListItem'

class PlayerList extends React.Component {

	renderPlayerItem(player){
		console.log('rendering player',player);
		return (
			<PlayerListItem 
				key={player.id} 
				id={player.id} 
				name={player.name} 
				role={player.role} 
			/>
		)
	}

	render(){
		console.log('rendering players',this.props.players[0]);
		return (
			<>
				<h2>Players:</h2>
				{this.props.players.length === 0 &&
					<em>No players joined yet!</em>
				}
				{this.props.players.length > 0 &&
					<ul>
						{this.props.players[0].map((i) => this.renderPlayerItem(i)) }
					</ul>
				}
			</>
		)
	}
}

export default PlayerList;