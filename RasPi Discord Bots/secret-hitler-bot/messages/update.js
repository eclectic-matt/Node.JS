const t_logs = require('../../core-tools/coreLogTools.js');
const { MessageEmbed } = require('discord.js');
const updatesLogFN = '../secret-hitler-bot/logs/updatesLog.json';
const c_colours = require('../constants/colours.js');

module.exports = {

  updateCommand: function(theGame, message){

    let latestUpdate = t_logs.getLatestUpdate(updatesLogFN);

    // Send a message to the channel with any changes since the last update
    const updateEmbed = new MessageEmbed()
      // Set the title of the field
      .setTitle(theGame.botData.hitler + ' Bot Update - ' + latestUpdate.date)
      // Set the color of the embed
      .setColor(c_colours.COLOUR_HELP)
      // Set the main content of the embed
      .setDescription(latestUpdate.desc);
    // Send the embed to the same channel as the message
    message.channel.send(updateEmbed);

  }

}
