'use strict';

/**
 * INFORMATION
 * The Codenames Bot which handles games of codenames via Discord text chat
 * Now split into modules for easier updating and standardisation
 * Includes better logging and clear tools for development
**/

/**
  * Node Imports
**/
//const Discord = require('discord.js');
//const { Client, MessageEmbed } = require('discord.js');
//const Canvas = require('canvas');
const http = require('http');

//USE os MODULE TO GET LOCAL IP (SOURCE: https://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js)
const { networkInterfaces } = require('os');
var qs = require('querystring');

/*
function (request, response) {
    if (request.method == 'POST') {
        var body = '';

        request.on('data', function (data) {
            body += data;

            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6)
                request.connection.destroy();
        });

        request.on('end', function () {
            var post = qs.parse(body);
            // use post['blah'], etc.
        });
    }
}*/


/**
 * Local imports
 */
//PAGES
const page_join = require('./pages/join.js');

//GET NETWORK INTERFACES TO ESTABLISH LOCAL IP
const nets = networkInterfaces();
const results = Object.create(null); // Or just '{}', an empty object

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
        const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
        if (net.family === familyV4Value && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }
            results[name].push(net.address);
        }
    }
}

var hostname = '0.0.0.0';
if(results.wlan0){
  hostname = results.wlan0;
}

//https://stackoverflow.com/questions/4295782/how-to-process-post-data-in-node-js
//Reference: https://nodejs.org/en/learn/modules/anatomy-of-an-http-transaction
const handlePostData = (req) => {

  //var body = '';
  var output = '';
  let body = [];
  req
    .on('data', chunk => {
      body.push(chunk);
    })
    .on('end', () => {
      body = Buffer.concat(body).toString();
      // at this point, `body` has the entire request body stored in it as a string
      let json = JSON.parse(body);
      console.log('POST END',json.teamName);
	  output = 'Data received';
    });
  
  /*req.on('data', function (data) {
    //APPEND TO BODY
    body += data;
    // Too much POST data, kill the connection!
    if (body.length > 1e6){
      req.connection.destroy();
      output = 'POST DATA TOO LONG!';
    }
  });*/

  /*
  var POST = {};
  req.on('data', function(data) {
    data = data.toString();
    data = data.split('&');
    for (var i = 0; i < data.length; i++) {
        var _data = data[i].split("=");
        POST[_data[0]] = _data[1];
    }
    console.log('POST',POST);
  })


  req.on('end', function () {
    console.log('POST END', POST);
    output = 'TEAM NAME RECEIVED: ' + POST.teamName;
    
    var post = qs.parse(body);
    //console.log('BODY', body);
    //console.log('POST', Object.keys(post));
    //console.log('POST DATA - Team Name:' + post['teamName']);
    //output = 'TEAM NAME RECEIVED: ' + post['teamName'];
    // use post['blah'], etc.

    var json = JSON.parse(body);
    console.log('JSON',json);
    console.log('POST DATA - Team Name:' + json.teamName);
    output = 'TEAM NAME RECEIVED: ' + json.teamName;
    
  });
  */

  return output;
}

const handleGet = (req) => {
  //IGNORE SEPARATE BROWSER REQUESTS FOR THE favicon
  if(req.url === '/favicon.ico') return false;

  //SPLIT REQUEST URL
  let [page, query] = req.url.substr(1).split('?');
  switch(page){
    case 'test':
      console.log('Outputting TEST');
      return '<h1>TEST PAGE REQUESTED!</h1>';
    break;
    case 'join':
    default:
      console.log('Outputting JOIN');
      //output = '<h1>JOIN THE BIG FAT QUIZ!</h1>';
      return page_join;
    break;
  }
}



/**
  * HTTP module setup (needed for Heroku)
**/
//const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {

  //INIT OUTPUT STRING
  var output = '';

  if (req.method === 'POST') {
    output = handlePostData(req);
  } else {
    output = handleGet(req);
  }

  if(!output) return false;
  
  //OUTPUT JUST THE STRING output VARIABLE
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(output);
  res.end();
  
});

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});


/**
  * Then import the class for the Codenames game itself
**/
const Server = require('./classes/Server.js');

server.on('message', message => {
  console.log('MESSAGE RECEIVED:',message);
});

