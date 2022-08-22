import React from 'react';

class RoundsSection extends React.Component {

	renderClue(clue, index){
		return (
			<li 
			key={"clue" + clue + index}
			id={"clue" + clue + index}
			>
				{clue}
			</li>
		)
	}

	renderSolution(solution, round){
		return (
			<li 
			key={"solution" + solution + round}
			id={"solution" + solution + round}
			>
				{solution}
			</li>
		)
	}

	renderRound(round, index){
		//console.log('render round', round);
		if(round.clues.length === 0){
			return false;
		}
		return (
			<div key={"roundHeader" + index}>
				<h3 key={"roundHeader" + index}>Round {index + 1}</h3>
				<ul key={"roundList" + index}>
					{round.clues.length > 0 &&
						round.clues.map((clue, index) => this.renderClue(clue, index))
					}
				</ul>
			</div>
		)
	}

	render() {
		console.log('render rounds',this.props.rounds[0]);
		return (
			<section id="roundsSection">
				<h2>Rounds</h2>
				{this.props.rounds[0].map((round, index) => this.renderRound(round, index)) }
			</section>
		)
	}
}

export default RoundsSection;