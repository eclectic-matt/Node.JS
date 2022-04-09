var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];

        args = args.splice(1);
        if (cmd === 'dnd'){
          // Get subsequent commands (already split from args, so 0)
          var subcmd = args[0];
          botReplies(channelID, subcmd);
          return;

          switch (subcmd){

            case 'help':
              bot.sendMessage({
                to: channelID,
                message: 'The following commands are available:\nmove <location name/id> - the character who issued the command will move to the location requested'
              });
              break;

            case 'move':
              bot.sendMessage({
                to: channelID,
                message: 'OK, moving now!'
              });
              break;
          }
        }
     }
});

/*

  The following replies are expected

  PUBLIC
  - move <location>
  - list
  -

  ADMIN
  - update list

*/

var botLocations = {};
botLocations.array = [];
botLocations.array[0] = {};
botLocations.array[0].name = 'The Market Square';
botLocations.array[0].id = 0;
botLocations.array[1] = {};
botLocations.array[1].name = 'The Gardens of Ikkall';
botLocations.array[1].id = 1;

function botReplies(channelID, subcmd){

  switch (subcmd){

    case 'help':
      bot.sendMessage({
        to: channelID,
        message: 'The following commands are available:\nmove <location name/id> - the character who issued the command will move to the location requested'
      });
      break;

    case 'move':
      bot.sendMessage({
        to: channelID,
        message: 'OK, moving now!'
      });
      break;
  }

}
