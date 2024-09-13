import React from 'react';
import { StyleSheet } from 'react-native';
import Navigation from './screens/Navigation';
import { UserProvider } from './components/utils/contexts/UserContext';

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
});

export default App;
