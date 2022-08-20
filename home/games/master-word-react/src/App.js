import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import socketClient from 'socket.io-client';

//THIS CLIENT IS SERVED TO/RESPONDING FROM THIS PORT (DIFF TO SERVER.JS)
const SERVERPORT = 3000;
//REACTPORT = 8227

//CLIENT PORT
const hostAddress = `http://${window.location.hostname}:${SERVERPORT}`;
const socket = socketClient(hostAddress);
socket.on("connect_error", (err) => {
	console.log(err.message);
});

//NOTE: CONSOLE LOGS HERE ARE PRESENTED TO THE CLIENT!
console.log('React Client live at ' + hostAddress);

function App() {
	return (
	<BrowserRouter>
		<div>
		<Routes>
			<Route path="/" element={<HomePage socket={socket} />}></Route>
			<Route path="/game" element={<GamePage socket={socket} />}></Route>
		</Routes>
		</div>
	</BrowserRouter>
	);
}

export default App;
