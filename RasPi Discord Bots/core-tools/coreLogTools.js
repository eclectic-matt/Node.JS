const t_std = require('./coreStandardTools.js');
const fs = require('fs');

module.exports = {

  /*
    checkChannelInLog(chanLogFN, thisChannelID)
      @chanLogFN        the path/name for the channel log file
      @thisChannelID    the channel ID being checked
      !return           a true/false if found

    Loops through the channel log file (in channelIDs)
    Checks each entry in that array for thisChannelID
  */
  checkChannelInLog: function(chanLogFN, thisChannelID){

    var channelFoundFlag = false;

    try {
      let data = fs.readFileSync(chanLogFN, 'utf8');
      let json = JSON.parse(data);
      //console.log('checkChannelInLog JSON=',json);
      // Loop through to check for match
      for (let i = 0; i < json.channelIDs.length; i++){

        // If there is match, then return the flag
        if (thisChannelID === json.channelIDs[i]){

          channelFoundFlag = true;
          break;

        }
      }
      return channelFoundFlag;

    } catch (err) {
      console.error(err)
    }

  },

  /*
    addChannelToLog(chanLogFN, thisChannelID)
      @chanLogFN        the path/name for the channel log file
      @thisChannelID    the channel ID being added

    Adds thisChannelID to the log file (in channelIDs array)
  */
  addChannelToLog: function(chanLogFN, thisChannelID){

    //console.log('Starting addChannelToLog...');
    try {

      let data = fs.readFileSync(chanLogFN, 'utf8');
      let orig = JSON.parse(data);
      orig.channelIDs.push(thisChannelID);
      //console.log('New channel pushed',thisChannelID);
      let newJSON = JSON.stringify(orig);
      fs.writeFile(chanLogFN, newJSON, function(err){
        if (err) throw err;
        console.log('Channel',thisChannelID,'was added to the channelsLog');
      });

    } catch (err) {
      console.error(err)
    }


  },

  /*
    getFileDataCount(fileName, arrayName)
      @fileName         the path/name for the file being counted
      @arrayName        the name of the array in the file to count
      !return           the count of elements in the array for that file

    Counts the number of elements in an array in a log file
  */
  getFileDataCount: function(fileName, arrayName){

    let count = 0;

    try {

      let data = fs.readFileSync(fileName, 'utf8');
      let jsonData = JSON.parse(data);
      count = jsonData[arrayName].length;
      return count;

    } catch (err){
      console.error(err)
    }

  },

  /*
    addIssueToLog(issueLogFN, channelName, issueText)
      @issueLogFN       the path/name for the issue log file
      @channel          the channel object where this was logged
      @issueText        the text describing the issue

    Adds the reported issue to the log file
  */
  addIssueToLog: function(issueLogFN, channel, issueText){

    let thisLog = {};
    thisLog.time = t_std.getDateStamp();
    thisLog.channelName = channel.name;
    thisLog.channelID = channel.id;
    thisLog.description = encodeURI(issueText);

    try {

      fs.readFile(issueLogFN, function(err, data){
        let orig = JSON.parse(data);
        orig.issuesLog.push(thisLog);
        let newJSON = JSON.stringify(orig);
        fs.writeFile(issueLogFN, newJSON, function(err){
          if (err) throw err;
          console.log('This issue was added to the issuesLog');
        });
      });

    } catch (err) {
      console.error(err)
    }

  },


  /*
    addGameToLog(gamesLogFN, channelName)
      @gamesLogFN       the path/name for the games log file
      @channel          the channel object where this was logged
      @finishedFlag (o) a flag if this is logging a finished game

    Adds the reported issue to the log file
  */
  addGameToLog: function(gamesLogFN, channel, finishedFlag){

    finishedFlag = (typeof finishedFlag === 'undefined') ? false : finishedFlag;

    let thisLog = {};
    thisLog.time = t_std.getDateStamp();
    thisLog.channelName = channel.name;
    thisLog.channelID = channel.ID;
    thisLog.finished = finishedFlag;

    try {

      fs.readFile(gamesLogFN, function(err, data){
        let orig = JSON.parse(data);
        orig.gamesLog.push(thisLog);
        let newJSON = JSON.stringify(orig);
        fs.writeFile(gamesLogFN, newJSON, function(err){
          if (err) throw err;
          console.log('This game was added to the gamesLog');
        });
      });

    } catch (err) {
      console.error(err)
    }

  },

  /*
    getGameLogStats(gamesLogFN)
      @gamesLogFN       the path/name for the games log
      !return           the stats for "active" and logged games

    Counts the number of games logged and those without a finishedFlag log
  */
  getGameLogStats: function(gamesLogFN){
    let stats = {};
    stats.active = 0;
    stats.logged = 0;
    stats.finished = 0;
    stats.lastTime = '';

    try {
      let data = fs.readFileSync(gamesLogFN, 'utf8');
      let json = JSON.parse(data);
      // Loop through to check for match
      for (let i = 0; i < json.gamesLog.length; i++){
        let thisLog = json.gamesLog[i];
        if (thisLog.finished === false){
          stats.logged++;
          // The time the last game was started
          stats.lastTime = thisLog.time;
        }else{
          stats.finished++;
        }
      }
      stats.active = stats.logged - stats.finished;
      return stats;

    } catch (err) {
      console.error(err)
    }

  },

  /*
    getLatestUpdate(updatesLogFN)
      @updatesLogFN     the path/name for the updates log
      !return           an object holding the date and text for the latest update

    Gets an object holding the date and text for the latest update
  */
  getLatestUpdate: function(updatesLogFN){

    let updateInfo = {};

    try {

      let data = fs.readFileSync(updatesLogFN, 'utf8');
      let json = JSON.parse(data);
      let lastUpdate = json.updates[json.updates.length - 1];

      updateInfo.date = lastUpdate.date;
      updateInfo.desc = lastUpdate.description;
      return updateInfo;

    } catch (err) {
      console.error(err)
    }

  }

};
