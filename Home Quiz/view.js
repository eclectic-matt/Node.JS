var http = require('http');
var fs = require('fs');
var url = require('url');
/*var ip = require('ip');
var myLocalIP = ip.address();*/

var events = require('events');
var eventEmitter = new events.EventEmitter();

var currentIP = '';
var teamList = [];
var teamNames = ['', '', '', ''];

var teams = {};
teams.IPs = [];
teams.names = ['','','',''];
teams.scores = [0,0,0,0];

var buzzerActive = false;
var buzzerTeam = false;
var currentQuestion = "In what year was the first National Grid pylon installed?";



//Create an event handler:
var myEventHandler = function () {

  //console.log('Check for team on IP ' + currentIP + ' at ' + new Date() );
  //console.log('Team list = ',teamList);
  var teamFlag = false;

  for (let i = 0; i < teams.IPs.length; i++){

    //console.log('Team ',i,teamList[i]);
    if (teams.IPs[i] == currentIP){
      // Found existing team
      //console.log('Existing team connected',i);
      //console.log('');
      // Set flag to show this IP is handled
      teamFlag = true;
    }

  }

  // If this IP was not found in the team list
  if (teamFlag == false){
    // Check the IP is not blank or admin
    if ( (currentIP !== '') && (currentIP !== '::ffff:192.168.1.227') ){
      // Add a new team with this IP
      teams.IPs[teams.IPs.length] = currentIP;
      console.log('New team added - ' + currentIP);
      //console.log(teamList);
      //console.log('');
    }
  }


}

//Assign the event handler to an event:
eventEmitter.on('newPlayer', myEventHandler);

//Fire the 'newPlayer' event:
//eventEmitter.emit('newPlayer');



http.createServer(function (req, res) {

  //console.log('REQ.URL = ' + req.url);
  var q = url.parse(req.url, true);
  var path = q.pathname;
  var search = q.search;
  //console.log('Running ' + path + ' on ' + req.url);

  // Detect a click from a team buzzer
  if (path.indexOf('click') >= 0){
    var teamBuzzer = path.substring(5, 6);
    console.log('Detected click from team ',teamBuzzer);
    if (buzzerActive == false){
      buzzerActive = true;
      lightBuzzer(teamBuzzer);
    }else{
      console.log('Buzzer Already Active');
    }

  }

  // Detect a name change being registered
  if (path.indexOf('name') >= 0){
      // register a team name change
      team = path.substring(5,6);

      newname = decodeURIComponent(search.substring(2, search.length));
      team.names[team - 1] = newname;
      console.log(search, search.length);
      console.log('Team', team, 'name changed to', newname);
  }

  // Detect when a team has scored points
  // team1scored?points=+20 OR team3scored?points=-10
  if (path.indexOf('scored') >= 0){
    team = path.substring(5,6);
    // Score added - to do!
    //score = search.substring()
  }

  // Viewing the scores etc
  if (path.indexOf('view') >= 0){

    fs.readFile('view.html', function(err, data) {

      res.writeHead(200, {'Content-Type': 'text/html'});

      currentIP = res.socket.remoteAddress;
      var output = `

      <!DOCTYPE html>
      <html>

        <head>
          <link rel='stylesheet' href='https://www.w3schools.com/w3css/4/w3.css' />
          <meta name='viewport' content='width=device-width, initial-scale=1'>
          <link rel='stylesheet' href='https://use.fontawesome.com/releases/v5.5.0/css/all.css' integrity='sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU' crossorigin='anonymous'>

          <meta http-equiv='refresh' content='0.5'>

          <style>
            * {
              text-align: center;
              font: sans-serif;
            }

          </style>
        </head>

        <body onload='getView()'>

          <div class='w3-center'>
            <h1>Quiz Time!</h1>
            <textarea rows='2' cols='100' style='width=100%;'>
              ` + currentQuestion + `
            </textarea>
          </div>

          <br>

          <div class='w3-row-padding w3-xlarge'>
      `;

      for (let i = 0; i < teams.IPs.length; i++){

        let teamNum = i + 1;
        output += `
            <! -- TEAM ` + teamNum + ` -->
            <div class='w3-col s3'>
            <div class='w3-card-8 w3-grey w3-border w3-padding-large'>
              `;

          if (teams.names[teamNum - 1] == ''){
            output += `<h2>Team ` + teamNum + `</h2>`;
          }else{
            output += `<h2>` + teams.names[teamNum - 1] + `</h2>`;
          }

        output += `
            <b>` + teams.scores[teamNum - 1] + `</b>
            <div>
              <button id='light` + teamNum + `on' class='`;

            if (buzzerTeam == teamNum){
              output += `w3-yellow `;
            }else{
              output += `w3-black `;
            }

            output += `w3-circle w3-center' style='width: 3em; height: 3em;'>
                <span style='color: white; padding: 1em 0;'>
                  <i class='far fa-lightbulb'></i>
                </span>
              </button>
            </div>
          </div>
          </div>
        `;
      }

      output += `
          <!-- END TEAMS DIV -->
          </div>

          <script>

            window.addEventListener('hashchange', getView, false);

            function getView(){
              hash = location.hash;

              // Member of a team
              if (hash.indexOf('teamBuzz') >= 0){

                var teamBuzzer = hash.substring(hash.indexOf('teamBuzz') + 8 , hash.length - 1);
                document.getElementById('light' + teamBuzzer + 'on').style.classList.add(w3-yellow);

              }
            }

          </script>

        </body>

      </html>

      `;

      res.write(output);
      //res.write(data);
      res.end();

    });

  } else if (path.indexOf('admin') >= 0) {

    fs.readFile('admin.html', function(err, data) {

      res.writeHead(200, {'Content-Type': 'text/html'});

      currentIP = res.socket.remoteAddress;

      res.write(data);
      res.end();

    });

  } else {

      fs.readFile('team.html', function(err, data) {

        res.writeHead(200, {'Content-Type': 'text/html'});

        eventEmitter.emit('newPlayer');
        currentIP = res.socket.remoteAddress;
        //teamNum = teamList.length;
        var teamNum = null;
        for (let i = 0; i < teams.IPs.length; i++){
            if (teams.IPs[i] === currentIP){
              teamNum = i + 1;
            }
        }
        if (teamNum === null){
          teamNum = teams.IPs.length + 1;
        }

        var output = `

        <!DOCTYPE html>
        <html>

          <head>
            <link rel='stylesheet' href='https://www.w3schools.com/w3css/4/w3.css' />
            <meta name='viewport' content='width=device-width, initial-scale=1'>
            <link rel='stylesheet' href='https://use.fontawesome.com/releases/v5.5.0/css/all.css' integrity='sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU' crossorigin='anonymous'>

            <style>
              * {
                text-align: center;
                font: sans-serif;
              }

            </style>
          </head>

          <body>

            <div class='w3-center'>
              <a href='http://192.168.1.227:8080'><h1>Quiz Time!</h1></a>
              <div style='width=80%;'>
                ` + currentQuestion + `
              </div>
            </div>

            <br>

            <div class='w3-row-padding w3-xlarge'>
        `;


          output += `
              <! -- TEAM ` + teamNum + ` -->
              <div class='w3-card-8 w3-xxlarge'>
                `;

              if (teams.names[teamNum - 1] !== ''){
                output += `<input class='w3-input' value='` + teams.names[teamNum - 1] + `' type='text' />`;
              }else{
                output += `<input class='w3-input' onfocusout='changeName(` + teamNum + `, this.value)' value='Team ` + teamNum + `' type='text' />`;
              }

              output += `
                <b>` + teams.scores[teamNum - 1] + `</b>
                <div>
                  <button onmousedown='buttonClick(` + teamNum + `)'  class='w3-black w3-circle w3-center' style='width: 5em; height: 5em;'>
                    <span style='color: white; padding: 1em 0;'>
                      <i class='far fa-lightbulb'></i>
                    </span>
                  </button>
                </div>
              </div>


            <!-- END TEAMS DIV -->
            </div>


                <script>

                  function buttonClick(team){
                    //location.hash = 'team' + team + 'click';
                    location.assign('team' + team + 'click');
                  }

                  function changeName(team, name){
                    location.assign('team' + team + 'name?=' + name);
                  }


                </script>


          </body>

        </html>

        `;

        res.write(output);
        //res.write(data);
        res.end();

      });

  }


  //var qdata = q.query;
  //console.log(qdata.team);

  /*if (buzzerActive == false){
    buzzerActive = true;
    console.log(qdata.team);
    //lightBuzzer(qdata.team);
  }*/



}).listen(8080);

function lightBuzzer(team){
  buzzerTeam = team;
  console.log('Light for team ',team);
}
