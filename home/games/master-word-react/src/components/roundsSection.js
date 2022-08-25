import React from 'react';
import './styles/roundsSection.css';

class RoundsSection extends React.Component {

	renderClue(clue, index){
		return (
			<div 
				className='newClue'
				key={"clue" + clue + index}
				id={"clue" + clue + index}
			>
				{clue}
			</div>
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
		
		//<ul key={"roundList" + index}>
		return (
			<div key={"roundHeader" + index}>
				<h3 key={"roundHeader" + index}>Round {index + 1}</h3>
				<div 
					id={"roundClues" + index }
					className="roundCluesDiv"
				>
					{round.clues.length > 0 &&
						round.clues.map((clue, index) => this.renderClue(clue, index))
					}
				</div>
			</div>
		)
	}

	//<h2>Rounds</h2>
	render() {
		console.log('render rounds',this.props.rounds[0]);
		return (
			<section id="roundsSection">
				{this.props.rounds[0].map((round, index) => this.renderRound(round, index)) }
			</section>
		)
	}
}

export default RoundsSection;