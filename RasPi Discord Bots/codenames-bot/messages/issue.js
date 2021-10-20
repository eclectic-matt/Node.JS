const t_logs = require('../../core-tools/coreLogTools.js');
const { client, MessageEmbed } = require('discord.js');
const { issuesChannelID } = require('../config.json');

// Need to pass the relative reference FOR THE coreLogTools file
// i.e. where is the issuesLogFN IN RELATION to coreLogTools.js!
const issuesLogFN = '../codenames-bot/logs/issuesLog.json';

module.exports = {

  issueCommand: function(message, client){

    let issueDesc = message.content.slice(9,1000);

    let issueEmbed = new MessageEmbed()
      .setTitle('Codenames Bot Issue Reported')
      .setColor(0x00ff00)
      .setDescription('Thank you for reporting this issue!\n\nThis has now been logged with the developer, who will try to fix this as soon as possible.');
    message.reply(issueEmbed);

    // Send this log to me in Discord
    let reportEmbed = new MessageEmbed()
      .setTitle('Issue Logged by channel "' + message.channel.name + '"')
      .setColor(0xff0000)
      .setDescription(issueDesc);

      client.channels.fetch(issuesChannelID)
        .then(channel => {
          channel.send(reportEmbed);
        })
        .catch(console.error);

    t_logs.addIssueToLog(issuesLogFN, message.channel, issueDesc);

  }

}
