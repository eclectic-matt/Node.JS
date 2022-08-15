import React from 'react';

/**
 * PlayerListItem is a single LI showing a player name and role.
 * @props id: string A unique ID for the player.
 * @props name: string A unique name for the player.
 * @props role: string The player's role for this game.
 */
class PlayerListItem extends React.Component {
	render(){
		return (
		<li 
			key={this.props.id} 
			value={this.props.name}>
				<b>
					{this.props.name}
				</b>
				&nbsp;
				<em>
					({this.props.role})
				</em>
			</li>
		)
	}
}

export default PlayerListItem;