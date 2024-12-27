<?php

namespace classes;

use mysqli;

/*
OLD JSON BASED VERSION
class CanvasManager {

	private $canvasPath = './data/canvases.json';
	private $canvases = [];

	public function __construct(){
		$this->refreshCanvasData();
	}

	private function refreshCanvasData(){
		$opts = [
			'http' => [
				'header' => "Cache-Control: no-cache\r\n" .
					"Pragma: no-cache\r\n" . 
					"Accept-language: en\r\n" .
					"Cookie: foo=bar\r\n"
			]
		];
		$context = stream_context_create($opts);
		//$cnvStr = file_get_contents($this->canvasPath);
		$cnvStr = file_get_contents($this->canvasPath, false, $context);
		$this->canvases = json_decode($cnvStr);
	}

	public function getTeamCanvases($team){
		$this->refreshCanvasData();
		//PHP 8.0+
		//$teamCanvases = array_find($this->canvases, function($value){
		//	return $value->team === $team;
		//});
		for($i = 0; $i < count($this->canvases); $i++){
			if($this->canvases[$i]->team === $team){
				return $this->canvases[$i]->canvases;
			}
		}
		return false;
	}

	public function getTeamCanvas($team, $round, $question){
		$teamCnv = $this->getTeamCanvases($team);
		if(!$teamCnv) return false;
		for($i = 0; $i < count($teamCnv); $i++){
			if( ($teamCnv[$i]->round === $round) && ($teamCnv[$i]->question === $question) ){
				return $teamCnv[$i];
			}
		}
		return false;
	}

	public function storeTeamCanvas($team, $round, $question, $data){
		$this->refreshCanvasData();
		//ITERATE STORED CANVASES TO FIND RELEVANT DATA
		for($i = 0; $i < count($this->canvases); $i++){
			if($this->canvases[$i]->team === $team){
				for($c = 0; $c < count($this->canvases[$i]->canvases); $c++){
					$thisCnv = $this->canvases[$i]->canvases[$c];
					if( ($thisCnv->round === $round) && ($thisCnv->question === $question) ){
						$this->canvases[$i]->canvases[$c]->data = $data;
					}
				}
			}
		}
		$this->storeCanvasData($this->canvases);
	}

	public function storeCanvasData($data){
		$cnvStr = json_encode($data);
		//false ON FAILURE, count($bytesWritten) ON SUCCESS
		return file_put_contents($this->canvasPath, $cnvStr);
	}

}
*/

/**
 * New mysqli based version
 */
class CanvasManager {

	private $mysql = null;

	public function __construct()
	{
		//NO ACTION
		$this->mysql = new \mysqli("localhost","root","","big_fat_quiz");
		//CHECK CONNECTION
		if($this->mysql->connect_errno){
			echo "Failed to connect to MySQL: " . $this->mysql->connect_error;
			exit();
		}
	}

	public function __destruct()
	{
		$this->mysql->close();
	}

	public function getTeamCanvases($team)
	{
		$canvases = $this->mysql->query('SELECT * FROM canvas WHERE team = ' . $team['id']);
		if($canvases->num_rows > 0){
			return $canvases;
		}else{
			return false;
		}
	}

	public function getTeamCanvas($team, $round, $question)
	{
		$teamCnv = $this->getTeamCanvases($team);
		if(!$teamCnv) return false;
		foreach($teamCnv as $canvas){
			if( ($canvas['round'] === $round) and ($canvas['question'] === $question) ){
				return $canvas;
			}
		}
		return false;
	}

	public function storeTeamCanvas($teamId, $round, $question, $data)
	{
		//INSERT OR UPDATE
		if($existingCanvas = $this->mysql->query('SELECT * FROM canvas WHERE team = ' . $teamId . ' AND round = ' . $round . ' AND question = ' . $question)){
			if($existingCanvas->num_rows === 1){
				//UPDATE EXISTING CANVAS
				$canvasData = mysqli_fetch_assoc($existingCanvas);
				return $this->updateCanvas($canvasData['id'], $data);
			}else{
				//INSERT NEW CANVAS
				return $this->insertCanvas($teamId, $round, $question, $data);
			}
		}
	}

	private function updateCanvas($id, $data)
	{
		return $this->mysql->query('UPDATE canvas SET data = "' . $data . '" WHERE id = ' . $id);
	}

	private function insertCanvas($teamId, $round, $question, $data)
	{
		/*echo $teamId . '<br>';
		echo $round . '<br>';
		echo $question . '<br>';
		echo $data . '<br>';*/
		return $this->mysql->query('INSERT INTO canvas 
			(`team`, `round`, `question`, `data`) 
			VALUES (' . $teamId . ',' . $round . ',' . $question . ',"' . $data . '");'
		);
	}

	//===================
	// TABLE: canvas
	//===================
	



	//===================
	// TABLE: game
	//===================
	public function getGame($gameId)
	{
		if($game = $this->mysql->query('SELECT * FROM game WHERE id = ' . $gameId)){
			return mysqli_fetch_assoc($game);
		}else{
			return false;
		}
	}

	public function updateGameRound($gameId, $round)
	{
		return $this->mysql->query('UPDATE game SET round = ' . $round . ' WHERE id = ' . $gameId);
	}

	public function updateGameQuestion($gameId, $question)
	{
		return $this->mysql->query('UPDATE game SET question = ' . $question . ' WHERE id = ' . $gameId);
	}


	//===================
	// TABLE: score
	//===================
	public function getScore($game, $teamId, $round=false)
	{
		$scores = $this->mysql->query('SELECT * FROM score WHERE game = ' . $game . ' AND team = ' . $teamId);
		if($scores->num_rows > 0){
			$teamScore = 0;
			foreach($scores as $score){
				if($round){
					//A ROUND WAS SPECIFIED
					if($round === $score['round']){
						$teamScore += $score['points'];
					}
				}else{
					//NO ROUND SPECIFIED, ADD ONTO SCORE
					$teamScore += $score['points'];
				}
			}
		}else{
			$teamScore = 0;
		}
		return $teamScore;
	}

	public function saveScore($game, $teamId, $round, $question, $points=1)
	{
		//CHECK FOR EXISTING SCORE
		$scores = $this->mysql->query('SELECT * FROM score WHERE game = ' . $game . ' AND team = ' . $teamId . ' AND round = ' . $round . ' AND question = ' . $question);
		if($scores->num_rows > 0){
			//UPDATE EXISTING ROW 
			$scoreRow = mysqli_fetch_assoc($scores);
			$scoreId = $scoreRow['id'];
			return $this->mysql->query('UPDATE score SET points = ' . $points . ' WHERE id = ' . $scoreId);
		}else{
			//NO EXISTING ROW
			return $this->mysql->query('INSERT INTO score (
				game, 
				team, 
				round, 
				question, 
				points) 
			VALUES (' . 
				$game . ',' .
				$teamId . ',' . 
				$round . ',' . 
				$question . ',' . 
				$points . 
			')');
		}
	}



	//===================
	// TABLE: team
	//===================

}