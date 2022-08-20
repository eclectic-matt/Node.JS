import React from 'react';

class RoundsSection extends React.Component {

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

	renderRound(round){
		return (
			<div key={"roundHeader" + round}>
				<h3 key={"roundHeader" + round}>Round {round + 1}</h3>
				<ul key={"roundList" + round}>
					{this.props.clues.length > 0 &&
						this.props.clues[round].map((clue,round) => this.renderClue(clue, round))
					}
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