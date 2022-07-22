//NEW REACT STUFF
function Cell(props){
	return (
		<td>{props.value}</td>
	);
}

class Table extends React.Component {
	
	constructor(props){
		super(props);
		let cells = [];
		for(let row = 1; row <= 7; row++){
			for(let col = 1; col <= 3; col++){
				switch(col){
					case 1:
						cells['r' + row + 'c' + col] = row;
						break;
					case 2:
						cells['r' + row + 'c' + col] = '';
						break;
					case 3:
						cells['r' + row + 'c' + col] = '';
						break;
				}
				
			}
		}
	}
	
	renderCell(i){
		return (
			<Cell value={this.props.cells[i]}
			/>
		);
	}
	renderRow(r){
		return (
			<tr>
				{this.renderCell('r' + r + 'c1')}
				{this.renderCell('r' + r + 'c2')}
				{this.renderCell('r' + r + 'c3')}
			</tr>
		)
	}
	render () {
		return (
			<table>
				<tr>
					<th>Round</th>
					<th>Guesses</th>
					<th>Thumbs</th>
				</tr>
				{this.renderRow(1)}
				{this.renderRow(2)}
				{this.renderRow(3)}
				{this.renderRow(4)}
				{this.renderRow(5)}
				{this.renderRow(6)}
				{this.renderRow(7)}
				
			</table>
		);
	}
}

const root = ReactDOM.createRoot(document.getElementById('guessesTable'));
root.render(<Table />);