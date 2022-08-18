import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import socketIO from 'socket.io-client';

const socket = socketIO.connect('http://localhost:3000');
console.log('REACT Client available at http://localhost:3000');

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
