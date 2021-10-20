// imports
const t_logs = require('../../core-tools/coreLogTools.js');
const channelsLogFN = '../secret-hitler-bot/logs/channelsLog.json';
const issuesLogFN = '../secret-hitler-bot/logs/issuesLog.json';
const updatesLogFN = '../secret-hitler-bot/logs/updatesLog.json';
const gamesLogFN = '../secret-hitler-bot/logs/gamesLog.json';

module.exports = {

  statsCommand: function(message, client){

    // Number of SERVERS the bot added to
    let serverCount = client.guilds.cache.size;

    //  Number of channels added
    let channelCount = t_logs.getFileDataCount(channelsLogFN, 'channelIDs');

    //  Number of games logged, games finished, time last game started
    let gameStats = t_logs.getGameLogStats(gamesLogFN);

    //  Number of issues logged
    let issuesCount = t_logs.getFileDataCount(issuesLogFN, 'issuesLog');

    let statsMsg = '**Secret Hitler Bot Statistics**\n\n**Servers Added: **' + serverCount + '\n**Channels Added: **' + channelCount + '\n**Games Started: **' + gameStats.logged + '\n**Games Finished: **' + gameStats.finished + '\n**Games Active: **' + gameStats.active + '\n**Last Game Started: **' + gameStats.lastTime + '\n**Issues Logged: **' + issuesCount;

    message.reply(statsMsg);

  }

}
