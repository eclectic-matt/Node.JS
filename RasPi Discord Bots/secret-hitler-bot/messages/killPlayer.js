

module.exports = {

  killPlayer: function(message, client){

    // Message will be in format
    // kill player 1 - "EclecticMatt" (371391239838)
    // 0    1      2 3 4              5
    let split = message.content.split(/ +/);
    let playerName = split[4].replace('"','');
    let thisChannel = split[5].replace('(','').replace(')','');
    console.log('Received kill player request from ',message.author.id, playerName);

    client.channels.fetch(thisChannel)
      .then(channel => {
        // Before processing, check this message came from the president
        let presID = channel.game.getUserIDfromUsername(channel.game.government.currPres);
        let presUser = client.users.cache.get(presID);
        console.log('Inside kill channel wrapper');
        // Check if message came from the president
        if (message.author.id === presID){
          // Check if the investigation power is currently active
          if (this.status.killPlayer){
            console.log('Valid kill player request');
            this.powerPresidentKillResult(playerName);
          }else{
            console.log('Kill player requested but power not active');
            presUser.send('You are not allowed to kill a player at this time');
          }

        }
      })
      .catch(console.error);

  }

}
