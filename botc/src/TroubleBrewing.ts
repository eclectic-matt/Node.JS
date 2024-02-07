const tb = {
	name: 'Trouble Brewing',
	roles: [
	{
		role: 'Imp',
		alignment: 'evil',
		team: 'demon',
		ability: {
			trigger: 'eachnight*',
			target: 'any',
			cause: 'death',
			special: {
				target: 'self',
				ability: 'minionBecomesDemon'
			}
		}
	},
	{
		role: 'Poisoner',
		alignment: 'evil',
		team: 'minion',
		ability: {
			trigger: 'eachnight',
			target: 'any',
			cause: 'droison',
			special: undefined
		}
	},
	{
		role: 'Baron',
		alignment: 'evil',
		team: 'minion',
		ability: {
			trigger: 'setup',
			target: undefined,
			cause: '+2outsiders',
			special: {
				team: 'townsfolk',
				modifiedteam: 'outsider',
				count: 2
			}
		}
	},
	{
		role: 'Spy',
		alignment: 'evil',
		team: 'minion',
		ability: {
			trigger: 'registersFalse',
			target: undefined,
			cause: '+2outsiders',
			special: {
				team: 'townsfolk',
				modifiedteam: 'outsider',
				count: 2
			}
		}
		},
		{
			role: 'Scarlet Woman',
			alignment: 'evil',
			team: 'minion',
			ability: {
				trigger: 'execute',
				target: undefined,
				cause: '+2outsiders',
				special: {
					team: 'townsfolk',
					modifiedteam: 'outsider',
					count: 2
				}
			}
		},
		{
			role: 'Recluse',
			alignment: 'good',
			team: 'outsider',
			ability: {
				trigger: 'detect',
				target: undefined,
				cause: 'registerEvilMinionDemon',
				special: undefined
			}
		},
		{
			role: 'Drunk',
			alignment: 'good',
			team: 'outsider',
			ability: {
				trigger: 'thinks',
				target: undefined,
				cause: 'thinksTownsfolk',
				special: undefined
			}
		},
		{
			role: 'Saint',
			alignment: 'good',
			team: 'outsider',
			ability: {
				trigger: 'executed',
				target: 'self',
				cause: 'teamLoses',
				special: undefined
			}
		},
		{
			role: 'Butler',
			alignment: 'good',
			team: 'outsider',
			ability: {
				trigger: 'vote',
				target: undefined,
				cause: 'voteWithMaster',
				special: undefined
			}
		},
		{
			role: 'Washerwoman',
			alignment: 'good',
			team: 'townsfolk',
			ability: {
				trigger: 'firstnight',
				target: undefined,
				cause: 'learns',
				special: undefined
			}
		},
		{
			role: 'Slayer',
			alignment: 'good',
			team: 'townsfolk',
			ability: {
				trigger: 'public',
				target: 'any',
				cause: 'demonDies',
				special: undefined
			}
		},
		{
			role: 'Mayor',
			alignment: 'good',
			team: 'townsfolk',
			ability: {
				trigger: '3AliveNoExecution',
				target: undefined,
				cause: 'mayorTeamWins',
				special: undefined
			}
		},
		{
			role: 'Monk',
			alignment: 'good',
			team: 'townsfolk',
			ability: {
				trigger: 'eachnight*',
				target: 'anyNotSelf',
				cause: 'safeFromDemon',
				special: undefined
			}
		},
		{
			role: 'Soldier',
			alignment: 'good',
			team: 'townsfolk',
			ability: {
				trigger: 'demonAttack',
				target: undefined,
				cause: 'safeFromDemon',
				special: undefined
			}
		},
		{
			role: 'Librarian',
			alignment: 'good',
			team: 'townsfolk',
			ability: {
				trigger: 'eachnight*',
				target: 'anyNotSelf',
				cause: 'safeFromDemon',
				special: undefined
			}
		},
		{
			role: 'Investigator',
			alignment: 'good',
			team: 'townsfolk',
			ability: {
				trigger: 'eachnight*',
				target: 'anyNotSelf',
				cause: 'safeFromDemon',
				special: undefined
			}
		},
		{
			role: 'Chef',
			alignment: 'good',
			team: 'townsfolk',
			ability: {
				trigger: 'eachnight*',
				target: 'anyNotSelf',
				cause: 'safeFromDemon',
				special: undefined
			}
		},
		{
			role: "Empath",
			aligment: "good",
			team: "towmsfolk",
			ability: {
				
			}
		}
	]
}

export { tb };