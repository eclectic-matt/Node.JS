const c_text = require('../constants/text.js');
const { client, MessageEmbed } = require('discord.js');

module.exports = {

  resetCommand: function(message){

    // Reset game variables to defaults
    message.channel.game.reset();
    message.channel.game.teams.gameOverFlag = false;
    // REMOVE 100 messages in the main channel to clean up
    if (message.channel.game.options.msgClearup){
      message.channel.bulkDelete(100);
    }
    // Send a message to the channel confirming reset
    const resetEmbed = new MessageEmbed()
      // Set the title of the field
      .setTitle('Codenames Bot Reset')
      // Set the color of the embed
      .setColor(0x00ff00)
      // Set the main content of the embed
      .setDescription(c_text.TEXT_RESET);
    // Send the embed to the same channel as the message
    message.channel.send(resetEmbed);

  }

}
