/**
  * Constants for the board and cards
**/
module.exports = {

  POLICY_CARDS: ['Liberal', 'Liberal', 'Liberal', 'Liberal', 'Liberal', 'Liberal', 'Fascist', 'Fascist', 'Fascist', 'Fascist', 'Fascist', 'Fascist', 'Fascist', 'Fascist', 'Fascist', 'Fascist', 'Fascist' ],

  PLAYER_ROLES: ['Hitler', 'Fascist', 'Liberal', 'Liberal', 'Liberal', 'Liberal', 'Fascist', 'Liberal', 'Fascist', 'Liberal'],

  PLAYER_MEMBERSHIPS: ['Fascist', 'Fascist', 'Liberal', 'Liberal', 'Liberal', 'Liberal', 'Fascist', 'Liberal', 'Fascist', 'Liberal'],

  GAME_BOARD: [
    // LIBERAL
    ['', '', '', '', 'Liberal win'],
    // FASCIST
    // 5 -6 players
    ['', '', 'The President examines the top three cards', 'The President must kill a player', 'The President must kill a player. Veto power is unlocked', 'Fascist win'],
    // 7 - 8 players
    ['', 'The President investigates a player\'s identity card', 'The President picks the next Candidate for President', 'The President must kill a player', 'The President must kill a player. Veto power is unlocked', 'Fascist win'],
    // 9 - 10 players
    ['The President investigates a player\'s identity card', 'The President investigates a player\'s identity card', 'The President picks the next Candidate for President', 'The President must kill a player', 'The President must kill a player. Veto power is unlocked', 'Fascist win']
  ],

  BOARD_ACTIONS: [
    // 5 - 6 players
    ['', '', 'this.powerPresidentExamine()', 'this.powerPresidentKillStart()', 'this.powerPresidentKillStart(); this.powerVetoUnlocked();', 'this.gameOver(this.botData.fascist)'],
    // 7 - 8 players
    ['', 'this.powerInvestigateStart()', 'this.powerPickCandidateStart()', 'this.powerPresidentKillStart()', 'this.powerPresidentKillStart(); this.powerVetoUnlocked();', 'this.gameOver(this.botData.fascist)'],
    // 9 - 10 players
    ['this.powerInvestigateStart()', 'this.powerInvestigateStart()', 'this.powerPickCandidateStart()', 'this.powerPresidentKillStart()', 'this.powerPresidentKillStart(); this.powerVetoUnlocked();', 'this.gameOver(this.botData.fascist)']
  ]


}
