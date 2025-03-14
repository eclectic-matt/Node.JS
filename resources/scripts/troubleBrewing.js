export const tbScript = {
  name: "Trouble Brewing",
  roles: [

    //============
    // DEMON(S)
    //============
    {
      role: "Imp",
      alignment: "evil",
      team: "demon",
      ability: {
        trigger: "eachnight*",
        target: "any",
        cause: "death",
        special: {
          target: "self",
          ability: "minionBecomesDemon",
        },
      },
    },

    //============
    // MINIONS
    //============
    {
      role: "Poisoner",
      alignment: "evil",
      team: "minion",
      ability: {
        trigger: "eachnight",
        target: "any",
        cause: "droison",
        special: undefined,
      },
    },

    {
      role: "Baron",
      alignment: "evil",
      team: "minion",
      ability: {
        trigger: "setup",
        target: undefined,
        cause: "+2outsiders",
        special: {
          team: "townsfolk",
          modifiedteam: "outsider",
          count: 2,
        },
      },
    },

    {
      role: "Spy",
      alignment: "evil",
      team: "minion",
      ability: {
        trigger: "registersFalse",
        target: undefined,
        cause: "+2outsiders",
        special: {
          team: "townsfolk",
          modifiedteam: "outsider",
          count: 2,
        },
      },
    },

    {
      role: "Scarlet Woman",
      alignment: "evil",
      team: "minion",
      ability: {
        trigger: "execute",
        target: undefined,
        cause: "+2outsiders",
        special: {
          team: "townsfolk",
          modifiedteam: "outsider",
          count: 2,
        },
      },
    },

    //============
    // OUTSIDERS
    //============
    {
      role: "Recluse",
      alignment: "good",
      team: "outsider",
      ability: {
        trigger: "detect",
        target: undefined,
        cause: "registerEvilMinionDemon",
        special: undefined,
      },
    },

    {
      role: "Drunk",
      alignment: "good",
      team: "outsider",
      ability: {
        trigger: "thinks",
        target: undefined,
        cause: "thinksTownsfolk",
        special: undefined,
      },
    },

    {
      role: "Saint",
      alignment: "good",
      team: "outsider",
      ability: {
        trigger: "executed",
        target: "self",
        cause: "teamLoses",
        special: undefined,
      },
    },

    {
      role: "Butler",
      alignment: "good",
      team: "outsider",
      ability: {
        trigger: "vote",
        target: undefined,
        cause: "voteWithMaster",
        special: undefined,
      },
    },

    //============
    // TOWNSFOLK
    //============
    {
      role: "Washerwoman",
      alignment: "good",
      team: "townsfolk",
      ability: {
        trigger: "firstnight",
        target: undefined,
        cause: "learns",
        special: undefined,
      },
    },

    {
      role: "Librarian",
      alignment: "good",
      team: "townsfolk",
      ability: {
        trigger: "eachnight*",
        target: "anyNotSelf",
        cause: "safeFromDemon",
        special: undefined,
      },
    },

    {
      role: "Investigator",
      alignment: "good",
      team: "townsfolk",
      ability: {
        trigger: "eachnight*",
        target: "anyNotSelf",
        cause: "safeFromDemon",
        special: undefined,
      },
    },

    {
      role: "Chef",
      alignment: "good",
      team: "townsfolk",
      ability: {
        trigger: "eachnight*",
        target: "anyNotSelf",
        cause: "safeFromDemon",
        special: undefined,
      },
    },

    {
      role: "Empath",
      aligment: "good",
      team: "townsfolk",
      ability: {},
    },

    {
      role: "Fortune Teller",
      aligment: "good",
      team: "townsfolk",
      ability: {},
    },

    {
      role: "Undertaker",
      aligment: "good",
      team: "townsfolk",
      ability: {},
    },

    {
      role: "Monk",
      alignment: "good",
      team: "townsfolk",
      ability: {
        trigger: "eachnight*",
        target: "anyNotSelf",
        cause: "safeFromDemon",
        special: undefined,
      },
    },

    {
      role: "Ravenkeeper",
      alignment: "good",
      team: "townsfolk",
      ability: {
        trigger: "eachnight*",
        target: "anyNotSelf",
        cause: "safeFromDemon",
        special: undefined,
      },
    },

    {
      role: "Virgin",
      alignment: "good",
      team: "townsfolk",
      ability: {
        trigger: "eachnight*",
        target: "anyNotSelf",
        cause: "safeFromDemon",
        special: undefined,
      },
    },


    {
      role: "Slayer",
      alignment: "good",
      team: "townsfolk",
      ability: {
        trigger: "public",
        target: "any",
        cause: "demonDies",
        special: undefined,
      },
    },

    {
      role: "Soldier",
      alignment: "good",
      team: "townsfolk",
      ability: {
        trigger: "demonAttack",
        target: undefined,
        cause: "safeFromDemon",
        special: undefined,
      },
    },

    {
      role: "Mayor",
      alignment: "good",
      team: "townsfolk",
      ability: {
        trigger: "3AliveNoExecution",
        target: undefined,
        cause: "mayorTeamWins",
        special: undefined,
      },
    },

  ],  //end roles
};