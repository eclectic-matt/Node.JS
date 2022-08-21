import React from 'react';
import './styles/playerListItem.css';

/**
 * PlayerListItem is a single LI showing a player name and role.
 * @props id: string A unique ID for the player.
 * @props name: string A unique name for the player.
 * @props role: string The player's role for this game.
 */
class PlayerListItem extends React.Component {
	render(){
		let className = (this.props.highlight ? 'playerHighlightItem' : 'playerItem');
		return (
		<li 
			key={this.props.id} 
			value={this.props.name}>
				<b className={className}>
					{this.props.name}
				{this.props.role !== undefined && 
					<em>
						( {this.props.role})
					</em>
				}
				</b>
			</li>
		)
	}
}

export default PlayerListItem;