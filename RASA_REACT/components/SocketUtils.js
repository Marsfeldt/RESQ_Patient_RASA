import { pythonServerSocket } from '../components/SocketManager/SocketManager';

// Function to emit data to different events on the Python server socket
const emitToServerEvent = (eventName, data) => {
  pythonServerSocket.emit(eventName, data);
};

export default emitToServerEvent;