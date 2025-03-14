Bot: 🤖
Human: 🧍

# Separation of concerns

---

## /classes/RolesHelper.js
**This handles the loading of the roles.json and gathering edition-specific roles.**

### *loadRolesJSON(editionName)*
load an edition's roles, e.g. "tb"
### *getRoleData(scriptId)*
load the role data from a script role id (as "fortune_teller")
### *getRolesList()*
all roles
### *outputRoleInfo(name)*
output the information about a specific role

---

## /classes/ScriptHelper.js
**This handles scripts data, including custom scripts, edition scripts, and night orders:**

### *outputScriptInfo(script)*
### *outputScriptOtherNightsOrder(script)*
### *outputScriptFirstNightOrder(script)*
### *outputScriptAbilities(script)*
### *loadScript(script)*
### *getScriptMetaData(name)*
### *loadCustomScript(name)*

---

## /classes/GameManager.js
**This handles initializing and storing games data (as free Glitch can sleep between requests):**

### *init(options)*
starts a game by initializing the game object and generating a unique game ID
### *getGameById(id)*
get the data for the specified game ID
### *addPlayerToGame(gameId, user)*
add a **human** player to the specified game
### *getGamesData()*
get the stored data for all games
### *store(gameData)*
store this game to the backing JSON

---

## /classes/StoryTeller-v2.js
**This handles actually running a game, processing night order, private/public messages and game conditions:**
### METHODS - TO DO 



