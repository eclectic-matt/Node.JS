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
		let nameSet = this.props.name !== this.props.id;
		return (
			<li 
			className="playerListItem"
			key={this.props.id} 
			value={this.props.name}>
				<b className={className}>
					{nameSet === true &&
						<span>👤</span>
					}
					{this.props.name}
				{this.props.role !== undefined && 
					<em>
						&nbsp;({this.props.role})
					</em>
				}
				</b>
			</li>
		)
	}
}

export default PlayerListItem;