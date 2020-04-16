const t_logs = require('../../core-tools/coreLogTools.js');

const gamesLogFN = '../secret-hitler-bot/logs/gamesLog.json';

module.exports = {

  resetCommand: function(theGame, message){

    theGame.reset();

    t_logs.addGameToLog(gamesLogFN, theGame.channel, true);
    let gamesStats = t_logs.getGameLogStats(gamesLogFN);
    console.log('Game was reset in channel "' + theGame.channel.name + '"');
    console.log('Active Games = ' + gamesStats.active);
    console.log('Total Games logged so far = ' + gamesStats.logged);

    message.reply('The game has been reset! Use the join command to get started with a new game!');

  }

}
