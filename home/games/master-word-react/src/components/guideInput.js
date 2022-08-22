import React from 'react';

class GuideInput extends React.Component {

	markLose = () => {

	}

	renderClue(clue, index){
		return (
			<li 
			key={"clue" + clue + index}
			id={"clue" + clue + index}
			onClick="markLose"
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

	renderThumbsInput(maxThumbs){
		return (
			<input
			type="number"
			min="0"
			max={maxThumbs}
			step="1"
			value="0"
			/>
		)
	}

	renderClues(round, index){
		console.log('render guide clue', round);
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
		let roundClues = this.props.rounds[0][this.props.status.currentRound - 1].clues;
		console.log('render guide clues',roundClues);
		return (
			<section id="guideInputSection">
				<h2>Clues/Solutions</h2>
				{this.renderThumbsInput(this.props.info.cluesPerRound)}
				{roundClues.map((clue, index) => this.renderClues(clue, index)) }
			</section>
		)
	}
}

export default GuideInput;