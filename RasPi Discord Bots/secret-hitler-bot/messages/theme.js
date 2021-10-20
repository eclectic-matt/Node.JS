const { MessageEmbed } = require('discord.js');
const c_colours = require('../constants/colours.js');
const c_text = require('../constants/text.js');
const themesJsonFN = './themes/themes.json';
const fs = require('fs');

module.exports = {

  themeCommand: function(theGame, message){

    // Themes help
    try {
      let data = fs.readFileSync(themesJsonFN, 'utf8');
      let arrThemes = JSON.parse(data);
      let themeCommandText = theGame.botData.prefix + ' theme';
      let themeID = message.content.slice(themeCommandText.length + 1);
      //console.log(message,themeID);

      if ( (themeID < 1) || (themeID > arrThemes.themes.length) ){
        message.reply('Sorry, this theme does not appear to be valid. Please try again.\n\nThe valid theme numbers range from 1 to ' + arrThemes.themes.length);
      }else{
        // Processing this new theme!
        themeID--;
        theGame.changeTheme(arrThemes.themes[themeID]);
        message.reply('The theme has now changed to ' + arrThemes.themes[themeID].name + '!\n\nMake sure to use "' + theGame.botData.prefix + ' help" to check the commands for this theme!');
      }
    } catch (err) {
      console.error(err)
    }


/*
    let helpEmbed = new MessageEmbed()
      .setTitle(theGame.botData.hitler + ' Bot Help')
      .setColor(c_colours.COLOUR_HELP)
      .setDescription('The Bot works when you send messages - some of these messages should be sent in this channel, but some should be sent in private messages with the Bot.\n\n**To avoid the most common error, either change your settings to allow Direct/Private messages from Bots, OR send a Direct Message to the Bot before you start playing** (click the Bot name and send any message to the Bot, which will allow you to receive Direct Messages during the game)');
    message.channel.send(helpEmbed);



    let themesDesc = 'Finally, the game is customisable with different themes so you can play with the default (Secret Hitler) or if you prefer you can play with an alternative setting\n\nThe themes currently available to use (not fully tested) are as follows:\n\n';

    for (let i = 0; i < arrThemes.length; i++){
      themesDesc += '**' + arrThemes[i].name + '**\n\n';
      themesDesc += 'Send the message: ' + theGame.botData.prefix + ' theme ' + (i + 1) + '\n\n';
    }

    helpEmbed = new MessageEmbed()
      .setTitle(theGame.botData.hitler + ' Bot Themes')
      .setColor(c_colours.COLOUR_HELP)
      .setDescription(themesDesc);
    message.channel.send(helpEmbed);

*/

  }

}
