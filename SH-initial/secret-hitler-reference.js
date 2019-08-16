/*

  Secret Hitler
  Node server to allow players to join via phone/laptop
  And play a collective game of Secret Hitler

*/

/*

  Views/elements required:

    "LOGIN" allows players to add their name and join the game
      Name Box
      Join Game Button
    @END - First player clicks "Start Game"

    "SHOW ROLE" is a view shown at the game start
      Role Box (liberal, fascist, Hitler)
      Other Players Box (If Fascist & If Hitler when players < 6)
    @END - All players ready

    "NOMINATE"
      Nominate as Chancellor Dropdown
      Nominate Button
    @END - President Nominates

    "GOVERNMENT VOTE"
      Show Players/Roles Box (President: Jim, Chancellor: Fred)
      JA Button
      NEIN Button
      Submit Vote Button
    @END - All players voted

    "SELECT POLICIES"
      Policy Boxes (3 for president, 2 for chancellor)
      Confirm Policy Button
    @END - policies selected by president and then chancellor

  Admin Views/elements:

    "MAIN VIEW"
      Game Board - with policies and progress
      Highlight Popup

    "VOTES VIEW"
      Each Player - with role, "ready" button, and vote result
      Vote Result Popup

*/

/*

  Sockets reference

    Original name               New name

  // User socket events ( user ____ )
  // Received as socket.on('user added')
    - new user                  user added
    - nominate chancellor       user nominate     *** Found in index.js
    - start game                user startGame
    - player vote               user vote
    - player ready              user ready
    - disconnect                disconnect        *** BUILT-IN

  // Server socket events ( server ____ )
  // Emitted as sockets.emit('server shareUsers')
    - get users                 server shareUsers
    - player roles              server shareRoles
    - vote received             server voteReceived
    - government elected        server govElected
    - government fails          server govRejected
    - government vote           server shareNomination
    - round begin               server roundStart

*/



/*

  GAME RULES

  Rule PDF: https://cdn.vapid.site/sites/a67e0c72-4902-4365-a899-3386df73c2c4/assets/Secret_Hitler_Rules-023bc755617986cb2276a3b6920e43e0.pdf

  Game Print PDF: https://secrethitler.com/assets/Secret_Hitler_Print_and_Play.pdf

  Policy Cards
    6 Liberal
    11 Fascist

  Players
    5:  3L, 1F, 1H
    6:  4L, 1F, 1H
    7:  4L, 2F, 1H
    8:  5L, 2F, 1H
    9:  5L, 3F, 1H
    10: 6L, 3F, 1H

    Games 5 - 6: Hitler knows who the fascists are
    Games 7 - 10: Hitler DOES NOT know who fascists are
    
*/


// To get an API you can use
// https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=
// https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=192.168.0.88:1932
