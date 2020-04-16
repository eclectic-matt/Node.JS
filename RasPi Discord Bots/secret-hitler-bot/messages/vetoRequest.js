const { MessageEmbed } = require('discord.js');
const c_colours = require('../constants/colours.js');


module.exports = {

  vetoRequest: function(message, client){

    // Message will be in format
    // veto request 220202933030
    let split = message.content.split(/ +/);
    let thisChannel = split[2];
    console.log('Received veto request from ',message.author.id);

    client.channels.fetch(thisChannel)
      .then(channel => {
        // Before processing, check this message came from the chancellor
        let presID = channel.game.getUserIDfromUsername(channel.game.government.currPres);
        let presUser = client.users.cache.get(presID);
        let chanID = channel.game.getUserIDfromUsername(channel.game.government.currChan);
        let chanUser = client.users.cache.get(chanID);
        console.log('Inside veto request channel wrapper');
        // Check if message came from the chancellor
        if (message.author.id === chanID){
          // Check if the veto power is currently active and request not already submitted
          if ( (channel.game.government.vetoUnlocked) && (!channel.game.government.vetoRequested) ){
            console.log('Valid veto request');
            channel.game.government.vetoRequested = true;
            let vetoEmbed = new MessageEmbed()
              .setTitle('Veto Requested')
              .setColor(c_colours.COLOUR_HELP)
              .setDescription('The ' + channel.game.botData.chancellor + ' has requested that these policies are all vetoed, meaning that they will be discarded and none will be enacted.\n\n**Please note: this will count as a failed government and will move the election failure tracker one step.**\n\nYou should reply in this private message to indicate if you DECLINE or APPROVE this veto request.\n\nIt is easier to copy and paste your preferred response below to send it. If you are using the Discord app on mobile, just hold down on the message you want to send and then paste it into the "message" box below:');
            presUser.send(vetoEmbed);
            presUser.send('veto response DECLINE (' + channel.id + ')');
            presUser.send('veto response APPROVE (' + channel.id + ')');

          }else{
            console.log('Veto requested but not active');
            chanUser.send('You are not allowed to veto the policies at this time');
          }

        }
      })
      .catch(console.error);

  }

}
