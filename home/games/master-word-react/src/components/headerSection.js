import React from 'react';
import PlayerList from './playerList'
import InfoDiv from './infoDiv'

class HeaderSection extends React.Component {

	render(){
		return (
			<section id="HeaderSection">
				<h2>Lobby</h2>
				<PlayerList players={this.props.players} />
				<InfoDiv info={this.props.info} />
			</section>
		)
	}
}

export default HeaderSection;