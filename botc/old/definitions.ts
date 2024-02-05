//All players are either good or evil
type Alignment = "good" | "evil";

//Alive, dead, or alive but registering as dead
type Alive = "alive" | "dead" | "undead";

type Team = "townsfolk" | "outsider" | "minion" | "demon" | "traveller" | "storyteller";

//Each Night>trigger=night, First Night>trigger=night&day=1, EachNight*>trigger=night&day!=1 
type Trigger = "night" | "day" | "nominated" | "nominate" | "executed" | "dead" | "detected" | "chosen";

//How players are detected, by role, alignment, team, alive, if they woke tonight (Chambermaid), chose another player (choices array | false), malfunctioned ability (Mathematician) 
type DetectType = "role" | "alignment" | "team" | "alive" | "wokeTonight" | "chose" | "malfunctioned";

//Determines player choice options - any single player (alive/dead/self), notSelf=single but not self (Monk), alive=any alive player (Dreamer), mult2 = choose 2 players, mult3 = choose 3 players, playerChar = a player + a character (Cerenovus, Pit Hag)
type ChoiceType = "any" | "notSelf" | "alive" | "mult2" | "mult3" | "playerChar";

//A player is a name and a flag for bot (auto acting)
type Player = {
    name?: string,
    bot?: boolean
}
/**
 * StoryTeller knows:
 * day: What day it is
 * players: The array of players
 * setup: prepare the game (and run night one)
 * night: process the current night
 */
interface StoryTeller 
{
    day: number,
    players: Array<Player>,
    setup: (count: number, names?: Array<string>) => boolean,
    night: () => boolean
}

/**
 * Character has:
 * role - obj
 * alignment - good|evil
 * team - townsfolk etc
 * player - the owning Player
 * alive - alive|dead|undead
 * drunk - whether drunkening applies (good droison)
 * poisoned - whether poisoning applies (evil poison)
 * act: generic act method triggered in various ways
 * detect: how to respond to being detected
 * nominate:
 * nominated:
 * executed:
 * killed: 
 */
interface Character 
{
    role: string,
    alignment: Alignment,
    team: Team,
    player: Player,
    alive: Alive,
    drunk: boolean,
    poisoned: boolean,
    act: (trigger: Trigger, st: StoryTeller) => boolean,
    detect: (type: DetectType) => any,
    executed: () => boolean,
    nominated: (nominator: Character) => boolean,
    nominate: (nominee: Character) => boolean,
    killed: (killer: Character) => boolean
}
