//https://developer.okta.com/blog/2021/07/14/socket-io-react-tutorial
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Messages from './Messages';
import MessageInput from './MessageInput';

import './App.css';

function App() {
	const [socket, setSocket] = useState(null);

	useEffect(() => {
		const newSocket = io(`http://${window.location.hostname}:3000`);
		setSocket(newSocket);
		return () => newSocket.close();
	}, [setSocket]);

	return (
		<div className="App">
		<header className="app-header">
			React Chat
		</header>
		{ socket ? (
			<div className="chat-container">
			<Messages socket={socket} />
			<MessageInput socket={socket} />
			</div>
		) : (
			<div>Not Connected</div>
		)}
		</div>
	);
}

export default App;
