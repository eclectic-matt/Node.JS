module.exports = {

  // Generic - get user object from mention
  // Can then process with get user.id or user.username
  getUserFromMention: function(client, mention) {
  	if (!mention) return false;

  	if (mention.startsWith('<@') && mention.endsWith('>')) {
  		mention = mention.slice(2, -1);

  		if (mention.startsWith('!')) {
  			mention = mention.slice(1);
  		}

  		return client.users.cache.get(mention);
  	}
  }

};
