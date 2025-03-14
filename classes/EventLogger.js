import { createRequire } from "module";
const require = createRequire(import.meta.url);
const fs = require('fs');
const path = require("path");
//THE PATH TO THE LOG FILE (USE "refresh" IN THE TERMINAL TO SEE CHANGES!)
const logFilePath = '/data/events_log.json';

/**
  * Helper class to log events, including system events (startup, shutdown).
  */
export const EventLogger = /** @class */ (function () {
  
  function EventLogger(){
    console.log('Starting the Event Logger...');
    this.log('system', 'Starting logging');
  }
  
  EventLogger.prototype.log = function(type, message, messageData = false){
    //GET THE LOG JSON
    let eventsLogJSON = fs.readFileSync(
      //DEFINE RELATIVE PATH
      path.resolve(process.cwd() + logFilePath), 
      //OPTIONS
      { encoding: 'utf8', flag: 'r' }, 
      //CALLBACK
      (error, data) => {
        //REPORT ERROR IF FILE READ FAILED
        if (error) {
          console.log('Error loading',error);
          throw error;
        }else{
          return data;
        }
      }
    );
    
    //TURN BACK INTO JSON OBJECT
    eventsLogJSON = JSON.parse(eventsLogJSON.toString());

    //PREPARE NEW EVENT TO LOG
    let thisEvent = {
      type: type,
      message: message,
      data: messageData,
      time: Date.now()
    };
    //PUSH TO EVENTS ARRAY
    eventsLogJSON.events.push(thisEvent);
    
    //WRITE BACK TO FILE (USE "refresh" IN THE TERMINAL TO SEE CHANGES!)
    fs.writeFileSync(path.resolve(process.cwd() + logFilePath), JSON.stringify(eventsLogJSON), (error) => {
      if (error) {
        console.log('Error while writing log:', error);
        return;
      }
      console.log('Data written successfully to disk');
    });
  }
  
    return EventLogger;
})();