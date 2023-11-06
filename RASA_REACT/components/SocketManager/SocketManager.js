import io from 'socket.io-client';

// Socket responsible for connecting to RASA (This server is running on port 5005)
const rasaServerSocket = io('http://192.168.0.47:5005');

// Socket responsible for connecting to the Python Server (This server is running on port 5006)
const pythonServerSocket = io('http://192.168.0.47:5006');

// Function to connnect server sockets
const connectSockets = () => {
    rasaServerSocket.connect();
    pythonServerSocket.connect();
}

const disconnectSockets = () => {
    // RASA
    rasaServerSocket.disconnect();

    // PYTHON
    pythonServerSocket.disconnect();
}

const reconnectSockets = () => {
    if (!rasaServerSocket.connected) {
        rasaServerSocket.connect();
    }
    
    if (!pythonServerSocket.connected) {
        pythonServerSocket.connect();
    }
}

export { rasaServerSocket, pythonServerSocket, connectSockets, disconnectSockets, reconnectSockets };