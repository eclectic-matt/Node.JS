var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var https = require('https');

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
        if (cmd === 'cn'){
          // Get subsequent commands (already split from args, so 0)
          var subcmd = args[0];
          //botReplies(channelID, subcmd);
          //return;

          switch (subcmd){

            case 'help':
              bot.sendMessage({
                to: channelID,
                message: 'To start a game, use the command "!cn start <spymaster1> <spymaster2>" and tag the two players in the chat who will be spymasters for this round.'
              });
              break;


            // Spymaster 1 sends:
            // !cn start
            // Spymaster 2 sends:
            // !cn start

            case 'start':
              // Split the arguments for the two spymasters
              var spymasters = subcmd.split(' ');
              var sm1 = spymasters[0];
              var sm2 = spymasters[1];

              var options = {
                hostname: 'discordapp.com',
                path: '/api/users/@EclecticMatt',
                method: 'GET',
                headers: {
                  'Authorization': 'Bot NjkxNDIyNTA0NjA2MjM2ODMy.Xnf2Aw.-B1VMSJqjA0I8Vvm1JosOso2kP0',
                  'User-Agent': 'DiscordBot'
                }
              }

              var req = https.request(options, res => {
                console.log('Requesting Discord User data...');
                req.on('data', d => {
                  console.log('Request received ', d);
                });
              });

              req.on('error', error => {
                console.error(error);
              });

              req.end();

              //https://discordapp.com/api/users/@EclecticMatt
              // Generate colour grid
              // Generate word grid
              // Private message BOTH to sm1 and sm2
              // Then send word grid to channel
              bot.sendMessage({
                to: channelID,
                message: 'OK, here is the word grid for this game:'
              });
              break;
          }
        }
     }
});

function processSM1(error, response, body){
  if (!error && response.statusCode == 200) {
    console.log(body);
  }
}

/*
COLOUR HIGHTLIGHTS
https://www.writebots.com/discord-text-formatting/

```ini
[Here's some blue highlighted text]
```

```diff
- Here's some red colored text!
```

PRIVATE MESSAGE

message.author.send("Your message here.")

client.fetchUser("487904509670337509",false).then(user => {
        user.send("heloo",)
})


*/





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
