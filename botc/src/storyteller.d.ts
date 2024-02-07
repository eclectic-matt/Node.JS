/**
 * Type Definition for a Character Role.
 */
type Role = {
    name: string;
    role: string;
    alignment: string;
    team: string;
    ability: {
        trigger: string;
        target: string;
        ability: string;
        special: {
            target?: string;
            ability?: string;
            team?: string;
            count?: number;
            modifiedteam?: string;
        };
    };
};
/**
 * Enum to define the "alive" statuses, as all players start alive but may become dead.
 * Note: The Zombuul is the only character that can be "undead".
 */
declare enum AliveStatus {
    Alive = 1,
    Dead = 2,
    Undead = 3
}
/**
 * Enum to define a players' vote status - starting as "yes" but changing to "Ghost" when ghost vote left and "no" once ghost vote used.
 * Note: "Once" is defined for the purposes of characters that may only vote once.
 */
declare enum VoteStatus {
    Yes = 1,
    No = 2,
    Ghost = 3,
    Once = 4
}
/**
 * Type definition for a Player, with an ID (e.g. discord ID), their name, seating position (0-index), alive status and vote status.
 */
type Player = {
    id: number;
    name: string;
    seatPosition: number;
    alive: AliveStatus;
    vote: VoteStatus;
};
/**
 * Type definition for info learned by an ability - the info is the "role/alignment" and the possible is an array of players/roles this could be.
 */
type Info = {
    possible: Array<string>;
    info: string;
};
declare class StoryTeller {
    playerCounts: ({
        townsfolk: number;
        outsider: number;
        minion: number;
        demon: number;
    } | undefined)[];
    playerCount: number;
    script: any;
    roles: Array<Role>;
    constructor(playerCount: number);
    loadScript(script: string): any;
    assignRoles(): void;
    outputRoles(): string[];
    outputCounts(playerCount: number): string;
    /**
     * Get a random name which has not already been used in the current roles array.
     * @return {string} A random name.
     */
    getRandomName(): any;
    getPlayersArray(): any[];
    getRole(team: string): any;
    learn(correctCount: number, totalCount: number, infoType: string, droisoned?: boolean): Info;
    learnTeam(team: string, count: number, selfName: string): Info;
    learnChefNumber(): number;
    shuffle(arr: Array<any>): any[];
}
declare const express: any;
declare const app: any;
declare const http: any;
declare const port: string | number;
