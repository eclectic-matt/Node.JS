import React from 'react';
import './styles/infoDiv.css';

class InfoDiv extends React.Component {

	/*
	<section id="infoDiv">
		<h2>Game: {this.props.info.name}</h2>
		<em>LobbyId: {this.props.info.lobbyId}</em>
		<br/>
		<em>Stage: {this.props.info.stage}</em>
		<br/>
	</section>
	*/

	returnStageName(stage){
		switch(stage){
			case 0:
				return 'Waiting in lobby';
			break;
			case 1:
				return 'Seekers Give Clues';
			break;
			case 2:
				return 'Guide Gives Thumbs';
			break;
			case 3:
				return 'Game Over!';
			break;
		}
	}

	render(){
		return (
			<section id="infoDiv">
				<h4 id="stageInfo">Stage: {this.returnStageName(this.props.status.stage)}</h4>
			</section>
		)
	}
}

export default InfoDiv;