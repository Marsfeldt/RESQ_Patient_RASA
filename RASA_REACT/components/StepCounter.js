import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SensorManager } from 'react-native-sensors';

const StepCounter = () => {
  const [stepCount, setStepCount] = useState(0);

  useEffect(() => {
    let isSubscribed = true;

    const subscription = SensorManager.startStepCounter(1000, data => {
      if (isSubscribed) {
        setStepCount(data.steps);
      }
    });

    return () => {
      isSubscribed = false;
      SensorManager.stopStepCounter();
      subscription.stop();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.step}>Step Count: {stepCount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  step: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default StepCounter;
