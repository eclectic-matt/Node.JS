//IMPORTS
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';




///  <!-- Load React. -->
//<!-- Note: when deploying, replace "development.js" with "production.min.js". -->
//<script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
//<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>


class Game extends React.Component { 

	constructor(props){
		super(props);
	}

	//REQUIRED
	render(){

		return (
			<PlayersList value="{this.props.players}" />
		)
	}
}

class PlayersList extends React.Component {

	constructor(players){
		super(players);
	}

	renderPlayer(player){ 
		return (
			<li key="{player.id}" value="{player.id}">{player.name} {player.role}</li>
		)
	}

	renderPlayers(players){
		return(
			<ul>
				{players.map((p) => this.renderPlayer(p));}
			</ul>
		)
	}
	render(){
		return (
			{this.renderPlayers(this.props);}
		)
	}
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<PlayersList />);
