<?php 

//DEFAULTS
$game = 1;
//NEED TO UPDATE THIS !
$round = 0;

//GET CANVAS MANAGER CLASS 
require_once('./class/CanvasManager.php');
$cnvMgr = new \classes\CanvasManager();

//CHECK FOR A TEAM UPDATE 
if(isset($_POST['canvasBase64'])){
	//echo 'CANVAS SUBMITTED: ' . $_POST['canvasBase64'] . '<br>';
	//echo 'FOR QUESTION: ' . $_POST['question'] . '<br>';
	//echo 'FOR TEAM: ' . $_POST['teamName'] . '<br>';

	//GET CURRENT ROUND (FROM GAME?)

	$storeResult = $cnvMgr->storeTeamCanvas($_POST['teamId'], $round, $_POST['question'], $_POST['canvasBase64']);
	if($storeResult){
		echo '<div style="background-color: yellow; color: black;">Canvas Saved!</div><br>';
	}
}

if(isset($_POST['teamName'])){
	$teamName = $_POST['teamName'];
	//TRY TO ADD TEAM 
	//echo '<h1>TEAM: ' . $_POST['teamName'] . '</h1>';
	$mysqli = new mysqli("localhost","root","","big_fat_quiz");
	//$game = 1;
	if($teams = $mysqli->query('SELECT * FROM team WHERE name = "' . $teamName . '"')){
		//TEAM FOUND?
		if($teams->num_rows === 1){
			//EXISTING TEAM
			$teamData = mysqli_fetch_assoc($teams);
			//echo 'EXISTING TEAM FOUND WITH ID: ' . $teamData['id'];
		}else{
			//ADD TEAM 
			$ip = $_SERVER['REMOTE_ADDR'];
			$mysqli->query('INSERT INTO team (name, ip, game) VALUES ("' . $teamName . '","' . $ip . '",' . $game . ')');
			//RELOAD TEAM 
			if($teams = $mysqli->query('SELECT * FROM team WHERE name = "' . $teamName . '"')){
				if($teams->num_rows === 1){
					//NEWLY-ADDED TEAM
					$teamData = mysqli_fetch_assoc($teams);
					//echo 'NEW TEAM ADDED WITH ID: ' . $teamData['id'];
				}
			}
		}
	}

	echo '<form action="/Big%20Fat%20Quiz/php/join.php" method="POST" enctype="application/x-www-form-urlencoded">';
	echo '<input type="hidden" name="teamId" value="' . $teamData['id'] . '" />';
	echo '<input type="hidden" name="teamName" value="' . $teamName . '" />';
	echo '<input type="hidden" name="canvasBase64" id="canvasBase64" value="" />';
	echo '<input type="hidden" name="question" id="question" value="0" />';
	//REQUIRE THE CANVAS PAGE
	require('./canvas.php');
	echo '</form>';
}else{
	//NO TEAM NAME IN POST DATA
	echo '<h1>Join page</h1>
	<form name="joinForm" method="POST" action="/Big%20Fat%20Quiz/php/join.php" enctype="application/x-www-form-urlencoded">
		<label for="teamName">Team Name: </label><input type="text" id="teamName" name="teamName"></input>
		<button type="submit">Join Game</button>
	</form>';
}