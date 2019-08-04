var myUsername = null;
var mySecretRole = null;
var myPublicRole = null;

$(function () {

  // On load, start socket connection
  var socket = io.connect();
  // Only show the login section
  showSection('loginSection');
  $('.startGameBtn').hide();

  // Submit Login Form
  $('#loginForm').submit(function(e){
    // Prevent form from reloading the page
    e.preventDefault();
    // Get the inputted username
    var newUsername = $('#playerNameInput').val();
    // TESTING - check this has been submitted in client window
    console.log('New user logged in: ' + newUsername);

    // Now emit a socket to propogate the new user
    socket.emit('new user', newUsername, function(data){
      if (data){
        showSection('waitingSection');
        myUsername = newUsername;
      }
    });
    return false;
  });

  /*
    SOCKET UPDATES
  */

  // Users updated
  socket.on('get users', function(data){

      // Clear the list of online users
      $('.onlineUserList').html(null);
      // Clear the output string
      var usersOutput = '';
      var userCount = data.length;

      // Loop through the user names data
      for (let i = 0; i < userCount; i++){
        // Quick hack to remove spaces in user names
        let userId = data[i].replace(/ /g, '');
        console.log(userId);
        // Append each username to the list
        usersOutput += `<li id="userLI${userId}">${data[i]}</li>`;
      }

      // Then attach the list to the online users list
      $('.onlineUserList').append(usersOutput);
      // Update the player count visible to players
      $('.playerCountSpan').html(userCount);

      console.log('Checking if this is first user ' + myUsername);
      if (myUsername === data[0]){
        console.log('First user!');
        $('.startGameBtn').show();
      }

  });

  // Roles Updated
  socket.on('player roles', function(data){

    users = data.users;
    roles = data.roles;
    mySecretRole = roles[users.indexOf(myUsername)];
    console.log('My secret role is ' + mySecretRole);
    if (mySecretRole !== 'liberal'){
      // Show the others who are fascist
      var rolesOutput = '';
      for (let i = 0; i < roles.length; i++){
        if (roles[i] !== 'liberal'){
            rolesOutput += '<li>' + users[i] + ' = Fascist</li>';
        }
      }
      $('.playerRolesList').html(rolesOutput);
    }
    $('.yourRoleSpan').html(mySecretRole.toUpperCase());
    showSection('showRoleSection');

  });

  // Round is now ready to begin
  socket.on('round begin', function(publicRoles, cards){

    // If you have been assigned the Presidency
    if (publicRoles[0] === myUsername){

      console.log('I have been assigned the presidency!');
      //showSection('selectPolicies');
      // Prepare Chancellor nomination HTML
      var chancellorOutput = '<select id="nominateSelect">';

      // Loop through the users
      for (let i = 0; i < users.length; i++){

        // If the checked user is NOT themselves, nor holding public office
        if ((users[i] !== myUsername) && (publicRoles.indexOf(users[i]) === -1)){
            // Then add this user to the nomination form
            chancellorOutput += `<option value="${users[i]}" class="nominateOption">${users[i]}</option>`;
        }
      }
      chancellorOutput += '</select>';
      $('.nominateChancellorDiv').html(chancellorOutput);
      showSection('nominateChancellorSection');
    }else{
      $('.startGameBtn').hide();
      showSection('waitingSection');
    }

  });

  // Start voting on government
  socket.on('government vote', function(roles){

    var voteOutput = `<ul>
        <li>President: ${roles[0]}</li>
        <li>Chancellor: ${roles[1]}</li>
      </ul>`;
    $('.governmentVoteDiv').html(voteOutput);
    showSection('governmentVoteSection');

  });

  // Show votes as they are received
  socket.on('vote received', function(vote, user){
    // Quick hack to remove spaces in user names
    let userId = user.replace(/ /g, '');
    // Show the actual vote for each user by modifying the list
    $('#userLI' + userId).append(' - ' + vote);
    // REMOVED - Show that the user has voted, not how
    // $('#userLI' + userId).append(' - voted');
    /*let userList = $('.onlineUserList').children();
    console.log(userList);
    for (child in userList){
      if (child.innerHTML === user){
        child.append(' - ' + vote);
        console.log(child);
      }
    }*/

  });


  /*
    CLIENT BUTTON CLICKS
  */

  $('.nominateChancellorBtn').click(function(e){
    let nomination = $('#nominateSelect').val();
    console.log(nomination + ' has been nominated');
    socket.emit('nominate chancellor', nomination);
  });

  $('.startGameBtn').click(function(e){
    socket.emit('start game');
  });

  // Voting on government - yes button
  $('.jaBtn').click(function(e){
    // Prevent form from reloading the page
    e.preventDefault();
    // TESTING - check this has been submitted in client window
    console.log('This player has voted JA');
    // Now emit a socket to indicate this player is ready
    socket.emit('player vote', 'ja', myUsername);
    //$('.playerReadyBtn').hide();
    showSection('waitingSection');
    return false;
  });

  // Voting on government - no button
  $('.neinBtn').click(function(e){
    // Prevent form from reloading the page
    e.preventDefault();
    // TESTING - check this has been submitted in client window
    console.log('This player has voted NEIN');
    // Now emit a socket to indicate this player is ready
    socket.emit('player vote', 'nein', myUsername);
    //$('.playerReadyBtn').hide();
    showSection('waitingSection');
    return false;
  });


  // Secret role viewed - ready to play
  $('.playerReadyBtn').click(function(e){
    // Prevent form from reloading the page
    e.preventDefault();
    // TESTING - check this has been submitted in client window
    console.log('This player is now ready');
    // Now emit a socket to indicate this player is ready
    socket.emit('player ready', myUsername);
    $('.playerReadyBtn').hide();
    return false;
  });

});

function nominateChancellor(user){
  console.log('Nominated ' + user + ' as Chancellor');
  socket.emit('chancellor nominated', user);
}


function showSection(showId){
  let sectionEls = document.getElementsByClassName('section');
  for (let i = 0; i < sectionEls.length; i++){
    $(sectionEls[i]).hide();
  }
  let showEl = document.getElementById(showId);
  $(showEl).show();
}
