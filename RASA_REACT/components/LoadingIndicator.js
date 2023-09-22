import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LoadingIndicator = () => {
  return (
    <View style={styles.loadingContainer}>
      <Text>Loading...</Text>
      <Text>Loading.</Text>
      <Text>Loading..</Text>
      <Text>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LoadingIndicator;