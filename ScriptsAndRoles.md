
# Scripts

## Trouble Brewing
Classes and methods needed for TB:
* Washerwoman - learnRoleFromTeam
* Librarian - learnRoleFromTeam
* Investigator - learnRoleFromTeam
* Chef - learnChefNumber
* Empath - learnEvilNeighbours
* FortuneTeller - choose(2, any), learnDemonInSet
* Undertaker - learnExecuteeRole
* Monk - choose(1, notself) - applySafeFromDemon
* Ravenkeeper - onDeathAtNight(any) - choose(1, any) - learnRole
* Virgin - onNomination - applyExecute(nominee)
* Slayer - publicTrigger - choose(1, any) - applyDemonDeath
* Soldier - applySafeFromDemon
* Mayor - onGameState(alive:3, executionToday: false) - teamWins
* Butler - wait for master to vote, then prevent vote (no hard confirm?)
* Drunk
* Recluse
* Saint
* Poisoner
* Baron
* Spy
* ScarletWoman
* Imp

## Bad Moon Rising
* Grandmother
* Sailor
* Chambermaid
* Exorist
* Innkeeper
* Gambler
* Gossip
* Courtier
* Professor
* Minstrel
* Tea Lady
* Pacifist
* Fool
* Tinker
* Moonchild
* Goon
* Lunatic
* Godfather
* Devil's Advocate
* Assassin
* Mastermind
* Zombuul
* Pukka
* Shabaloth
* Po

## Sects & Violets
* Clockmaker - "you start knowing how many steps from the Demon to its nearest Minion"
* Dreamer
* Snake Charmer
* Mathematician
* Flowergirl
* Town Crier
* Oracle
* Savant
* Seamstress
* Philosopher
* Artist
* Juggler
* Sage
* Mutant
* Sweetheart
* Barber
* Klutz
* Evil Twin
* Witch
* Cerenovus
* Pit-Hag
* Fang Gu
* Vigormortis
* No Dashii
* Vortox

# Role Details (Awkward Ones)

## Butler
Leave until Master vote received, and only show vote option when master has voted
This would prevent Butler cheating and avoid hard-confirming

## Golem
When nomination used, from then on auto-choose "Not nominating" each other day?

