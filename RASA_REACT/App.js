import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import io from 'socket.io-client';
import { GiftedChat } from 'react-native-gifted-chat';
import { v4 as uuidv4 } from 'uuid';

// The different screen from the mobile application
import Navigation from './src/screens/Navigation';
import { UserProvider } from './components/UserContext';

const App = () => {
  return (
    <UserProvider>
      <Navigation />
    </UserProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBFC',
  },
  rasaTypingIndicator: {
    color: 'black',
    fontSize: 18,
    alignSelf: 'center',
    marginVertical: 8,
  },
});

export default App;
