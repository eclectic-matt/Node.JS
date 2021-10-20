

module.exports = {

  voteCommand: function(message, client){

    // message will be in the format
    // vote 103048912012129 ja
    // vote ja (103048912012129)
    let split = message.content.split(/ +/);
    // Editing for multi-word JA or NEIN
    let splitLen = split.length;
    let thisChannel = split[splitLen - 1].replace('(','').replace(')','');
    let thisVote = '';
    for (let i = 1; i < splitLen - 1; i++){
      thisVote += split[i] + ' ';
    }
    thisVote = thisVote.trim();
    console.log(splitLen, thisChannel, thisVote);

    client.channels.fetch(thisChannel)
      .then(channel => channel.game.processVote(message.author.id, thisVote, client))
      .catch(console.error);

  }


}
