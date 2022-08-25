import React from 'react';
import PlayerList from './playerList'
import InfoDiv from './infoDiv'
import ResetGameButton from './resetGameButton'
import './styles/headerSection.css';

class HeaderSection extends React.Component {
	//<h1>{this.props.info.name}</h1>
	render(){
		return (
			<section id="headerSection">
				<h1><span id="headerMaster">MASTER</span><br/><span id="headerWord">Word</span></h1>
				<InfoDiv info={this.props.info} status={this.props.status}/>
				{ this.props.status.stage === 0 &&
					<PlayerList socket={this.props.socket} players={this.props.players} />
				}
				<ResetGameButton socket={this.props.socket} />
			</section>
		)
	}
}

export default HeaderSection;