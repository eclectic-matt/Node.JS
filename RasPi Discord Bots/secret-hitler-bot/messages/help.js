const { MessageEmbed } = require('discord.js');
const c_colours = require('../constants/colours.js');
const c_text = require('../constants/text.js');
const themesJsonFN = './themes/themes.json';
const fs = require('fs');

module.exports = {

  helpCommand: function(theGame, message){

    // Common issues help
    let helpEmbed = new MessageEmbed()
      .setTitle(theGame.botData.hitler + ' Bot Help')
      .setColor(c_colours.COLOUR_HELP)
      .setDescription('The Bot works when you send messages - some of these messages should be sent in this channel, but some should be sent in private messages with the Bot.\n\n**To avoid the most common error, either change your settings to allow Direct/Private messages from Bots, OR send a Direct Message to the Bot before you start playing** (click the Bot name and send any message to the Bot, which will allow you to receive Direct Messages during the game)');
    message.channel.send(helpEmbed);

    // Main commands help
    helpEmbed = new MessageEmbed()
      .setTitle(theGame.botData.hitler + ' Bot Commands')
      .setColor(c_colours.COLOUR_HELP)
      .setDescription('The main commands (messages) to send during the game are as follows:\n\n' + theGame.botData.prefix + ' join\nSend this message in the main channel to register yourself as a player for the game.\n\n' + theGame.botData.prefix + ' start\nSend this message in the main channel to start the game once enough players have registered using the "join" command.\n\n' + theGame.botData.prefix + ' nominate @username\nThe ' + theGame.botData.president + ' should send this message in the main channel and it will nominate the player tagged in the message as the new ' + theGame.botData.chancellor + '.\n**NOTE: this command only works when the user has been tagged (@username) so ensure that you have correctly tagged your chosen user in this message!**\n\n' + theGame.botData.prefix + ' vote\nThis command should be used in a private (direct) message to the Bot, and you will receive further instructions directly on how to correctly (and privately) vote - this is a democracy after all!');
    message.channel.send(helpEmbed);

    // Themes help


    try {
      let themesDesc = 'Finally, the game is customisable with different themes so you can play with the default (Secret Hitler) or if you prefer you can play with an alternative setting\n\nThe themes currently available to use (not fully tested) are as follows:\n\n';
      let data = fs.readFileSync(themesJsonFN, 'utf8');
      let arrThemes = JSON.parse(data);
      for (let i = 0; i < arrThemes.themes.length; i++){
        themesDesc += '**' + arrThemes.themes[i].name + '**\n';
        themesDesc += 'Send the message: ' + theGame.botData.prefix + ' theme ' + (i + 1) + '\n\n';
      }
      //console.log(themesDesc);
      helpEmbed = new MessageEmbed()
        .setTitle(theGame.botData.hitler + ' Bot Themes')
        .setColor(c_colours.COLOUR_HELP)
        .setDescription(themesDesc);
      message.channel.send(helpEmbed);
    } catch (err) {
      console.error(err)
    }





  }

}
