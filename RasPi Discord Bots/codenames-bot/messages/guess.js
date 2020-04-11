const c_words = require('../constants/wordsGrids.js');
const c_canvas = require('../constants/canvasVars.js');
const t_logs = require('../../core-tools/coreLogTools.js');
const t_std = require('../../core-tools/coreStandardTools.js');
const { MessageEmbed } = require('discord.js');
const gamesLogFN = '../codenames-bot/logs/gamesLog.json';


module.exports = {

  guessCommand: function(message){

    // If a guess was made before a game is running
    if (message.channel.game.users.sm1 === '' || message.channel.game.users.sm2 === ''){
      // No game running!
      message.channel.send('NO GAME RUNNING!\n\nRegister your spymasters using "!cn start" and then try again!');
      return;
    }
    //Split string to get guess
    let guessWord = message.content.slice(10,20);
    //guessWord = guessWord.replace(' ','');
    let foundIndex = -1;
    if (guessWord === c_words.BLUE_GUESS || guessWord === c_words.RED_GUESS || guessWord === c_words.INNOCENT_GUESS || guessWord === c_words.ASSASSIN_GUESS){
      // You can't just guess a single letter!
    }else{
      guessWord = t_std.toTitleCase(guessWord);
      //Loop through wordArr to check match
      let elCount = c_canvas.GRID_COLS * c_canvas.GRID_ROWS;
      //console.log('Checking for "' + guessWord + '"');
      for (let i = 0; i < elCount; i++){
        let thisWord = message.channel.game.grid.currentWords[i];
        //console.log('Check against "' + thisWord + '"');
        if (thisWord === guessWord){
          // WORD FOUND!
          //console.log('Match');
          foundIndex = i;
          break;
        }
      }
    }

    // If the guess word was found in the word grid
    if (foundIndex !== -1){

        // Increment the guesses
        message.channel.game.teams.teamGuesses++;
        // Calculate the row and column it was found in
        let foundRow = Math.floor(foundIndex / c_canvas.GRID_ROWS);
        let foundCol = foundIndex % c_canvas.GRID_COLS;
        // Get the team this word relates to (blue/red/assassin/innocent)
        let thisTeam = c_words.SPY_GRIDS[message.channel.game.grid.gridTemplate][foundRow + 1][foundCol];
        // Prepare the message embed
        message.channel.game.embed.title = '';
        message.channel.game.embed.col = 0x00ff00;
        message.channel.game.embed.desc = '';

        /*
          This bit gets messy. It basically checks what team this guess related to
          This should be re-written for clarity as it's just ugly at the moment
          It will take the appropriate action (changing team, showing game over)
          Depending on if the guess was correct or incorrect etc
        */
        if (thisTeam === c_words.ASSASSIN_GUESS){

          //botStats.gamesActive--;
          t_logs.addGameToLog(gamesLogFN, message.channel, true);
          let gamesStats = t_logs.getGameLogStats(gamesLogFN);

          console.log(t_std.getDateStamp(),'Game Ended in Channel - "' + message.channel.name + '"');
          console.log('Games Active Now = ' + gamesStats.active);

          // GAME OVER
          //console.log('Updating word grid at ', foundIndex,' to "a"');
          message.channel.game.updateWordGrid(foundIndex, c_words.ASSASSIN_GUESS);
          //spymasterCnv = outputSpymasterCanvasGrid();
          message.channel.game.outputSpymasterCanvasGrid();
          message.channel.game.users.sm1user.send(message.channel.game.grid.spymasterCnv);
          // Send just the new word grid to sm2
          message.channel.game.users.sm2user.send(message.channel.game.grid.spymasterCnv);
          // Send a break to space it out
          //sm2user.send('\n\n \n\n');
          message.channel.game.embed.col = 0xff0000;
          let winTeam = 'RED';
          if (message.channel.game.teams.currentTeam === 'RED'){
            message.channel.game.embed.col = 0x0000ff;
            winTeam = 'BLUE';
          }
          message.channel.game.embed.title = 'GAME OVER - ASSASSIN GUESSED - ' + winTeam + ' TEAM WINS!';
          message.channel.game.embed.desc = 'Your guessed word - ' + guessWord + ' - was the assassin and you have lost the game!\n\n' + winTeam + ' TEAM WINS!\n\nUse "!cn start" to start a new game!\n\n';
          const guessEmbed = new MessageEmbed()
            // Set the title of the field
            .setTitle(message.channel.game.embed.title)
            // Set the color of the embed
            .setColor(message.channel.game.embed.col)
            // Set the main content of the embed
            .setDescription(message.channel.game.embed.desc);
          // Send the embed to the same channel as the message
          message.channel.send(guessEmbed);
          // Just send the whole spymaster grid to the channel!
          message.channel.send(message.channel.game.grid.spymasterCnv);
          //message.channel.send(teamCnv);
          //resetGame();
          message.channel.game.teams.gameOverFlag = true;

        }else if (thisTeam === c_words.INNOCENT_GUESS){

          // INNOCENT
          message.channel.game.updateWordGrid(foundIndex, c_words.INNOCENT_GUESS);
          //spymasterCnv = outputSpymasterCanvasGrid();
          message.channel.game.outputSpymasterCanvasGrid();
          //teamCnv = outputTeamsCanvasGrid();
          message.channel.game.outputTeamsCanvasGrid();
          //console.log('Innocent guessed - sending new grids now');
          message.channel.game.users.sm1user.send(message.channel.game.grid.spymasterCnv);
          // Send just the new word grid to sm2
          message.channel.game.users.sm2user.send(message.channel.game.grid.spymasterCnv);
          message.channel.game.embed.title = 'INNOCENT GUESSED - ' + message.channel.game.teams.currentTeam + ' TEAM TURN ENDS!';
          message.channel.game.changeTeam();
          message.channel.game.embed.col = 0x0000ff;
          if (message.channel.game.teams.currentTeam === 'RED'){
            message.channel.game.embed.col = 0xff0000;
          }
          message.channel.game.embed.desc = 'Your guessed word - ' + guessWord + ' - was an innocent and your turn is now over!\n\nIt is now the ' + message.channel.game.teams.currentTeam + ' TEAM turn!\n\n';
          // Now send the results of this guess to the channel
          const guessEmbed = new MessageEmbed()
            // Set the title of the field
            .setTitle(message.channel.game.embed.title)
            // Set the color of the embed
            .setColor(message.channel.game.embed.col)
            // Set the main content of the embed
            .setDescription(message.channel.game.embed.desc);
          // Send the embed to the same channel as the message
          message.channel.send(guessEmbed);
          message.channel.send(message.channel.game.grid.teamCnv);

        }else if (thisTeam === c_words.RED_GUESS){

          message.channel.game.teams.redToFind--;
          message.channel.game.updateWordGrid(foundIndex, c_words.RED_GUESS);
          //spymasterCnv = outputSpymasterCanvasGrid();
          message.channel.game.outputSpymasterCanvasGrid();
          //teamCnv = outputTeamsCanvasGrid();
          message.channel.game.outputTeamsCanvasGrid();
          message.channel.game.users.sm1user.send(message.channel.game.grid.spymasterCnv);
          // Send just the new word grid to sm2
          message.channel.game.users.sm2user.send(message.channel.game.grid.spymasterCnv);

          // This word belonged to the red team, so check if RED are guessing...
          if (message.channel.game.teams.currentTeam === 'RED'){

            // CORRECT

            if (message.channel.game.teams.redToFind === 0){

              t_logs.addGameToLog(gamesLogFN, message.channel, true);
              let gamesStats = t_logs.getGameLogStats(gamesLogFN);

              console.log(t_std.getDateStamp(),'Game Ended in Channel - "' + message.channel.name + '"');
              console.log('Games Active Now = ' + gamesStats.active);

              // GAME OVER!
              const guessEmbed = new MessageEmbed()
                // Set the title of the field
                .setTitle('GAME OVER - RED TEAM WINS')
                // Set the color of the embed
                .setColor(0xff0000)
                // Set the main content of the embed
                .setDescription('The RED TEAM has won the game!\n\nStart a new game using "!cn reset".');
              // Send the embed to the same channel as the message
              message.channel.send(guessEmbed);
              message.channel.send(message.channel.game.grid.spymasterCnv);
              //resetGame();
              message.channel.game.teams.gameOverFlag = true;

            }else {

              message.channel.game.embed.col = 0xff0000;
              message.channel.game.embed.title = 'CORRECT - ' + message.channel.game.teams.currentTeam + ' TEAM CAN CONTINUE!';
              message.channel.game.embed.desc = 'Your guessed word - ' + guessWord + ' - was correct! You may make one more guess!\n\nYou still have ' + message.channel.game.teams.redToFind + ' words to guess!\n\n';
              // Now send the results of this guess to the channel
              const guessEmbed = new MessageEmbed()
                // Set the title of the field
                .setTitle(message.channel.game.embed.title)
                // Set the color of the embed
                .setColor(message.channel.game.embed.col)
                // Set the main content of the embed
                .setDescription(message.channel.game.embed.desc);
              // Send the embed to the same channel as the message
              message.channel.send(guessEmbed);
              message.channel.send(message.channel.game.grid.teamCnv);

            }

          }else{
            // INCORRECT

            if (message.channel.game.teams.redToFind === 0){

              t_logs.addGameToLog(gamesLogFN, message.channel, true);
              let gamesStats = t_logs.getGameLogStats(gamesLogFN);

              console.log(t_std.getDateStamp(),'Game Ended in Channel - "' + message.channel.name + '"');
              console.log('Games Active Now = ' + gamesStats.active);

              const guessEmbed = new MessageEmbed()
                // Set the title of the field
                .setTitle('GAME OVER - RED TEAM WINS')
                // Set the color of the embed
                .setColor(0xff0000)
                // Set the main content of the embed
                .setDescription('The RED TEAM has won the game!\n\nStart a new game using "!cn start".');
              // Send the embed to the same channel as the message
              message.channel.send(guessEmbed);
              message.channel.send(message.channel.game.grid.spymasterCnv);
              //resetGame();
              message.channel.game.teams.gameOverFlag = true;

            }else {

              message.channel.game.embed.col = 0xff0000;
              message.channel.game.embed.title = 'INCORRECT - ' + message.channel.game.teams.currentTeam + ' TEAM TURN ENDS!';
              message.channel.game.changeTeam();
              message.channel.game.embed.desc = 'Your guessed word - ' + guessWord + ' - belonged to the other team!\n\nThey now have ' + message.channel.game.teams.redToFind + ' words to guess!\n\nIt is now the ' + message.channel.game.teams.currentTeam + ' TEAM turn!\n\n';
              // Now send the results of this guess to the channel
              const guessEmbed = new MessageEmbed()
                // Set the title of the field
                .setTitle(message.channel.game.embed.title)
                // Set the color of the embed
                .setColor(message.channel.game.embed.col)
                // Set the main content of the embed
                .setDescription(message.channel.game.embed.desc);
              // Send the embed to the same channel as the message
              message.channel.send(guessEmbed);
              message.channel.send(message.channel.game.grid.teamCnv);

            }

          }

        }else if (thisTeam === c_words.BLUE_GUESS){

          message.channel.game.teams.blueToFind--;
          message.channel.game.updateWordGrid(foundIndex, c_words.BLUE_GUESS);
          //spymasterCnv = outputSpymasterCanvasGrid();
          message.channel.game.outputSpymasterCanvasGrid();
          //teamCnv = outputTeamsCanvasGrid();
          message.channel.game.outputTeamsCanvasGrid();
          message.channel.game.users.sm1user.send(message.channel.game.grid.spymasterCnv);
          // Send just the new word grid to sm2
          message.channel.game.users.sm2user.send(message.channel.game.grid.spymasterCnv);


          if (message.channel.game.teams.currentTeam === 'BLUE'){

            // CORRECT

            if (message.channel.game.teams.blueToFind === 0){

              t_logs.addGameToLog(gamesLogFN, message.channel, true);
              let gamesStats = t_logs.getGameLogStats(gamesLogFN);

              console.log(t_std.getDateStamp(),'Game Ended in Channel - "' + message.channel.name + '"');
              console.log('Games Active Now = ' + gamesStats.active);

              // GAME OVER!
              const guessEmbed = new MessageEmbed()
                // Set the title of the field
                .setTitle('GAME OVER - BLUE TEAM WINS')
                // Set the color of the embed
                .setColor(0x0000ff)
                // Set the main content of the embed
                .setDescription('The BLUE TEAM has won the game!\n\nStart a new game using "!cn start".');
              // Send the embed to the same channel as the message
              message.channel.send(guessEmbed);
              message.channel.send(message.channel.game.grid.spymasterCnv);
              //resetGame();
              message.channel.game.teams.gameOverFlag = true;

            }else{


              message.channel.game.embed.col = 0x0000ff;
              message.channel.game.embed.title = 'CORRECT - ' + message.channel.game.teams.currentTeam + ' TEAM CAN CONTINUE!';
              message.channel.game.embed.desc = 'Your guessed word - ' + guessWord + ' - was correct! You may make one more guess!\n\nYou still have ' + message.channel.game.teams.blueToFind + ' words to guess!\n\n';
              // Now send the results of this guess to the channel
              const guessEmbed = new MessageEmbed()
                // Set the title of the field
                .setTitle(message.channel.game.embed.title)
                // Set the color of the embed
                .setColor(message.channel.game.embed.col)
                // Set the main content of the embed
                .setDescription(message.channel.game.embed.desc);
              // Send the embed to the same channel as the message
              message.channel.send(guessEmbed);
              message.channel.send(message.channel.game.grid.teamCnv);

            }

        }else{

          // INCORRECT

          if (message.channel.game.teams.blueToFind === 0){

            t_logs.addGameToLog(gamesLogFN, message.channel, true);
            let gamesStats = t_logs.getGameLogStats(gamesLogFN);

            console.log(t_std.getDateStamp(),'Game Ended in Channel - "' + message.channel.name + '"');
            console.log('Games Active Now = ' + gamesStats.active);

            // GAME OVER!
            const guessEmbed = new MessageEmbed()
              // Set the title of the field
              .setTitle('GAME OVER - BLUE TEAM WINS')
              // Set the color of the embed
              .setColor(0x0000ff)
              // Set the main content of the embed
              .setDescription('The BLUE TEAM has won the game!\n\nStart a new game using "!cn start".');
            // Send the embed to the same channel as the message
            message.channel.send(guessEmbed);
            message.channel.send(message.channel.game.grid.spymasterCnv);
            //resetGame();
            message.channel.game.teams.gameOverFlag = true;

          }else{

              message.channel.game.embed.col = 0x0000ff;
              message.channel.game.embed.title = 'INCORRECT - ' + message.channel.game.teams.currentTeam + ' TEAM TURN ENDS!';
              message.channel.game.changeTeam();
              message.channel.game.embed.desc = 'Your guessed word - ' + guessWord + ' - belonged to the other team!\n\nThey now have ' + message.channel.game.teams.blueToFind + ' words to guess!\n\nIt is now the ' + message.channel.game.teams.currentTeam + ' TEAM turn!\n\n';
              // Now send the results of this guess to the channel
              const guessEmbed = new MessageEmbed()
                // Set the title of the field
                .setTitle(message.channel.game.embed.title)
                // Set the color of the embed
                .setColor(message.channel.game.embed.col)
                // Set the main content of the embed
                .setDescription(message.channel.game.embed.desc);
              // Send the embed to the same channel as the message
              message.channel.send(guessEmbed);
              message.channel.send(message.channel.game.grid.teamCnv);

          }

        }

      }

    }else{

      // The word was not found in the word grid!
      const notFoundEmbed = new MessageEmbed()
        // Set the title of the field
        .setTitle('Word Not Found - ' + guessWord)
        // Set the color of the embed
        .setColor(0x00ff00)
        // Set the main content of the embed
        .setDescription('This word was not found in the word grid! Try again, making sure that you capitalise the word and make sure there are no extra spaces.');
      // Send the embed to the same channel as the message
      message.channel.send(notFoundEmbed);
    }

  }

}
