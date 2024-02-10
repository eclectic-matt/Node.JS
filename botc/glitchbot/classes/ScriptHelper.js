import { scripts } from '../resources/scripts.js';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
//const rolesJSON = require("../resources/roles.json");
import { RolesHelper } from './RolesHelper.js';

//GET A ROLES HELPER OBJECT
let RH = new RolesHelper();

export var ScriptHelper = /** @class */ (function () {
  
  function ScriptHelper(){
    console.log('Script Helper starting up...');  
  }
  
  //SAO ORDER.JSON - TO IMPLEMENT!
  // Values are of format: X.X.XXXX.XXX which corresponds to: Team Section, SAO Section, Last Non-white Pixel, Ability Length in Characters
  //window.fetch('/sao-sorter/order.json').then(x => x.json()).then(x => {for (let id in x) {order[id] = x[id].replaceAll('.', '')}});
  // filecontent.sort((x, y) => {
  //  return order[x] - order[y]
  // });
  ScriptHelper.prototype.outputScriptInfo = function(script) 
  {
    const maxLength = 2000;
    let response = '# ' + script + "\n";
    //LOAD SCRIPT METADATA
    let scriptInfo = this.getScriptMetaData(script);
    //OUTPUT AUTHOR
    response += '_by ' + scriptInfo.author + "_\n";
    //OUTPUT SCRIPT LINK
    response += 'Source: [' + script + '](' + scriptInfo.source + ")\n";
    //GET SCRIPT ROLES DATA
    let scriptData = this.loadScript(script);
    //DEFINE TEAMS
    let teams = [ 'townsfolk', 'outsider', 'minion', 'demon' ];
    //ITERATE TEAMS TO OUTPUT
    for(let teamIndex = 0; teamIndex < teams.length; teamIndex++){
      let teamName = teams[teamIndex];
      let team = scriptData.filter( (r) => { return r.team == teamName; });
      response += '## ' + teamName.toUpperCase() + "\n";
      for(let i = 0; i < team.length; i++){
        response += "* [" + team[i].name + "](https://wiki.bloodontheclocktower.com/" + team[i].name.toString().replace(' ','_') + ")\n";
        //GOING OVER DISCORD MESSAGE LENGTH LIMITS!!!
        //response += "* " + team[i].name + " - _" + team[i].ability + "_\n";
        //response += "* [" + team[i].name + "](https://wiki.bloodontheclocktower.com/" + team[i].name.toString().replace(' ','_') + ") - _" + team[i].ability + "_\n";
      }
    }
    //CHECK DISCORD MESSAGE SIZE LIMIT
    if(response.length > maxLength){
      console.log('response length too long',response.length);//TOO BLOODY LONG!
      //TRIM TO 2000 CHARS
      response = response.substring(0, maxLength - 4) + '...';
    }
    //RETURN GENERATED STRING
    return response;
  }
  
  ScriptHelper.prototype.loadScript = function (script) 
  {
    switch (script) {
      //CORE EDITIONS
      case "Trouble Brewing":
        //TROUBLE BREWING
        return RH.loadRolesJson("tb");
      break;
      case 'Bad Moon Rising':
        //BAD MOON RISING
        return RH.loadRolesJson("bmr");
      break;
      case 'Sects & Violets':
        //SECTS & VIOLETS
        return RH.loadRolesJson("snv");
      break;
      //CUSTOM SCRIPTS
      default:
        //LOAD A CUSTOM SCRIPT
        //console.log('loadingCustom', script, this.loadCustomScript(script));
        return this.loadCustomScript(script);
      break;
    }
  }
  
  ScriptHelper.prototype.getScriptMetaData = function(name)
  {
    let scriptInfo = scripts.find( (script) => { return script.name === name; });
    return scriptInfo;
  }
  
  ScriptHelper.prototype.loadCustomScript = function(name)
  {
    let scriptInfo = this.getScriptMetaData(name);
    //console.log('loadingCustomScript', name, scriptInfo );
    const customScript = require(scriptInfo.roles);
    let scriptMeta = customScript.shift();
    //console.log('customData', customScript.join(',') );
    let scriptRoles = [];
    for(let i = 0; i < customScript.length; i++){
      //GET THIS ROLE'S DATA
      let thisRole = RH.getRoleData(customScript[i]);
      if(thisRole !== undefined){
        scriptRoles.push(thisRole);
      }
    }
    //console.log('CustomLoad', name, scriptRoles.map( (r) => { return r.name; }).join(', ') );
    return scriptRoles;
  }
  
  //RETURN THE CLASS
  return ScriptHelper;
})();