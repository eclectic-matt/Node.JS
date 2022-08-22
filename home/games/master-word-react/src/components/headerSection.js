import React from 'react';
import PlayerList from './playerList'
import InfoDiv from './infoDiv'
import ResetGameButton from './resetGameButton'
import './styles/headerSection.css';

class HeaderSection extends React.Component {

	render(){
		return (
			<section id="HeaderSection">
				<h1>{this.props.info.name}</h1>
				<InfoDiv info={this.props.info} status={this.props.status}/>
				<PlayerList socket={this.props.socket} players={this.props.players} />
				<ResetGameButton socket={this.props.socket} />
			</section>
		)
	}
}

export default HeaderSection;