import io from 'socket.io-client';

// Function to add logs with timestamps
const logWithTimestamp = (message, ...args) => {
    console.log(`[${new Date().toISOString()}] ${message}`, ...args);
};

// Socket to connect to the RASA server (Server running on port 5005)
const rasaServerSocket = io('http://10.0.2.2:5005', {
    transports: ['websocket'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

// Socket to connect to the Node.js server (Server running on port 5006)
const nodeServerSocket = io('http://10.0.2.2:5006', {
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

// Event listeners for debugging the RASA server connection
rasaServerSocket.on('connect', () => {
    logWithTimestamp('Connected to RASA Server Socket:', rasaServerSocket.id);
});

rasaServerSocket.on('connect_error', (error) => {
    logWithTimestamp('Connection to RASA Server failed:', error.message, error);
});

rasaServerSocket.on('disconnect', (reason) => {
    logWithTimestamp('Disconnected from RASA Server Socket:', reason);
});

rasaServerSocket.on('reconnect_attempt', (attempt) => {
    logWithTimestamp(`Reconnection attempt to RASA Server: Attempt #${attempt}`);
});

rasaServerSocket.on('reconnect_failed', () => {
    logWithTimestamp('Reconnection to RASA Server failed after multiple attempts.');
});

// Event listeners for debugging the Node.js server connection
nodeServerSocket.on('connect', () => {
    logWithTimestamp('Connected to Node.js Server Socket:', nodeServerSocket.id);
});

nodeServerSocket.on('connect_error', (error) => {
    logWithTimestamp('Connection to Node.js Server failed:', error.message, error);
});

nodeServerSocket.on('disconnect', (reason) => {
    logWithTimestamp('Disconnected from Node.js Server Socket:', reason);
});

nodeServerSocket.on('reconnect_attempt', (attempt) => {
    logWithTimestamp(`Reconnection attempt to Node.js Server: Attempt #${attempt}`);
});

nodeServerSocket.on('reconnect_failed', () => {
    logWithTimestamp('Reconnection to Node.js Server failed after multiple attempts.');
});

// Function to connect both RASA and Node.js server sockets
const connectSockets = () => {
    if (!rasaServerSocket.connected) {
        logWithTimestamp('Attempting to connect to RASA Server...');
        rasaServerSocket.connect();
    }

    if (!nodeServerSocket.connected) {
        logWithTimestamp('Attempting to connect to Node.js Server...');
        nodeServerSocket.connect();
    }
};

// Function to disconnect both RASA and Node.js server sockets
const disconnectSockets = () => {
    if (rasaServerSocket && rasaServerSocket.connected) {
        rasaServerSocket.disconnect();
        logWithTimestamp('Disconnected from RASA Server Socket');
    }

    if (nodeServerSocket && nodeServerSocket.connected) {
        nodeServerSocket.disconnect();
        logWithTimestamp('Disconnected from Node.js Server Socket');
    }
};

// Function to reconnect both RASA and Node.js server sockets
const reconnectSockets = () => {
    if (!rasaServerSocket.connected) {
        logWithTimestamp('Reconnecting to RASA Server...');
        rasaServerSocket.connect();
    }

    if (!nodeServerSocket.connected) {
        logWithTimestamp('Reconnecting to Node.js Server...');
        nodeServerSocket.connect();
    }
};

export { rasaServerSocket, nodeServerSocket, connectSockets, disconnectSockets, reconnectSockets };
