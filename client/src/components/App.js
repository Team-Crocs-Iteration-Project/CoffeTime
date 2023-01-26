import React, { useState, useEffect } from 'react';
import CreateForm from './CreateForm';
import EventsList from './EventsList';
import { io } from 'socket.io-client';
import pic from '../../public/logo.png';
const socket = io();
//this socket is the socket.io connection to the backend. Look into the docs for how it works, but it is basically Node's event listener and after it opens a connection
//you listen for events with .on and send events with .emit, where the first arg is the type of event, and the second arg is the message to send (applies for front and backend)

//create App that passes down the instance of socket to its children. This stops us from opening multiple connections with the server.
function App() {
  // Here we initialize state
  // These pieces are for the socket connection
  const [socket, setSocket] = useState(null);
  const [socketError, setSocketError] = useState(null);
  // These pieces are for the login credentials
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // This piece hold the user profile after authentication
  const [user, setUser] = useState(null);

  // These are helper functions for login and logout. Could be moved to another file and imported for tidyness
  const handleLogin = () => {
    const connectSocket = io('http://127.0.0.1:3000');
    setSocket(connectSocket);
    setSocketError(null);
  };
  const handleLogout = () => {
    socket.disconnect();
    setUser(null);
  };

  // This hook runs whenever the app is rendered
  useEffect(() => {
    // The socket is established AFTER authentication. Pre-auth, skip this conditional
    if (socket) {
      socket.once('connect', () => {
        socket.emit('authenticate', {
          username,
          password,
        });
      });
      socket.on('authorized', () => {
        socket.emit('getUser');
      });
      socket.on('unauthorized', (data) => {
        setSocketError('unauthorized: ', data);
      });
      socket.on('error', (err) => {
        setSocketError(err?.message);
        console.log(err?.message);
      });
      socket.on('user', (data) => {
        setUser(data);
      });
      socket.on('disconnect', (data) => {
        console.log('disconnected');
      });
    }
    return () => {
      // While the socket is open, the emit / on cycle will keep this useEffect in progress, preventing this return
      // Once the cycle stops, as a backup, these calls run if there is a socket in state
      // Since in our app we're talking about having the cycle calls in another place, this may hit immediately right now!
      socket?.off();
      socket?.disconnect();
    };
  }, [password, socket, username]);

  // Here we begin rendering our core page elements
  return (
    <div id="App">
      <div id="header-container">
        <img id="mole-logo" src={pic}></img>
        <h1 id="title">COFFEE TIME</h1>
      </div>
      {/* If there is a user in state, render our main page, otherwise render login page */}
      {user ? (
        <div className="container">
          <div className="wrapper">
            <CreateForm socket={socket} />
            <EventsList socket={socket} />
          </div>
        </div>
      ) : (
        /* Test Code */
        <div className="login__container">
          <h1>Login</h1>
          <input
            type="text"
            value={username}
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="button" onClick={handleLogin}>
            Login
          </button>
        </div>
      )}
      {/* If there is a socket error in state, render it */}
      {socketError ? <p>{socketError}</p> : null}
    </div>
  );
}

export default App;
