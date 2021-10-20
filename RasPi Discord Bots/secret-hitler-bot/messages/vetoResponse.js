const { MessageEmbed } = require('discord.js');
const c_colours = require('../constants/colours.js');
const c_game = require('../constants/game.js');


module.exports = {

  vetoResponse: function(message, client){

    // Message will be in the format
    // veto response DECLINE 230420349
    let split = message.content.split(/ +/);
    let thisResponse = split[2];
    let thisChannel = split[3];
    console.log('Received veto response from ',message.author.id);

    client.channels.fetch(thisChannel)
      .then(channel => {
        // Before processing, check this message came from the president
        let presID = channel.game.getUserIDfromUsername(channel.game.government.currPres);
        let presUser = client.users.cache.get(presID);
        let chanID = channel.game.getUserIDfromUsername(channel.game.government.currChan);
        let chanUser = client.users.cache.get(chanID);
        console.log('Inside veto response channel wrapper');
        // Check if message came from the president
        if (message.author.id === presID){
          // Check if the veto was requested
          if ( channel.game.government.vetoRequested ){
            console.log('Valid veto response');
            //this.government.vetoRequested = false;

            // Process the response
            if (thisResponse === 'DECLINE'){
              chanUser.send('The veto request was DECLINED. You must now pick from the 2 policies to enact one of these');
              // Use blank for the discarded policy
              channel.game.policyPhaseTwo('');
            }else if (thisResponse === 'APPROVE'){
              // Veto APPROVED
              let vetoEmbed = new MessageEmbed()
                .setTitle('Veto Power Used')
                .setColor(c_colours.COLOUR_HELP)
                .setDescription('The ' + channel.game.botData.president + ' and the ' + channel.game.botData.chancellor + ' have agreed that these policies should be vetoed, meaning that they have been discarded and none will be enacted.\n\n**This counts as a failed government and has moved the election failure tracker one step.**');
              channel.send(vetoEmbed);
              // Discard policyOptions
              channel.game.policyOptions = '';
              channel.game.boardProgress.failure++;
              if (channel.game.boardProgress.failure === c_game.BOARD_FAIL_COUNT){
                channel.game.chaosPolicy();
              }
              channel.game.roundEnd();
            }else{
              presUser.send('Veto response not recognised. Please try again using the responses above.');
            }

          }else{
            console.log('Kill player requested but power not active');
            presUser.send('You are not allowed to kill a player at this time');
          }

        }
      })
      .catch(console.error);

  }

}
