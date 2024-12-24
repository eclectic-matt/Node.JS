module.exports = `
<h1>Join page</h1>

<form name="joinForm" method="POST" enctype="application/x-www-form-urlencoded">

<!--form name="joinForm" method="POST" enctype="multipart/form-data"-->
  <label for="teamName">Team Name: </label><input type="text" id="teamName" name="teamName"></input>
  <button type="submit">Join Game</button>
</form>
`;
