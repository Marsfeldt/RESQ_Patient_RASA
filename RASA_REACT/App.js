import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import io from 'socket.io-client';

function App() {
  useEffect(() => {
    // Connect to the WebSocket server
    const socket = io('http://localhost:5000'); // Change the URL to your Flask server's address

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    // You can define custom events and handlers here
    // For example:
    socket.on('message', (data) => {
      console.log('Received message:', data);
    });

    return () => {
      // Clean up the socket connection when the component unmounts
      socket.disconnect();
    };
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {/* Your React Native component content */}
      <Text>Hello, React Native!</Text>
    </View>
  );
}

export default App;