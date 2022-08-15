import React from 'react';

class SecretsSection extends React.Component {

	render(){
		return (
			<section id="secretsSection">
				<div id="secretCategory">
					<h2>Category: {this.props.category}</h2>
				</div>
				<div id="secretWord">
					<h2>{this.props.word}</h2>
				</div>
			</section>
		)
	}
}

export default SecretsSection;