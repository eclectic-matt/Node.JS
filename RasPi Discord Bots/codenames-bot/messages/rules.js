const c_text = require('../constants/text.js');
const { client, MessageEmbed } = require('discord.js');

module.exports = {

  rulesCommand: function(message){

    const rulesEmbed1 = new MessageEmbed()
      // Set the title of the field
      .setTitle('Codenames Game Rules')
      // Set the color of the embed
      .setColor(0x00ff00)
      // Set the main content of the embed
      .setDescription(c_text.TEXT_RULES_ONE);
    // Send the embed to the same channel as the message
    message.channel.send(rulesEmbed1);

    const rulesEmbed2 = new MessageEmbed()
      // Set the title of the field
      .setTitle('Spymaster Clue Rules')
      // Set the color of the embed
      .setColor(0x00ff00)
      // Set the main content of the embed
      .setDescription(c_text.TEXT_RULES_TWO);
      // Send the embed to the same channel as the message
      message.channel.send(rulesEmbed2);

    const rulesEmbed3 = new MessageEmbed()
      // Set the title of the field
      .setTitle('Don\'t Be Too Strict!')
      // Set the color of the embed
      .setColor(0x00ff00)
      // Set the main content of the embed
      .setDescription(c_text.TEXT_RULES_THREE);
      // Send the embed to the same channel as the message
      message.channel.send(rulesEmbed3);

  }

}
