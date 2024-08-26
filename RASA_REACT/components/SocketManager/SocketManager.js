import io from 'socket.io-client';

// Socket responsible for connecting to RASA (This server is running on port 5005)
const rasaServerSocket = io('http://10.0.2.2:5005', {
    transports: ['websocket'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});


// Socket responsible for connecting to the Python Server (This server is running on port 5006)
const pythonServerSocket = io('http://10.0.2.2:5006', {
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

// Event listeners for debugging
rasaServerSocket.on('connect', () => {
    console.log('Connected to RASA Server Socket:', rasaServerSocket.id);
});

rasaServerSocket.on('connect_error', (error) => {
    console.error('Connection to RASA Server failed:', error);
});

rasaServerSocket.on('disconnect', (reason) => {
    console.warn('Disconnected from RASA Server Socket:', reason);
});

// Function to connect server sockets
const connectSockets = () => {
    // RASA
    if (!rasaServerSocket.connected) {
        rasaServerSocket.connect();
    }

    // PYTHON
    if (!pythonServerSocket.connected) {
        pythonServerSocket.connect();
    }
}

// Function to disconnect the server sockets
const disconnectSockets = () => {
    // RASA
    if (rasaServerSocket && rasaServerSocket.connected) {
        rasaServerSocket.disconnect();
        console.log('Disconnected from RASA Server Socket');
    }

    // PYTHON
    if (pythonServerSocket && pythonServerSocket.connected) {
        pythonServerSocket.disconnect();
        console.log('Disconnected from Python Server Socket');
    }
}

// Function to reconnect server sockets
const reconnectSockets = () => {
    // RASA
    if (!rasaServerSocket.connected) {
        rasaServerSocket.connect();
    }

    // PYTHON
    if (!pythonServerSocket.connected) {
        pythonServerSocket.connect();
    }
}

export { rasaServerSocket, pythonServerSocket, connectSockets, disconnectSockets, reconnectSockets };
