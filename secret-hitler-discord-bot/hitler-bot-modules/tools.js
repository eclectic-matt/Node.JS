module.exports = {

  // Function to shuffle array
  //https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
  shuffle: function(a) {
      var j, x, i;
      for (i = a.length - 1; i > 0; i--) {
          j = Math.floor(Math.random() * (i + 1));
          x = a[i];
          a[i] = a[j];
          a[j] = x;
      }
      return a;
  },

  // Generic - get user object from mention (can then get user.id or user.username)
  getUserFromMention: function(mention) {
  	if (!mention) return false;

  	if (mention.startsWith('<@') && mention.endsWith('>')) {
  		mention = mention.slice(2, -1);

  		if (mention.startsWith('!')) {
  			mention = mention.slice(1);
  		}

  		return client.users.cache.get(mention);
  	}
  },

  // Gets a timestamp (used for logging only)
  getDateStamp: function(){
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = ("0" + date_ob.getHours()).slice(-2);
    let minutes = ("0" + date_ob.getMinutes()).slice(-2);
    let seconds = date_ob.getSeconds();
    let dStr = hours + ":" + minutes + ":" + seconds + " " + date + "/" + month + "/" + year;
    return dStr;
  },

  // https://www.html5canvastutorials.com/tutorials/html5-canvas-wrap-text-tutorial/
  wrapText: function(context, text, x, y, maxWidth, lineHeight) {
    var words = text.split(' ');
    var line = '';

    for(var n = 0; n < words.length; n++) {
      var testLine = line + words[n] + ' ';
      var metrics = context.measureText(testLine);
      var testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      }
      else {
        line = testLine;
      }
    }
    context.fillText(line, x, y);
  }

};
