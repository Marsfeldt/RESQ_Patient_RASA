import io from 'socket.io-client';

// Socket responsible for connecting to RASA (This server is running on port 5005)
const rasaServerSocket = io('https://1d98-2a09-5e41-853-a30-58c5-9981-899e-c730.ngrok-free.app');

// Socket responsible for connecting to the Python Server (This server is running on port 5006)
const pythonServerSocket = io('https://0151-2a09-5e41-853-a30-58c5-9981-899e-c730.ngrok-free.app');

// Function to connect server sockets
const connectSockets = () => {
    // RASA
    if (!rasaServerSocket.connected) {
        rasaServerSocket.connect();
        console.log('Connected to RASA Server Socket');
    }

    // PYTHON
    if (!pythonServerSocket.connected) {
        pythonServerSocket.connect();
        console.log('Connected to Python Server Socket');
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

// Function for reconnecting sockets in case of unexpected disconnects
const reconnectSockets = () => {
    // RASA
    if (!rasaServerSocket.connected) {
        rasaServerSocket.connect();
        console.log('Reconnected to RASA Server Socket');
    }

    // PYTHON
    if (!pythonServerSocket.connected) {
        pythonServerSocket.connect();
        console.log('Reconnected to Python Server Socket');
    }
}

export { rasaServerSocket, pythonServerSocket, connectSockets, disconnectSockets, reconnectSockets };
