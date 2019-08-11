$(function () {

  // On load, start socket connection
  var socket = io.connect();

  showSection('boardSection');

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

    //showSection('waitingSection');

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

  socket.on('board roundStart', function(progress){

    updateTracker(progress);
    showSection('boardSection');

  });

});

function updateTracker(progress){

  // Update fascist track
  if (progress.fascist > 0){
    // The track being checked
    var fascTrackEl = $('#fascistTrack' + progress.fascist);
    // Check if this card section NO inner div (card not present)
    if (!fascTrackEl.has('div')){
      // No element present - create one
      var fascCard = document.createElement('div');
      fascCard.style.cssText = 'position: absolute; z-index: 10; color: white; background-color: red; border: 5px solid black; text-align: center;';
      var fascTitle = document.createElement('b');
      fascTitle.innerHTML = 'Fascist';
      fascCard.appendChild(fascTitle);
      fascTrackEl.appendChild(fascCard);
    }
  }

  // Update liberal track
  if (progress.liberal > 0){
    // The track being checked
    var libsTrackEl = $('#liberalTrack' + progress.liberal);
    // Check if this card section NO inner div (card not present)
    if (!libsTrackEl.has('div')){
      // No element present - create one
      var libsCard = document.createElement('div');
      libsCard.style.cssText = 'position: relative; z-index: 10; color: white; background-color: blue; border: 5px solid black; text-align: center; height: 100%;';
      var libsTitle = document.createElement('b');
      libsTitle.innerHTML = 'Liberal';
      libsCard.appendChild(libsTitle);
      libsTrackEl.appendChild(libsCard);
    }
  }

  // Update failure track
  if (progress.failure > 0){
    // The track being checked
    var progressTrackEl = $('#electFailTrack' + progress.failure);
    // Check if this card section NO inner div (card not present)
    if (!progressTrackEl.has('div')){
      // No element present - create one
      var progressCard = document.createElement('div');
      progressCard.style.cssText = 'position: relative; z-index: 10; background-color: purple; border: 1px solid black; border-radius: 50%; text-align: center; left: 25px; top:-10px; width: 80%;';
      var progressTitle = document.createElement('b');
      progressTitle.innerHTML = 'FAIL';
      progressCard.appendChild(progressTitle);
      progressTrackEl.innerHTML = progressCard;
    }
  }

}


function showSection(showId){
  let sectionEls = document.getElementsByClassName('section');
  for (let i = 0; i < sectionEls.length; i++){
    $(sectionEls[i]).hide();
  }
  let showEl = document.getElementById(showId);
  $(showEl).show();
}
