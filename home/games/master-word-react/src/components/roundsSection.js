import React from 'react';

class RoundsSection extends React.Component {

	/*render(){
		return (
			<section id="roundsSection">
				{this.props.clues.map((clue, index) => this.renderClue(clue, index))}
				<b>Stage: {this.props.info.stage}</b>
			</section>
		)
	}*/

	renderClue(clue, round){
		return (
			<li 
			key={"clue" + clue + round}
			id={"clue" + clue + round}
			>
				{clue}
			</li>
		)
	}

	renderRound(round){
		return (
			<div key={"roundHeader" + round}>
				<h3 key={"roundHeader" + round}>Round {round + 1}</h3>
				<ul key={"roundList" + round}>
					{this.props.clues[round].map((clue,round) => this.renderClue(clue, round))}
				</ul>
			</div>
		)
	}

	render() {
		return (
			<section id="roundsSection">
				<h2>Rounds</h2>
				{this.props.clues.map((clue, index) => this.renderRound(index)) }
			</section>
		)
	}
}

export default RoundsSection;