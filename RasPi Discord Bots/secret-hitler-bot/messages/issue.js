const t_logs = require('../../core-tools/coreLogTools.js');
const { MessageEmbed } = require('discord.js');
const { issuesChannelID } = require('../config.json');
const c_colours = require('../constants/colours.js');

// Need to pass the relative reference FOR THE coreLogTools file
// i.e. where is the issuesLogFN IN RELATION to coreLogTools.js!
const issuesLogFN = '../secret-hitler-bot/logs/issuesLog.json';

module.exports = {

  issueCommand: function(theGame, message, client, issueCommand){

    let issueDesc = message.content.slice(issueCommand.length);

    let issueEmbed = new MessageEmbed()
      .setTitle(theGame.botData.hitler + ' Bot Issue Reported')
      .setColor(c_colours.COLOUR_HELP)
      .setDescription('Thank you for reporting this issue!\n\nThis has now been logged with the developer, who will try to fix this as soon as possible.');
    message.reply(issueEmbed);

    // Send this log to me in Discord
    let reportEmbed = new MessageEmbed()
      .setTitle('Issue Logged by channel "' + message.channel.name + '"')
      .setColor(c_colours.COLOUR_FASCIST)
      .setDescription(issueDesc);

      client.channels.fetch(issuesChannelID)
        .then(channel => {
          channel.send(reportEmbed);
        })
        .catch(console.error);

    t_logs.addIssueToLog(issuesLogFN, message.channel, issueDesc);

  }

}
