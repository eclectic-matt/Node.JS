import React from 'react';

class InfoDiv extends React.Component {

	render(){
		return (
			<section id="infoDiv">
				<h3>Game: {this.props.info.name}</h3>
				<b>Stage: {this.props.info.stage}</b>
			</section>
		)
	}
}

export default InfoDiv;