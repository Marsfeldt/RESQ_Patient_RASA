import io from 'socket.io-client';

// Fonction pour ajouter des logs avec des timestamps
const logWithTimestamp = (message, ...args) => {
    console.log(`[${new Date().toISOString()}] ${message}`, ...args);
};

// Socket pour se connecter à RASA (Serveur sur le port 5005)
const rasaServerSocket = io('http://10.0.2.2:5005', {
    transports: ['websocket'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

// Socket pour se connecter au serveur Python (Serveur sur le port 5006)
const pythonServerSocket = io('http://10.0.2.2:5006', {
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

// Event listeners pour le débogage
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

// De même pour le serveur Python
pythonServerSocket.on('connect', () => {
    logWithTimestamp('Connected to Python Server Socket:', pythonServerSocket.id);
});

pythonServerSocket.on('connect_error', (error) => {
    logWithTimestamp('Connection to Python Server failed:', error.message, error);
});

pythonServerSocket.on('disconnect', (reason) => {
    logWithTimestamp('Disconnected from Python Server Socket:', reason);
});

pythonServerSocket.on('reconnect_attempt', (attempt) => {
    logWithTimestamp(`Reconnection attempt to Python Server: Attempt #${attempt}`);
});

pythonServerSocket.on('reconnect_failed', () => {
    logWithTimestamp('Reconnection to Python Server failed after multiple attempts.');
});

// Fonction pour connecter les sockets serveurs
const connectSockets = () => {
    if (!rasaServerSocket.connected) {
        logWithTimestamp('Attempting to connect to RASA Server...');
        rasaServerSocket.connect();
    }

    if (!pythonServerSocket.connected) {
        logWithTimestamp('Attempting to connect to Python Server...');
        pythonServerSocket.connect();
    }
};

// Fonction pour déconnecter les sockets serveurs
const disconnectSockets = () => {
    if (rasaServerSocket && rasaServerSocket.connected) {
        rasaServerSocket.disconnect();
        logWithTimestamp('Disconnected from RASA Server Socket');
    }

    if (pythonServerSocket && pythonServerSocket.connected) {
        pythonServerSocket.disconnect();
        logWithTimestamp('Disconnected from Python Server Socket');
    }
};

// Fonction pour reconnecter les sockets serveurs
const reconnectSockets = () => {
    if (!rasaServerSocket.connected) {
        logWithTimestamp('Reconnecting to RASA Server...');
        rasaServerSocket.connect();
    }

    if (!pythonServerSocket.connected) {
        logWithTimestamp('Reconnecting to Python Server...');
        pythonServerSocket.connect();
    }
};

export { rasaServerSocket, pythonServerSocket, connectSockets, disconnectSockets, reconnectSockets };
