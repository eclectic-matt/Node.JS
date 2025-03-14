import { createRequire } from "module";
const require = createRequire(import.meta.url);
const rolesJSON = require("../resources/roles.json");
import { titleCase } from '../utils.js';

export const RolesHelper = /** @class */ (function () {
  
  function RolesHelper(){
    console.log('Roles Helper starting up...');
  }
  
  RolesHelper.prototype.getPublicRolesList = function()
  {
    //HARD-CODING AT PRESENT, AS SOME WILL NOT WORK (e.g. Gossip)
    const publicRoles = [ 'Slayer' ];
    //OTHER PUBLIC ROLES WHICH *COULD* WORK BUT NOT YET IMPLEMENTED:
    // const publicRoles = [ 'Slayer', 'Moonchild', 'Juggler', 'Klutz', 'Damsel', 'Psychopath', 'Goblin', ]
    //OTHER PUBLIC ROLES WHICH WILL NOT WORK (without ChatGPT or similar)
    // const awkwardPublicRoles = [ 'Gossip', ]
    return publicRoles;
  }
  
  
  RolesHelper.prototype.outputRoleInfo = function(name)
  {
    //Title Case (accept "mayor", "no dashii" etc
    //name = name.toTitleCase();
    //FILTER ROLES JSON TO GET ROLE DATA (lower case both sides to help matching)
    let thisRole = rolesJSON.find( (r) => { return r.name.toLowerCase() === name.toLowerCase(); });
    //ROLE NOT FOUND?
    if(!thisRole) return 'Role Not Found!';
    //GENERATE RESPONSE (DISCORD FORMAT)
    let response = '# ' + thisRole.name + ' (' + titleCase(thisRole.team) + ")\n";
    //OUTPUT ABILITY AS BLOCK QUOTE
    response += '> **' + thisRole.ability + "**\n\n";
    //response += "\n\n----\n\n";
    
    //First night reminder?
    if(thisRole.firstNightReminder){
      response += '_First Night Reminder: "' + thisRole.firstNightReminder + '"' + "_\n\n";
    }else{
      response += '_No First Night Reminder_' + "\n\n";
    }
    //Other night reminder
    if(thisRole.otherNightReminder){
      response += '_Other Nights Reminder: "' + thisRole.otherNightReminder + '"' + "_\n\n";
    }else{
      response += '_No Other Nights Reminder_' + "\n\n";
    }
    //Reminder tokens
    if(thisRole.reminders && thisRole.reminders.length > 0){
       response += '_Reminder Tokens: ' + thisRole.reminders.join(', ') + "_\n\n";
    }else{
      response += '_No Reminder Tokens_' + "\n\n"; 
    }
    
    //OUTPUT EDITION LINK
    response += '**Edition: ';
    let editionName = 'Experimental';
    switch(thisRole.edition){
        case 'tb':
          editionName = 'Trouble Brewing';
        break;
        case 'snv':
          editionName = 'Sects & Violets';
        break;
        case 'bmr':
          editionName = 'Bad Moon Rising';
        break;
        default:
          editionName = 'Experimental';
        break;
    }
    response += '[' + editionName + '](https://wiki.bloodontheclocktower.com/' + editionName.replaceAll(' ','_').replaceAll('&','%26') + ")**\n\n";
    //response += '## _' + thisRole.ability + "_\n";
    response += '**Official Wiki: [' + thisRole.name + '](https://wiki.bloodontheclocktower.com/' + thisRole.name.toString().replace(' ','_') + ")**\n\n"; 
    return response;
  }
  
  RolesHelper.prototype.loadRolesJson = function(name)
  {
    const scriptRoles = rolesJSON.filter( (r) => { return r.edition === name; });
    //console.log('rolesJSON', scriptRoles);
    return scriptRoles;
  }
  
  RolesHelper.prototype.getRoleData = function(scriptId)
  {
     //NOTE: roles.json HAS "id" WITHOUT "_" SPACING BUT CUSTOM SCRIPT JSON USES "_" SPACING - FFS!
    return rolesJSON.find( (r) => { return r.id === scriptId.replace('_','').replace('-',''); });
  }
  
  RolesHelper.prototype.getRolesList = function() 
  {
    return rolesJSON.map( (r) => { return r.name; });
  }
  
  return RolesHelper;
})();

