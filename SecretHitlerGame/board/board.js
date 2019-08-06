$(function () {

  // On load, start socket connection
  var socket = io.connect();

  showSection('waitingSection');

  socket.on('board users', function(data){

    console.log('Receiving usernames');
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

    showSection('waitingSection');

  });

  socket.on('board init', function(address){

    // ISSUE - TRYING TO CHECK IF WORKING IN TIZEN BROWSER (Samsung TV)

    var sUsrAg = navigator.userAgent;
    console.log(sUsrAg);
    //document.getElementById('addressSpan').innerHTML = sUsrAg;

    console.log('Board details received - ' + address);
    $('#QRcodeImg').attr('src', 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + address);
    $('#addressSpan').html(address);

  });

});


function showSection(showId){
  let sectionEls = document.getElementsByClassName('section');
  for (let i = 0; i < sectionEls.length; i++){
    $(sectionEls[i]).hide();
  }
  let showEl = document.getElementById(showId);
  $(showEl).show();
}
