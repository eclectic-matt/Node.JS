/**
 * Source: https://reactjs.org/tutorial/tutorial.html
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

/**
 * 
 * A simple functional React component (rather than class extension), 
 * doesn't allow methods within it, only has a render() method
 * which can take a props object.
 * @param {object} props 
 * @returns 
 */
function Square(props){
	//THIS IS A SHORTHAND render() METHOD
	return (
		//A BUTTON COMPONENT
		<button
			//class= MUST BE RENAMED className= IN JSX
			className="square"
			//onClick IS A REACT HANDLER, IN THIS CASE PASSING props.onClick
			//WHICH IS DEFINED ON THE Board COMPONENT
			onClick={props.onClick}
		>
			{props.value}
		</button>
	);
}

/**
 * Board is a class component, which allows additional methods.
 * The purpose of the board is to define the grid (render) and output the child Square components (renderSquare).
 */
class Board extends React.Component {

	//OUTPUT A SINGLE SQUARE COMPONENT, PASSING PROPS
	renderSquare(i) {
		return (
			<Square 
				value={this.props.squares[i]} 
				onClick={() => this.props.onClick(i)} 
			/>
		);
	}

	//OUTPUT THE GRID, USING THE renderSquare METHOD TO OUTPUT CELLS
	render() {
		return (
			<div>
				<div className="board-row">
					{this.renderSquare(0)}
					{this.renderSquare(1)}
					{this.renderSquare(2)}
				</div>
				<div className="board-row">
					{this.renderSquare(3)}
					{this.renderSquare(4)}
					{this.renderSquare(5)}
				</div>
				<div className="board-row">
					{this.renderSquare(6)}
					{this.renderSquare(7)}
					{this.renderSquare(8)}
				</div>
			</div>
		);
	}
}

/**
 * The Game component handles all the game logic 
 * and passes this down via props to the board and squares.
 */
class Game extends React.Component {
	
	//INITIALIZE THE GAME
	constructor(props){
		//REACT CONSTRUCTORS *ALWAYS* NEED super(props)
		super(props);
		//INITIALIZE THE GAME STATE
		this.state = {
			history: [{
				squares: Array(9).fill(null),
			}],
			xIsNext: true,
			stepNumber: 0,
		};
	}

	//HANDLE A CLICK - NOTE: this is passed as a prop to the Square component via
	//onClick={(i) => this.handleClick(i)}
	handleClick(i){

		//GET THE "CURRENT" HISTORY (SLICE BASED ON STEP NUMBER)
		const history = this.state.history.slice(0, this.state.stepNumber + 1);
		//GET THE CURRENT STATE (THE history ARRAY AT INDEX length - 1)
		const current = history[history.length - 1];
		//GET THE CURRENT SQUARES ARRAY
		const squares = current.squares.slice();
		//IF A WINNER IS FOUND, OR IF squares[i] IS NOT NULL
		if(calculateWinner(squares) || squares[i]){
			return;
		}
		//THE VALUE OF squares[i] DEPENDS ON xIsNext (either X or O)
		squares[i] = this.state.xIsNext ? 'X' : 'O';
		//IMMUTABLE STATE UPDATE (NO UPDATE, REPLACE ENTIRE OBJECT)
		this.setState({
			history: history.concat([{
				squares: squares,
			}]),
			xIsNext: !this.state.xIsNext,
			stepNumber: history.length,
		});
	}

	//FOR THE "HISTORY" FEATURE, GO BACK TO STEP X
	jumpTo(step){
		this.setState({
			stepNumber: step,
			xIsNext: (step % 2) === 0,
		});
	}

	//RENDER THE GAME, GETTING HISTORY/SQUARES FROM THE CURRENT STATE
	render() {
		const history = this.state.history;
		const current = history[this.state.stepNumber];
		const winner = calculateWinner(current.squares);

		//USING A MAP FUNCTION (index => val) TO GENERATE A LIST OF MOVES
		const moves = history.map((step, move) => {
			const desc = move ? 
			'Go to move #' + move :
			'Go to game start';
			return (
				<li key={move}>
					<button onClick ={() => this.jumpTo(move)}>{desc}</button>
				</li>
			);
		});

		let status;
		if(winner){
			status = 'Winner: ' + winner;
		}else{
			status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
		}
		
		//THIS IS THE OUTPUT FOR THE WHOLE GAME
		//NOTE squares = {current.squares} TO GET HISTORICAL STATE
		//AND onClick MEANS THAT CLICKING A SQUARE IS PASSED UP THE CHAIN
		//THROUGH THE BOARD COMPONENT AND INTO THE handleClick OF THE GAME COMPONENT 
		return (
			<div className="game">
			<div className="game-board">
				<Board 
					squares={current.squares}
					onClick={(i) => this.handleClick(i)}
				/>
			</div>
			<div className="game-info">
				<div>{status}</div>
				<ol>{moves}</ol>
			</div>
		</div>
		);
	}
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

function calculateWinner(squares) {
	const lines = [
	  [0, 1, 2],
	  [3, 4, 5],
	  [6, 7, 8],
	  [0, 3, 6],
	  [1, 4, 7],
	  [2, 5, 8],
	  [0, 4, 8],
	  [2, 4, 6],
	];
	for (let i = 0; i < lines.length; i++) {
	  const [a, b, c] = lines[i];
	  if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
		return squares[a];
	  }
	}
	return null;
  }
  