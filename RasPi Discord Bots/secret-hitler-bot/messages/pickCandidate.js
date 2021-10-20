

module.exports = {

  pickCommand: function(message, client){

    // Message will be in the format
    // pick candidate 1 - "EclecticMatt" (293840202818)
    // 0    1         2 3 4              5
    let split = message.content.split(/ +/);
    let playerName = split[4].replace('"','');
    let thisChannel = split[5].replace('(','').replace(')','');
    console.log('Received candidate pick request from',message.author.id,playerName);

    client.channels.fetch(thisChannel)
      .then(channel => {
        // Before processing, check this message came from the president
        let presID = channel.game.getUserIDfromUsername(channel.game.government.currPres);
        let presUser = client.users.cache.get(presID);
        console.log('Inside pick channel wrapper');
        // Check if message came from the president
        if (message.author.id === presID){
          // Check if the investigation power is currently active
          if (this.status.pickCandidate){
            console.log('Valid candidate pick request');
            this.powerPickCandidateResult(playerName);
          }else{
            console.log('Pick candidate requested but power not active');
            presUser.send('You are not allowed to pick a candidate at this time');
          }

        }
      })
      .catch(console.error);

  }

}
