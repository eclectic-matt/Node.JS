const { MessageEmbed } = require('discord.js');

const c_colours = require('../constants/colours.js');

module.exports = {

  rulesCommand: function(theGame, message){


    let rulesDescription = 'The rules for ' + theGame.botData.name + ' are:\n\n';

    rulesDescription += 'Each of you is a ' + theGame.botData.player + ' working with the ' + theGame.botData.government + ' to decide on policies to enact. Most of you will be *_' + theGame.botData.liberal + '_* who will be trying to get _' + theGame.botData.liberal + '_ policies enacted, while a smaller number of you will be _' + theGame.botData.fascist + '_ who will be trying to get _' + theGame.botData.fascist + '_ policies enacted - and **just one of you** will be the **' + theGame.botData.name + '**!\n\n';

    rulesDescription += 'You should each join a new game by each sending a message saying "' + theGame.botData.prefix + ' join" which will register you as a player. Once all the players have joined, one player should send a message saying "' + theGame.botData.prefix + ' start". The bot will then send you each a PRIVATE message telling you what your SECRET role will be for this game.\n\n';

    rulesDescription += 'Your secret role will be one of the following:\n - ' + theGame.botData.liberal + '\n - ' + theGame.botData.fascist + '\n - ' + theGame.botData.hitler + ' (part of the ' + theGame.botData.fascist + ' team)\n\nYou should not tell anyone else what your secret role is - the bot will let you know any other secret roles you should know to play the game';

    let rulesEmbed1 = new MessageEmbed()
      .setTitle(theGame.botData.name + ' Rules 1/3')
      .setColor(c_colours.COLOUR_HELP)
      .setDescription(rulesDescription);

    message.channel.send(rulesEmbed1);

    rulesDescription = 'Once all of the secret roles have been assigned, the bot will then randomly select one player who will be the nominated _' + theGame.botData.president + '_ for the first round. In future rounds, the role of _' + theGame.botData.president + '_ will move around so that everyone will be the nominee in turn.\n\n';

    rulesDescription += 'The nominated _' + theGame.botData.president + '_ should then send a message in the MAIN CHANNEL to nominate a _' + theGame.botData.chancellor + '_ by sending a message saying "' + theGame.botData.prefix + ' nominate @UserName" (ensuring the user they are nominating is tagged so that Discord recognises their user name).\n\n';

    rulesDescription += 'Together, the _' + theGame.botData.president + '_ and the _' + theGame.botData.chancellor + '_ will be responsible for enacting a policy during a private _"' + theGame.botData.legislative + '"_\n\n'

    rulesDescription += 'During this _"' + theGame.botData.legislative + '"_, the _' + theGame.botData.president + '_ will be shown the top THREE policies available to enact and they should choose ONE to DISCARD. The _' + theGame.botData.chancellor + '_ will then receive the TWO remaining policies, and they should also DISCARD ONE of these and the remaining policy will be enacted and any actions on the game board will take place.\n\n';

    rulesDescription += 'Once this policy has been enacted and any game board actions have taken place, then a new round will start with a new nominated _' + theGame.botData.president + '_\n\n';

    let rulesEmbed2 = new MessageEmbed()
      .setTitle(theGame.botData.name + ' Rules 2/3')
      .setColor(c_colours.COLOUR_HELP)
      .setDescription(rulesDescription);

    message.channel.send(rulesEmbed2);

    rulesDescription = 'The game will end in one of the following four ways.\n\n';

    rulesDescription += '**The *' + theGame.botData.liberal + '* team will win in one of these two ways:**\n\n';

    rulesDescription += '1) If the _' + theGame.botData.liberal + '_ team manage to get 5 _' + theGame.botData.liberal + '_ policies enacted.\n\n';

    rulesDescription += '2) If the player who is _' + theGame.botData.hitler + '_ is killed through a special game board action.\n\n';

    rulesDescription += '**The *' + theGame.botData.fascist + '* team will win in one of these two ways:**\n\n';

    rulesDescription += '3) If the _' + theGame.botData.fascist + '_ team manage to get 6 _' + theGame.botData.fascist + '_ policies enacted.\n\n';

    rulesDescription += '4) If _' + theGame.botData.hitler + '_ manages to get themselves elected as _' + theGame.botData.chancellor + '_ but only once AT LEAST THREE _' + theGame.botData.fascist + '_ policies have been enacted.\n\n';

    let rulesEmbed3 = new MessageEmbed()
      .setTitle(theGame.botData.name + ' Rules 3/3')
      .setColor(c_colours.COLOUR_HELP)
      .setDescription(rulesDescription);

    message.channel.send(rulesEmbed3);

  }

}
