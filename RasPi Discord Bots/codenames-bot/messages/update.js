const t_logs = require('../../core-tools/coreLogTools.js');
const { MessageEmbed } = require('discord.js');
const updatesLogFN = '../codenames-bot/logs/updatesLog.json';

module.exports = {

  updateCommand: function(message){

    let latestUpdate = t_logs.getLatestUpdate(updatesLogFN);

    // Send a message to the channel with any changes since the last update
    const updateEmbed = new MessageEmbed()
      // Set the title of the field
      .setTitle('Codenames Bot Update - ' + latestUpdate.date)
      // Set the color of the embed
      .setColor(0x00ff00)
      // Set the main content of the embed
      .setDescription(latestUpdate.desc);
    // Send the embed to the same channel as the message
    message.channel.send(updateEmbed);

  }

}
