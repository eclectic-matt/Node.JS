module.exports = {

  TEXT_WELCOME: "The Codenames Bot (Public) is now active in this channel!\n\n**The Bot should now only send you this message once - this has been updated in the code (8th April 2020).**\n\nSend a message with the following command to learn how to use the bot:\n\n!cn help\n\nIf you are having issues, you can report them using the command:\n\n!cn issue <issue description>\n\nThis will be logged with the developer who will try to push out a fix as soon as possible!\n\nVisit my site for more information and contact details:\n\nhttps://eclectic-matt.github.io/Isolation-Bots/",

  TEXT_HELP: "**Game rules**\nTo learn the key rules for playing Codenames, use the command\n**!cn rules**\n\n**Starting the game**\nTo start a game, decide who will be the two Spymasters. They should each send a message saying\n**!cn start**\n\nThe bot will then send them the full grid for this game. The other players in the group will receive the word grid only, and should then make their guesses.\n\n**Making a guess**\nMake your guesses using the command\n**!cn guess <clue>**\n\n**Passing your turn**\nTo stop guessing, and allow the next team to take their turn, you should use the command\n**!cn pass**\n\n**Reset the game**\nIf you need to reset the game for any reason, use the command\n**!cn reset**\n\n**Set Options**\nAllows you to change options for your game session\n\n\"!cn options -d\" will allow/prevent the same player becoming both Spymasters (default: true)\n\n\"!cn options -c\" will allow players to use the \"!cn clear\" command (default: false, see below)\n\n\"!cn options -m\" will turn on/off message deleting when the game is reset (default: false)\n\n**Clear the channel**\nTo clear all the messages in this channel to clear the view for players, use the command\n**!cn clear**\n\nNote: if \"!cn options -m\" is set to true then the channel will be cleared of messages when you reset the game as well!\n\n**Reporting Issues**\nTo report an issue or give feedback to the developer, send a message saying\n**!cn issue <issue description>**\n\nThis will be logged and the developer will try to fix issues as soon as possible!\n\n**Bot Updates**\nTo find out what has changed since the last update, send a message saying:\n**!cn update**\n\n",

  TEXT_RULES_ONE: "**Game Flow**\n\nStarting with the Spymaster for the team which has been told to go first, the Spymasters should take it in turns giving a single clue to their teammates.\n\nA clue must be in the form \"Word: number\" and this should point their teammates towards a word or words in the grid, and how many words relate to this clue.\n\nSpymasters are **not allowed to give out any more information** (visual, audible or otherwise) but they can clarify the clue/number or spell out the clue for their teammates.\n\nThe clues should point their teammates towards the words in the grid of their team colour. **The first team to guess all their words will win!**\n\nIf they correctly guess the word, they can continue until they guess an incorrect word from the grid (they may guess up to 1 more word than the number from the Spymaster\'s clue)\n\nYour team **must guess at least 1 word during your turn**\n\nThe Spymasters should try not to give clues which relate to:\n\n+ **The \"Innocent\" words** - as this will end your team\'s turn\n\n+ **The other team\'s words** - as this will end your team\'s turn and put the other team one step closer to winning!\n\n+ **The \"Assasin\" word** - avoid this **at all costs as your team will lose the game** if your teammates guess the Assassin word!\n\nThe team who goes first will have 9 words in the grid to guess - the team who goes second will have 8 words.",

  TEXT_RULES_TWO: "There are a few firm rules about giving clues in Codenames:\n\n+ Your clue must be about the meaning of the words (i.e. not the letters in the words, the length of the words, or their position in the grid)\n\n+ Letters and numbers are valid clue words, as long as they refer to meanings (so you can use \"X\" to refer to Ray, but not Xylophone, or you can use \"Eight\" to refer to Ball, Figure and Octopus)\n\n* The number you say must refer to the number of words, not as a clue itself (i.e. you cannot say \"Citrus: 8\" for Lemon and Octopus)\n\n+ You cannot use foreign words as clues unless you would use the word in an English sentence (i.e. you cannot use \"Apfel\" as a clue for Apple or Berlin, but you could use \"Strudel\")\n\n+ You cannot use any form of the words visible in the grid (i.e. if Break is a word which has not yet been guessed, you cannot use \"Broken\", \"Breakage\" or \"Breakdown\")\n\n+ You also cannot say part of a compound word in the grid (i.e. if Horseshoe is in the grid and has not yet been guessed, then you cannot use \"Horse\", \"Shoe\", \"Unhorsed\" or \"Snowshoes\")\n\n+ You are allowed to use homophones, but you may wish to spell out the words to make it clear you are not giving a clue to the similar-sounding word and you are not using a different spelling of the same word (i.e. you can say \"K-N-I-G-H-T\" while Night is in the grid, but you cannot say \"T-H-E-A-T-R-E\" when Theater is there)",

  TEXT_RULES_THREE: "You can agree some flexibility with your group around other rules, but you certainly CAN USE the clue \"Land\" when England is in the grid, and you CAN USE \"Sparrow\" when Row is in the grid! They are not compound words or other forms of those words!\n\nYou can also agree with your group whether you will allow Proper Names, hyphenated-words, or abbreviations/acronyms/initialisms like \"PhD\" or \"CIA\" (so long as the words within the acronym are not words in the grid that have not been guessed)\n\n**If you are ever in doubt** then privately ask the other Spymaster whether they would be happy using your planned clue - perhaps send them a direct message when using the Codenames Bot!",

  TEXT_RESET: "Game reset!\n\nNow decide who will be the two new spymasters. They should each send a message saying \"!cn start\" and the bot will send them the full grid for this game\n\nThe players in the group will receive the word grid only, and should then make their guesses."

}