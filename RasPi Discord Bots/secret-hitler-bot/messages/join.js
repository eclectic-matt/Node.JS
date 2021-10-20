const { MessageEmbed } = require('discord.js');
const c_colours = require('../constants/colours.js');
const t_std = require('../../core-tools/coreStandardTools.js');

module.exports = {

  joinCommand: function (theGame, message){

    if ( (theGame.status.gameOver === true) ){
      // Game has ended, so reset ready for new game!
      theGame.reset();
      if (theGame.options.msgClearup){
        message.channel.bulkDelete(100);
      }
    }

    let thisUser = message.author.username;

    // PREVENT DUPLICATE JOINS
    if ( (theGame.players.nameArr.indexOf(thisUser) >= 0) && (!theGame.debugFlag) ){
      // This player has already joined - error!
      // Let the channel know
      let thisEmbed = new MessageEmbed()
        .setTitle('Join Error - already registered!')
        .setColor(c_colours.COLOUR_HELP)
        .setDescription('Sorry, but you have already joined this game!\n\nDue to the way the voting and nominations work for this game, you are not permitted to join more than once!\n\nOnce everyone has joined, send the message:\n\n**' + theGame.botData.prefix + ' start**\n\n');

      message.channel.send(thisEmbed);


    }else {
      // Wrap the stuff below
      theGame.addUser(message.author.id, thisUser);

      console.log(t_std.getDateStamp(),' Adding user ' + thisUser);

      // Let the channel know
      let thisEmbed = new MessageEmbed()
        .setTitle(thisUser + ' has joined the game!')
        .setColor(c_colours.COLOUR_HELP)
        .setDescription('Once all players have joined the game (min 5, max 10) then kick things off by typing:\n\n**' + theGame.botData.prefix + ' start**\n\nThere are currently ' + theGame.players.count + ' players who have joined!');

      message.channel.send(thisEmbed);

    }

  }

}
