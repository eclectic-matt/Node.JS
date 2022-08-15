import React from 'react';
import PlayerListItem from './playerListItem'

class PlayerList extends React.Component {

	renderPlayerItem(player){
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
		return (
			<>
				<h2>Clues:</h2>
				<ul>
					{this.props.players.map((i) => this.renderPlayerItem(i)) }
				</ul>
			</>
		)
	}
}

export default PlayerList;