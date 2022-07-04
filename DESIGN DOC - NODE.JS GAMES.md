=DESIGN DOC - NODE.JS GAMES=

==KEY TERMS:==

===Devices===

; PHOD
: Player, Host, Operator, Display

; PLAYER
: A device showing the player view of the game, simply button interactions

; HOST
: The host computer, administering the game

; OPERATOR
: The device showing private output and operating the game, sending commands to start/stop etc

; DISPLAY
: A device showing public output for players and operators to see game progress

===Stages===

; init
: Initialises source code, starts port listening

; setup
: The operator requests the particular game ready for inviting

; invite
: Players (and displays) are invited to join

; start
: The game begins (custom flow and stages follow)