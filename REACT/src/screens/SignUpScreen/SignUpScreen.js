// SignUpScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import CustomInput from '../../components/common/CustomInput';
import CustomButton from '../../components/common/CustomButton';
import { useNavigation } from '@react-navigation/native';

const SignUpScreen = () => {
  // State hooks for managing input fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [date_of_birth, setDateOfBirth] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');

  // Navigation hook for navigating between screens
  const navigation = useNavigation();

  // Function to navigate to the SignIn screen when Sign In button is pressed
  const onSignInPressed = () => {
    navigation.navigate('SignIn');
  };

  // Function to handle Register button press
  const onRegisterPressed = async () => {
    // Input validation
    if (!username || !email || !date_of_birth || !password || !passwordRepeat) {
      Alert.alert('Error', 'Please fill all the fields.');
      return;
    }

    if (password !== passwordRepeat) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      // Send a POST request to the server to create a new account
      const response = await fetch('http://10.0.2.2:5006/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          date_of_birth,
        }),
      });

      const data = await response.json();

      if (data.status === 'ok') {
        Alert.alert('Success', 'Account created successfully.');
        // Navigate to the SignIn screen after successful account creation
        navigation.navigate('SignIn');
      } else {
        Alert.alert('Registration Failed', data.error || 'An error occurred.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Network Error', 'Please try again later.');
    }
  };

  // Function to handle pressing the Terms of Use text
  const onTermsOfUsePressed = () => {
    console.log('Terms of Use pressed');
    // Additional logic for navigating to Terms of Use can be added here
  };

  // Function to handle pressing the Privacy Policy text
  const onPrivacyPolicyPressed = () => {
    console.log('Privacy Policy pressed');
    // Additional logic for navigating to Privacy Policy can be added here
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Create Account</Text>

      {/* Input fields for user details */}
      <CustomInput placeholder="Username" value={username} setValue={setUsername} />
      <CustomInput placeholder="Email" value={email} setValue={setEmail} />
      <CustomInput placeholder="Birth Date (YYYY-MM-DD)" value={date_of_birth} setValue={setDateOfBirth} />
      <CustomInput placeholder="Password" value={password} setValue={setPassword} secureTextEntry />
      <CustomInput placeholder="Repeat Password" value={passwordRepeat} setValue={setPasswordRepeat} secureTextEntry />

      {/* Register button */}
      <CustomButton text="Register" onPress={onRegisterPressed} />

      {/* Terms of Use and Privacy Policy text */}
      <Text style={styles.text}>
        By creating an account, you accept our
        <Text style={styles.link} onPress={onTermsOfUsePressed}> Terms of Use</Text>
        {' '}and
        <Text style={styles.link} onPress={onPrivacyPolicyPressed}> Privacy Policy</Text>
      </Text>

      {/* Sign In button for users who already have an account */}
      <CustomButton text="Already have an account? Log in here" onPress={onSignInPressed} type="TERTIARY" />
    </View>
  );
};

// Stylesheet for the component
const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#051C60',
    margin: 10,
  },
  text: {
    color: 'gray',
    marginVertical: 10,
  },
  link: {
    color: '#FDB075',
  },
});

export default SignUpScreen;
