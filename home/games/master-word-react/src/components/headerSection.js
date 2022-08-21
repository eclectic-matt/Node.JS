import React from 'react';
import PlayerList from './playerList'
import InfoDiv from './infoDiv'
import './styles/headerSection.css';

class HeaderSection extends React.Component {

	render(){
		return (
			<section id="HeaderSection">
				<h1>{this.props.info.name}</h1>
				<PlayerList socket={this.props.socket} players={this.props.players} />
				<InfoDiv info={this.props.info} status={this.props.status}/>
			</section>
		)
	}
}

export default HeaderSection;