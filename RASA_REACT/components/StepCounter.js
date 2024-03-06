import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, NativeEventEmitter, NativeModules } from 'react-native';

const StepCounter = () => {
  const [steps, setSteps] = useState(0);

  useEffect(() => {
    let lastY = 0;
    let isWalking = false;

    const accelerometerListener = accelerometerData => {
      const { x, y, z } = accelerometerData;

      const acceleration = Math.sqrt(x * x + y * y + z * z);
      if (acceleration > 1.5) {
        isWalking = true;
      }

      if (isWalking && acceleration < 1) {
        isWalking = false;
        setSteps(prevSteps => prevSteps + 1);
      }
    };

    const { DeviceMotion } = NativeModules;
    const accelerometer = new NativeEventEmitter(DeviceMotion);

    const subscription = accelerometer.addListener('Accelerometer', accelerometerListener);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.stepsText}>Steps: {steps}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepsText: {
    fontSize: 24,
  },
});

export default StepCounter;
