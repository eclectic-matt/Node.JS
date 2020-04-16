const { MessageEmbed } = require('discord.js');

const c_colours = require('../constants/colours.js');

const t_discord = require('../../core-tools/coreDiscordTools.js');

module.exports = {

  nominateCommand: function(theGame, message, client){

    let nominateCommandText = theGame.botData.prefix + ' nominate';

    if (
      (message.author.username === theGame.government.nomPres) &&
      (theGame.government.nomChan === '')
    ) {

      // Using official docs code from:
      // https://discordjs.guide/miscellaneous/parsing-mention-arguments.html#implementation
      const withoutPrefix = message.content.slice(nominateCommandText.length);
    	const split = withoutPrefix.split(/ +/);
    	const command = split[0];
    	const args = split.slice(1);

      let thisNomination = t_discord.getUserFromMention(client, args[0]);

      //console.log(thisNomination.username);
      if (!thisNomination){
        message.reply('No user mentioned! The ' + theGame.botData.president + ' should try again using the command:\n\n**' + nominateCommand + ' @username**\n\nEnsuring that you tag the user you wish to nominate as ' + theGame.botData.chancellor + '!');
      }else{


        // Check if this nominee was the previous Chancellor!
        // ALSO check if the nominee was the last president and player count > 5
        /* ORIGINAL CODE BEFORE TESTING FLAG
        if (
          (thisNomination.username === theGame.government.prevChan) ||
          ( (thisNomination.username === theGame.government.prevPres) && (theGame.players.count > 5) )
        ){
        */
        if (
          ( (thisNomination.username === theGame.government.prevChan) && !theGame.debugFlag) ||
          ( (thisNomination.username === theGame.government.prevPres) && (theGame.players.count > 5) && !theGame.debugFlag )
        ){
          message.reply('Sorry, you cannot nominate a ' + theGame.botData.chancellor + ' who was the previous ' + theGame.botData.chancellor + '!\n\nPlease select another nominee!');
        }else{
          theGame.chancellorNominated(thisNomination.id, thisNomination.username);
          thisNomination = thisNomination.username;
          // Let the channel know
          let thisEmbed = new MessageEmbed()
            .setTitle(thisNomination + ' has been nominated as ' + theGame.botData.chancellor + '!')
            .setColor(c_colours.COLOUR_HELP)
            .setDescription('OK so we now have our proposed ' + theGame.botData.government + '!\n\n**' + theGame.botData.president + ': ' + theGame.government.nomPres + '**\n\n**' + theGame.botData.chancellor + ': ' + theGame.government.nomChan + '**\n\nAll players should now vote on whether they approve these choices by **SENDING A MESSAGE TO THE BOT IN A PRIVATE MESSAGE**\n\n**Do not vote in this channel!**\n\nOnce all the votes have been received the results will be posted in this channel!');

          message.channel.send(thisEmbed);

          // Loop through and send a private reminder to the players
          for (let i = 0; i < theGame.players.idArr.length; i++){

            let thisPlayerID = theGame.players.idArr[i];
            let embedDesc = 'You should vote privately by sending a message here for the proposed ' + theGame.botData.government + '!\n\n**' + theGame.botData.president + ': ' + theGame.government.nomPres + '**\n\n**' + theGame.botData.chancellor + ': ' + theGame.government.nomChan + '**\n\nIt is easier to copy and paste your preferred response below to send it. If you are using the Discord app on mobile, just hold down on the message you want to send and then paste it into the "message" box below:';

            let thisEmbed = new MessageEmbed()
              .setTitle('Private Voting (' + message.channel.name + ')')
              .setColor(c_colours.COLOUR_HELP)
              .setDescription(embedDesc);

            let thisDiscordUser = client.users.cache.get(thisPlayerID);
            thisDiscordUser.send(thisEmbed);

            thisEmbed = new MessageEmbed()
              .setTitle('Vote for ' + theGame.botData.yes.toUpperCase())
              .setColor(c_colours.COLOUR_HELP)
              .setDescription('vote ' + theGame.botData.yes + ' (' + message.channel.id + ')');
            thisDiscordUser.send(thisEmbed);

            thisEmbed = new MessageEmbed()
              .setTitle('Vote for ' + theGame.botData.no.toUpperCase())
              .setColor(c_colours.COLOUR_FASCIST)
              .setDescription('vote ' + theGame.botData.no + ' (' + message.channel.id + ')');
            thisDiscordUser.send(thisEmbed);

          }

        } // END IF Prev Nominee

      } // END IF !thisNomination

    }else{
        message.reply('Nomination error!\n\nEither you are not the ' + theGame.botData.president + ' or we already have a nomination for the ' + theGame.botData.chancellor + '!');
    } // END IF user = nomPres & nomChan = ''


  }

}
