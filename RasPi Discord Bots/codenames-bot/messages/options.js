const { MessageEmbed } = require('discord.js');

module.exports = {

  optionsCommand: function(message){

    // Get the remainder of the options string
    let optionUpdate = message.content.slice(11,20);
    //console.log('Options Update ',optionUpdate);

    let optionVar = optionUpdate.slice(0,3).replace(' ','');
    //console.log('Options Var ',optionVar);

    switch (optionVar){
      case '-d':
        // Duplicate Spymasters
        message.channel.game.options.dupSpymasterAllowed = !message.channel.game.options.dupSpymasterAllowed;
        message.channel.game.embed.desc = 'Duplicate Spymasters Allowed is now set to ' + message.channel.game.options.dupSpymasterAllowed;
        break;
      case '-m':
        // Message Clearing
        message.channel.game.options.msgClearup = !message.channel.game.options.msgClearup;
        message.channel.game.embed.desc = 'Clearing Messages on Reset Game is now set to ' + message.channel.game.options.msgClearup;
        break;
      case '-c':
        // Clear Command Allowed
        message.channel.game.options.clearAllowed = !message.channel.game.options.clearAllowed;
        message.channel.game.embed.desc = 'Clear Messages Command Allowed is now set to ' + message.channel.game.options.clearAllowed;
        break;
    }

    // Send a message to the channel confirming reset
    const optionsEmbed = new MessageEmbed()
      // Set the title of the field
      .setTitle('Codenames Bot Options Changed')
      // Set the color of the embed
      .setColor(0x00ff00)
      // Set the main content of the embed
      .setDescription(message.channel.game.embed.desc);
    // Send the embed to the same channel as the message
    message.channel.send(optionsEmbed);


  }

}
