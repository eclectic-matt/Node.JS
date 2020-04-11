const t_logs = require('../../core-tools/coreLogTools.js');
const { client, MessageEmbed } = require('discord.js');
const gamesLogFN = '../codenames-bot/logs/gamesLog.json';

module.exports = {

  startCommand: function(message, client){

    if (message.channel.game.teams.gameOverFlag === true){
      // Game has ended, so reset ready for new game!
      message.channel.game.reset();
      if (message.channel.game.options.msgClearup){
        message.channel.bulkDelete(100);
      }
    }

    // If there is no ID for spymaster 1 registered
    if (message.channel.game.users.sm1 === ''){

      message.channel.game.teams.gameOverFlag = false;

      t_logs.addGameToLog(gamesLogFN, message.channel);
      let gamesStats = t_logs.getGameLogStats(gamesLogFN);

      console.log('New game being logged in channel "' + message.channel.name + '"');
      console.log('Active Games = ' + gamesStats.active);
      console.log('Total Games logged so far = ' + gamesStats.logged);

      // No spymaster - so set them here
      message.channel.game.users.sm1 = message.author.id;
      message.channel.game.users.sm1user = client.users.cache.get(message.channel.game.users.sm1);

      // GENERATE SPY GRIDS
      message.channel.game.initialiseWordGrid();
      message.channel.game.outputSpymasterCanvasGrid();
      message.channel.game.outputTeamsCanvasGrid();

      let thisMsg = 'OK, you are the BLUE spymaster.\n\nThe first team to guess is the ' + message.channel.game.teams.currentTeam + ' TEAM\n\nHere is the grid for this game:';
      const sm1embed = new MessageEmbed()
        // Set the title of the field
        .setTitle('BLUE Spymaster')
        // Set the color of the embed
        .setColor(0x0000ff)
        // Set the main content of the embed
        .setDescription(thisMsg);
      // Send message to the AUTHOR ONLY using:
      message.author.send(sm1embed);
      // Then send the grid as an image
      message.author.send(`Spymaster grid`, message.channel.game.grid.spymasterCnv);

      //console.log('First spymaster added - grids set up!');

      // Then send a message to the channel confirming this new spymaster
      const sm1regEmbed = new MessageEmbed()
        // Set the title of the field
        .setTitle('Spymaster 1 - BLUE TEAM - ' + message.author.username + ' - registered!')
        // Set the color of the embed
        .setColor(0x0000ff)
        // Set the main content of the embed
        .setDescription('We have our first spymaster - it\'s ' + message.author.username + '! Check your private messages from Codenames Bot for your word grid and spymaster grid!');
      // Send the embed to the same channel as the message
      message.channel.send(sm1regEmbed);


    // If there's no second spymaster yet
  }else if (message.channel.game.users.sm2 === ''){

      // Check in case duplicate spymasters added
      if ( (message.channel.game.sm1 === message.author.id) & (message.channel.game.options.dupSpymasterAllowed === false)){
        let thisMsg = 'Sorry! You cannot be the spymaster for both teams! Get another player in this channel to step up to the plate!';
        // Send a message to the channel asking for another spymaster
        const sm2embed = new MessageEmbed()
          // Set the title of the field
          .setTitle('Codenames Bot Help')
          // Set the color of the embed
          .setColor(0xff0000)
          // Set the main content of the embed
          .setDescription(thisMsg);
        // Send the embed to the same channel as the message
        message.channel.send(sm2embed);

      // If not duplicate, or duplicates allowed...
      }else{

        // Set this player as spymaster 2
        message.channel.game.users.sm2 = message.author.id;
        message.channel.game.users.sm2user = client.users.cache.get(message.channel.game.users.sm2);

        //console.log('Second spymaster added - game starting!');

        let thisMsg = 'OK, you are the RED spymaster.\n\nThe first team to guess is the ' + message.channel.game.teams.currentTeam + ' TEAM\n\nHere is the grid for this game:';
        const sm2embed = new MessageEmbed()
          // Set the title of the field
          .setTitle('RED Spymaster')
          // Set the color of the embed
          .setColor(0xff0000)
          // Set the main content of the embed
          .setDescription(thisMsg);
        // Send message to the AUTHOR ONLY using:
        message.author.send(sm2embed);
        // Then send the grid as an image
        message.author.send(`Spymaster grid`, message.channel.game.grid.spymasterCnv);

        // Then message the group with the new spymaster
        const sm2regEmbed = new MessageEmbed()
          // Set the title of the field
          .setTitle('Spymaster 2 - RED TEAM - ' + message.author.username + ' - registered!')
          // Set the color of the embed
          .setColor(0xff0000)
          // Set the main content of the embed
          .setDescription('We have our second spymaster - it\'s ' + message.author.username + '! Check your private messages from Codenames Bot for your word grid and spymaster grid!');
        // Send the embed to the same channel as the message
        message.channel.send(sm2regEmbed);

        // Then send the channel the word grid!
        let groupOutput = 'The spymasters have been chosen!\n\n*The first team to make a guess should be the ' + message.channel.game.teams.currentTeam + ' team!*';

        // Set the colour of the embed
        let teamCol = 0x0000ff;
        if (message.channel.game.teams.currentTeam === 'RED'){
          teamCol = 0xff0000;
        }

        // Then send the word grid to the channel
        const groupEmbed = new MessageEmbed()
          // Set the title of the field
          .setTitle('Game Started! Word Grid Below')
          // Set the color of the embed
          .setColor(teamCol)
          // Set the main content of the embed
          .setDescription(groupOutput);
        // Send the embed to the same channel as the message
        message.channel.send(groupEmbed);
        message.channel.send(message.channel.game.grid.teamCnv);

      }

    // ELSE - Spymasters have been assigned
    }else{

      //console.log('Spymasters already assigned!');
      // Make an embed to let the channel know both spymasters have been assigned
      const assEmbed = new MessageEmbed()
        // Set the title of the field
        .setTitle('Codenames Bot Help')
        // Set the color of the embed
        .setColor(0xff0000)
        // Set the main content of the embed
        .setDescription('Both spymasters have been assigned already! You must reset to start a new game!');
      // Send the embed to the same channel as the message
      message.channel.send(assEmbed);
    }

  }

}
