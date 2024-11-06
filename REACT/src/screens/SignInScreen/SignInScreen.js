// SignInScreen.js
import React, { useState } from 'react';
import { View, Image, StyleSheet, useWindowDimensions, Alert } from 'react-native';
import Logo from '../../assets/images/icons/woman_stonks.png';
import CustomInput from '../../components/common/CustomInput';
import CustomButton from '../../components/common/CustomButton';
import { useNavigation } from '@react-navigation/native';
import { useUserContext } from '../../components/utils/contexts/UserContext';

const SignInScreen = () => {
  // State variables for username and password input fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Context hook to set the user's UUID after successful sign-in
  const { setUserUUID } = useUserContext();

  // Get the device's window dimensions for responsive styling
  const { height } = useWindowDimensions();

  // Navigation hook to navigate between screens
  const navigation = useNavigation();

  // Handler for the "Forgot Password" button press
  const onForgotPasswordPressed = () => {
    navigation.navigate('ForgotPassword');
  };

  // Handler for the "Sign Up" button press
  const onSignUpPressed = () => {
    navigation.navigate('SignUp');
  };

  // Handler for the "Sign In" button press
  const onSignInPressed = async () => {
    // Validate that both username and password are provided
    if (!username || !password) {
      Alert.alert('Validation Error', 'Please enter both username and password.');
      return;
    }

    try {
      // Send a POST request to the server for authentication
      const response = await fetch('http://10.0.2.2:5006/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Include username and password in the request body
        body: JSON.stringify({ username, password }),
      });

      // Parse the response data as JSON
      const data = await response.json();
      console.log('Login response:', data);

      if (data.status === 'ok') {
        setUserUUID(data.useruuid);
        navigation.navigate('ChatWindow', { username });
      } else {
        // Handle login failure by showing an alert to the user
        Alert.alert('Login Failed', data.error || 'Invalid username or password.');
      }
    } catch (error) {
      // Handle network or server errors
      Alert.alert('Network Error', 'An error occurred while trying to log in. Please try again later.');
    }
  };

  return (
    <View style={styles.root}>
      {/* Display the logo image */}
      <Image source={Logo} style={[styles.logo, { height: height * 0.3 }]} resizeMode="contain" />

      {/* Input fields for username and password */}
      <CustomInput placeholder="Username" value={username} setValue={setUsername} />
      <CustomInput placeholder="Password" value={password} setValue={setPassword} secureTextEntry />

      {/* Sign In button */}
      <CustomButton text="Sign In" onPress={onSignInPressed} />

      {/* Navigation buttons for Forgot Password and Sign Up */}
      <CustomButton text="Forgot Password?" onPress={onForgotPasswordPressed} type="TERTIARY" />
      <CustomButton text="Don't have an account? Sign Up" onPress={onSignUpPressed} type="TERTIARY" />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: '70%',
    maxHeight: 300,
    maxWidth: 200,
  },
});

export default SignInScreen;
