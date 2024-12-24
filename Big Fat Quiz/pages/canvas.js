module.exports = `
  <!-- SIGNATURE PAD - SOURCE: https://github.com/szimek/signature_pad -->
	<script src="https://cdn.jsdelivr.net/npm/signature_pad@4.1.7/dist/signature_pad.umd.min.js"></script>
	<meta 
		name="viewport" 
    content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
	/>

	<title>Big Fat Quiz</title>
	<script src="./js/init.js" defer></script>
	<link rel="stylesheet" href="./style/canvas.css" type="text/css" />
</head>
<body onload="init()">
	<div id="main">
		<div id="questionWrapper">
			<div id="questionNumbers">
				<!-- FILLED IN init() BASED ON THE questionsThisRound VALUE -->
			</div>
			<br>
			<div id="canvasWrapper">
				<canvas id="canvas" width="100%" height="auto"></canvas>
			</div>
			<div id="actionBtns">
			</div>
		</div>
	</div>
</body>
</html>`;
