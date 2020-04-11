const c_text = require('../constants/text.js');
const { client, MessageEmbed } = require('discord.js');

module.exports = {

  helpCommand: function(message){

    const helpEmbed = new MessageEmbed()
      // Set the title of the field
      .setTitle('Codenames Bot Help')
      // Set the color of the embed
      .setColor(0x00ff00)
      // Set the main content of the embed
      .setDescription(c_text.TEXT_HELP);
    // Send the embed to the same channel as the message
    message.channel.send(helpEmbed);

  }

}
