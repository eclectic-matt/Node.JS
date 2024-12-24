//Create an event handler:
export const teamAddedEventHandler = () => {

	//console.log('Check for team on IP ' + currentIP + ' at ' + new Date() );
	//console.log('Team list = ',teamList);
	var teamFlag = false;

	for (let i = 0; i < teams.IPs.length; i++){
		//console.log('Team ',i,teamList[i]);
		if (teams.IPs[i] == currentIP){
			// Found existing team
			//console.log('Existing team connected',i);
			//console.log('');
			// Set flag to show this IP is handled
			teamFlag = true;
		}
	}

	// If this IP was not found in the team list
	if (teamFlag == false){
		// Check the IP is not blank or admin
		if ( (currentIP !== '') && (currentIP !== '::ffff:192.168.1.227') ){
			// Add a new team with this IP
			teams.IPs[teams.IPs.length] = currentIP;
			console.log('New team added - ' + currentIP);
			//console.log(teamList);
			//console.log('');
		}
	}
}

//Assign the event handler to an event:
eventEmitter.on('newPlayer', teamAddedEventHandler);

//eventEmitter.emit('newPlayer');
