# Overall Idea

* A way to quickly generate tabletop games from source files, including all logic for games
* Based on a few simple concepts which are applicable to most purposes but can be adapted
* Allows for digital testing, including automated playtesting to generate data
* Very simple interface options, can be extended and modified as required by the user

# Tech

* The engine is built on Javascript to be deployable on a variety of platforms such as Node.JS, web hosting, mobile web app
* Flexible engine allows you to deploy fully-realised versions of your games using our scripting tools and templates
* Entire game code, including the rules, resources and descriptions, can be bundled into a JSON file for sharing (including hosting to provide frequent updates)
* Allows the realisation of anything from simple card game to rich tabletop wargaming experiences with a few simple rules





# Concepts

## Game
A game is the base class to generate a game. The game will need to load in any assets, code and styling from source.
The game is based around a simple HOOK which executes in stages until the TRIGGERS for the next stage is met.
The setup for the game involves describing PLAYERS, LOCATIONS, OBJECTS, ACTIONS, CONDITIONS and EFFECTS.

## Players
Each player will require set up with the available resources, limits, scoring, rules etc which apply to them.

For the most basic player, use the following setup:

*playerMatt = new Player();*

This will create a basic player who will participate in the game and can either win or lose.

To keep track of scores and money, you will need to initialise them in the setup stage:

*playerMatt = new Player(); playerMatt.score = 0; playerMatt.money = 0;*

OR 

*playerMatt = new Player({'score': 0, 'money':0});*

**IMPORTANT: Trying to access or modify properties during the game which are not specified (e.g. playerMatt.points) will result in an execution error. You should always define all properties in the game during setup, to ensure no errors in how the logic is applied.**

## Locations
Locations are an abstract concept, but can relate to specific places within a game space.
Locations have several default properties, such as a limit (min/max) on contained objects.
In general, these are used as "collections" or "spots" where objects can be played, for example:
* The general supply of money (the "bank")
* The draw pile for one player (cards)
* The discard pile for all players (cards)
* A market of available tiles or cards
* A space on the game board (cards, workers, units, tiles, tokens)

You may choose to display or hide these locations, depending on the stage or game overall. 
By default, they are shown in a grid showing the name of the location and a summary of its contents.

To setup a location:
*locationDrawPile = new Location();*

To specify the limits for what a location can contain:
*locationDrawPile = new Location(); locationDrawPile.limit.min = 1; locationDrawPile.limit.max = 4;*
OR
*locationDrawPile = new Location({'limit': {'min': 1, 'max': 4}});*

## Objects
An object can be anything within a game, for example:
* A card in a deck-builder (type: TYPE_CARD, flat - information printed on front/back)
* A die which is rolled to determine movement (type: TYPE_DIE, sides - information printed on each side)
* A unit or building in an area-control game (type: TYPE_UNIT, tall - no information printed)
* A token or tile in an abstract game (type: TYPE_TILE, near-flat - information printed on front/back)

Without modification, the game engine will use default shapes and styles for every object - you can modify this as required.
Each object has several properties by default, most inherited from the type selected:


## The Hook
The hook is automatically generated for each game (based on user settings or by default) but can be extended as required.
Each stage within the hook will execute, however the execution could do nothing if the next stage trigger is met.

* SETUP (0)
	* INIT_STAGE (-1)
	* GENERAL_SETUP (0.1)
	* PLAYER_SETUP (0.2)
* START (1)
	* START_STAGE (1.1)
* MAIN (2)
	* MAIN_STAGE (2.1)
* END (3)
	* END_STAGE (3.1)
* RESULTS (4)
	* RESULTS_STAGE (4.1)
* FINISH (5)
	* FINISH_STAGE (5.0)

The way the stages are ordered allows you to insert new stages at any point in the game execution.
This can be specified with a value, e.g. 0.15 to go before PLAYER_SETUP, or by linking in a previous trigger.
The only exceptions to this are:

* INIT_STAGE (-1) which denotes restarting the game from scratch
* FINISH_STAGE (5.0) which denotes finishing the game and stopping execution

## Triggers
Triggers should be setup for each event which can result in the change of a stage. 
These will be checked at the end of each action to determine 