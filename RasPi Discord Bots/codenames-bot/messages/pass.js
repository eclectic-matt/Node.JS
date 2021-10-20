const { client, MessageEmbed } = require('discord.js');

module.exports = {

  passCommand: function(message){

    if (message.channel.game.teams.teamGuesses === 0){
      // Teams must make at least 1 guess before passing!
      message.channel.game.embed.title = 'You must make a guess!';
      message.channel.game.embed.desc = 'Your team must make at least 1 guess on your turn before passing to the other team!\n\nPlease make a guess before play passes to the other team!';
      message.channel.game.embed.col = 0x00ff00;
      //console.log('Failed pass - guess must be made!');
      // Tell the players they must guess first
      const passEmbed = new MessageEmbed()
        // Set the title of the field
        .setTitle(message.channel.game.embed.title)
        // Set the color of the embed
        .setColor(message.channel.game.embed.col)
        // Set the main content of the embed
        .setDescription(message.channel.game.embed.desc);
      // Send the embed to the same channel as the message
      message.channel.send(passEmbed);

    }else{
      // The team have passed the turn over
      // TO DO - make sure the current team have made
      // AT LEAST ONE GUESS as per the game rules
      // Swap teams
      message.channel.game.changeTeam();
      //console.log('Guesses = ' + teamGuesses + '. Play passed to the ' + currentTeam + ' team!');
      // Change the team colour for message embeds
      message.channel.game.embed.col = 0x0000ff;
      if (message.channel.game.teams.currentTeam === 'RED'){
        message.channel.game.embed.col = 0xff0000;
      }
      message.channel.game.embed.title = 'Next turn...';
      message.channel.game.embed.desc = 'The team has now changed over - the team making a guess now is ' + message.channel.game.teams.currentTeam;

      // Show the embed for the next team
      const passEmbed = new MessageEmbed()
        // Set the title of the field
        .setTitle(message.channel.game.embed.title)
        // Set the color of the embed
        .setColor(message.channel.game.embed.col)
        // Set the main content of the embed
        .setDescription(message.channel.game.embed.desc);
      // Send the embed to the same channel as the message
      message.channel.send(passEmbed);
    }


  }

}
