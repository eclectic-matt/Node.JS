

module.exports = {

  investigateCommand: function(message, client){

    // Message format will be:
    // investigate player 1 - "EclecticMatt" (1039383829)
    // 0           1      2 3 4              5
    let split = message.content.split(/ +/);
    let playerName = split[4].replace('"','');
    let thisChannel = split[5].replace('(','').replace(')','');
    console.log('Received investigate request from ',message.author.id,playerName);

    client.channels.fetch(thisChannel)
      .then(channel => {
        // Before processing, check this message came from the president
        let presID = channel.game.getUserIDfromUsername(channel.game.government.currPres);
        let presUser = client.users.cache.get(presID);
        console.log('Inside investigate channel wrapper');
        // Check if message came from the president
        if (message.author.id === presID){
          // Check if the investigation power is currently active
          if (this.status.investigating){
            console.log('Valid investigation request');
            this.powerInvestigateResult(playerName);
          }else{
            console.log('Investigation requested but power not active');
            presUser.send('You are not allowed to investigate a player at this time');
          }

        }

      })
      .catch(console.error);

  }

}
