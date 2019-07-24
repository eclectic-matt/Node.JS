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

    "SHOW ROLE" is a view shown at the game start
      Role Box (liberal, fascist, Hitler)
      Other Players Box (If Fascist & If Hitler when players < 6)

    "NOMINATE"
      Nominate as Chancellor Dropdown
      Nominate Button

    "GOVERNMENT VOTE"
      Show Players/Roles Box (President: Jim, Chancellor: Fred)
      JA Button
      NEIN Button
      Submit Vote Button

    "SELECT POLICIES"
      Policy Boxes (3 for president, 2 for chancellor)
      Confirm Policy Button

  Admin Views/elements:

    "MAIN VIEW"
      Game Board - with policies and progress
      Highlight Popup

    "VOTES VIEW"
      Each Player - with role, "ready" button, and vote result
      Vote Result Popup

*/


// To get an API you can use
// https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=
// https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=192.168.0.88:1932
