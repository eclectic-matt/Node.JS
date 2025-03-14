/**
 * PROVIDES A STRING MAPPING BETWEEN ROLE NAMES AND THE CHARACTER CLASSES
 * @usage let roleObj = new CharacterMap[roleNameString]();
 **/
//===============
//TROUBLE BREWING
//===============
// - TOWNSFOLK
import { Washerwoman } from './Washerwoman.js';
import { Librarian } from './Librarian.js';
import { Investigator } from './Investigator.js';
import { Chef } from './Chef.js';
import { Empath } from './Empath.js';
import { Slayer } from './Slayer.js';
import { Soldier } from './Soldier.js';
import { Mayor } from './Mayor.js';
import { Ravenkeeper } from './Ravenkeeper.js';
import { Monk } from './Monk.js';
import { FortuneTeller } from './FortuneTeller.js';
import { Virgin } from './Virgin.js';
import { Undertaker } from './Undertaker.js';
// - OUTSIDER
import { Saint } from './Saint.js';
import { Butler } from './Butler.js';
import { Recluse } from './Recluse.js';
import { Drunk } from './Drunk.js';
// - MINION
import { Spy } from './Spy.js';
import { Poisoner } from './Poisoner.js';
import { Baron } from './Baron.js';
import { ScarletWoman } from './ScarletWoman.js';
// - DEMON
import { Imp } from './Imp.js';

//See: https://stackoverflow.com/a/37508176
//EXPORT MAPPING OBJECT
export const CharacterMap = {
    Washerwoman: Washerwoman,
    Librarian: Librarian,
    Investigator: Investigator,
    Chef: Chef,
    Empath: Empath,
    Slayer: Slayer,
    Soldier: Soldier,
    Mayor: Mayor,
    Ravenkeeper: Ravenkeeper,
    Monk: Monk,
    FortuneTeller: FortuneTeller,
    Virgin: Virgin,
    Undertaker: Undertaker,
    Saint: Saint,
    Butler: Butler,
    Recluse: Recluse,
    Drunk: Drunk,
    Spy: Spy,
    Poisoner: Poisoner,
    Baron: Baron,
    ScarletWoman: ScarletWoman,
    Imp: Imp
}