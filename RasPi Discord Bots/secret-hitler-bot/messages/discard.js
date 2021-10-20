

module.exports = {

  discardCommand: function(message, client){

    // message will be in the format
    // discard policy 1 (channelID)
    let split = message.content.split(/ +/);

    let thisChannel = split[3].replace('(','').replace(')','');
    let discardedPolicy = split[2];
    console.log('Received discard policy from ID ',message.author.id,discardedPolicy);

    // Have to wrap everything in the channel fetch to check policy options and IDs
    client.channels.fetch(thisChannel)
      .then(channel => {
        // Before processing, check this message came from the president
        let presID = channel.game.getUserIDfromUsername(channel.game.government.currPres);
        let chanID = channel.game.getUserIDfromUsername(channel.game.government.currChan);
        console.log('Inside discard channel wrapper');
        // Check if message came from the president
        if (message.author.id === presID){
          // Check if three policies currently available
          if (channel.game.policyOptions.length === 3){
            // Check if message is discarding policy 1, 2 or 3
            if ( (discardedPolicy === '1') || (discardedPolicy === '2') || (discardedPolicy === '3') ){
              console.log('Valid presidential discard received');
              channel.game.policyPhaseTwo(discardedPolicy, client);
              return;
            }
          }
        // Check if message came from the chancellor
        //}else if (message.author.id === chanID){
        }
        // Having to use this for testing rather than "else if" as I'm both pres & chan!
        if (message.author.id === chanID){

          // Check if two policies currently available
          if (channel.game.policyOptions.length === 2){
            // Check if message is discarding policy 1 or 2
            if ( (discardedPolicy === '1') || (discardedPolicy === '2') ){
              console.log('Valid chancellor discard received');
              channel.game.policyEnact(discardedPolicy);
            }
          }
        }
      })
      .catch(console.error);

  }

}
