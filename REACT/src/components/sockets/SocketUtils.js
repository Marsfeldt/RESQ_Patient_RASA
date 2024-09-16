import { nodeServerSocket } from '../../components/sockets/SocketManager/SocketManager';

// Function to emit data to different events on the Python server socket
const emitToServerEvent = (eventName, data) => {
  nodeServerSocket.emit(eventName, data);
};

export default emitToServerEvent;