

module.exports = {

  startCommand: function(theGame, message, client){

    if (theGame.players.count === 0){
      // No players - join first!
      message.channel.send('No players! Send a message saying:\n\n' + theGame.botData.prefix + ' join\n\nThis will set up the game!');

    }else{

      if (theGame.status.gameOver === true){
        // Game has ended, so reset ready for new game!
        theGame.reset();
        if (theGame.options.msgClearup){
          message.channel.bulkDelete(100);
        }
      }

      //console.log('Starting game...');
      theGame.gameStart(client);

    }

  }

}
