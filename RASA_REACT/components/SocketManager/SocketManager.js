import io from 'socket.io-client';

// Socket responsible for connecting to RASA (This server is running on port 5005)
const rasaServerSocket = io('http://172.31.157.12:5005');

// Socket responsible for connecting to the Python Server (This server is running on port 5006)
const pythonServerSocket = io('http://172.31.157.12:5006');

// Function to connnect server sockets
const connectSockets = () => {
    // RASA
    rasaServerSocket.connect();

    // PYTHON
    pythonServerSocket.connect();
}

// Function to disconnect the server sockets
const disconnectSockets = () => {
    // RASA
    rasaServerSocket.disconnect();

    // PYTHON
    pythonServerSocket.disconnect();
}

// Function for reconnecting sockets in case of unexpected disconnects
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