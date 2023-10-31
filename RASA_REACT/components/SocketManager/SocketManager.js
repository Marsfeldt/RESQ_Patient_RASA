import io from 'socket.io-client';

// Socket responsible for connecting to RASA
const rasaServerSocket = io('http://172.31.156.13:5005');

// Socket responsible for connecting to the Python Server
const pythonServerSocket = io('http://172.31.156.13:5006');

export { rasaServerSocket, pythonServerSocket };