/*

  Secret Hitler
  Node server to allow players to join via phone/laptop
  And play a collective game of Secret Hitler

*/

var nodePort = 1932;

var http = require('http');
var fs = require('fs');
var url = require('url');

var events = require('events');
var eventEmitter = new events.EventEmitter();

var currentIP = '';
var players =  {};
players.IPs = [];
players.names = [];
players.secretRoles = [];
players.governmentRole = [];

var checkNewPlayer = function() {

  var playerFlag = false;
  var playerCount = players.IPs.length;

  for (let i = 0; i < playerCount; i++){

    if (players.IPs[i] === currentIP){

      playerFlag = true;

    }

  }

  if (playerFlag === true){

    if ( (currentIP !== '') && (currentIP !== '::ffff:192.168.1.227') ){

      players.IPs[playerCount] = currentIP;
      console.log('New team added - ' + currentIP);

    }

  }

}

eventEmitter.on('newPlayer', checkNewPlayer);

http.createServer(function (req, res){

  var q = url.parse(req.url, true);
  var path = q.pathname;
  var search = q.search;

  if (path.indexOf('admin') >= 0){

    displayView('admin', res);

  }else if (path.indexOf('showRole') >= 0){

    displayView('showRole', res);

  }else {

    // Use npm install ip
    // https://github.com/indutny/node-ip
    var ip = require('ip');
    console.log ( ip.address() );

    //displayView('login', res);
    var selectedView = 'admin';

    var selectedFileName = './views/' + selectedView + '.html';

    fs.readFile(selectedFileName, function(err, data){

        res.writeHead(200, {'Content-Type': 'text/html'});

        console.log(typeOf(data));
        res.write(data);

        res.end();

    });

  }

}).listen(nodePort);


function displayView(selectedView, res){

  var selectedFileName = './views/' + selectedView + '.html';

  fs.readFile(selectedFileName, function(err, data){

      res.writeHead(200, {'Content-Type': 'text/html'});

      res.write(data);

      res.end();

  });

}
