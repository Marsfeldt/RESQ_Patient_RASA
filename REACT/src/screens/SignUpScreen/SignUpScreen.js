import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Logo from '../../assets/images/logos/logo.png';
import CustomInput from "../../components/common/CustomInput";
import CustomButton from "../../components/common/CustomButton";
import { hash } from 'react-native-bcrypt'; // Used to hash passwords
import { useNavigation } from '@react-navigation/native';
import { disconnectSockets, nodeServerSocket } from "../../components/sockets/SocketManager/SocketManager";


const SignUpScreen = () => {
    // State hooks for managing input fields
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');

    // Hook to get window dimensions, particularly height
    const { height } = useWindowDimensions();

    // Navigation hook for navigating between screens
    const navigation = useNavigation();

    // useEffect to handle cleanup when the component unmounts
    useEffect(() => {
        return () => {
            disconnectSockets();  // Ensure sockets are disconnected when the component unmounts
        };
    }, []);

    // Function to navigate to the SignIn screen when Sign In button is pressed
    const onSignInPressed = () => {
        navigation.navigate('SignIn');
    };

    // Function to handle Register button press
    const onRegisterPressed = () => {
        console.log("Register button pressed");

        // Check if the socket is available and connected
        if (nodeServerSocket && nodeServerSocket.connected) {
            console.log("Socket is available");

            // Hash the password with bcrypt
            hash(password, 10, (hashErr, hashedPassword) => {
                if (hashErr) {
                    console.error('Error hashing password:', hashErr);
                } else {
                    console.log("Password hashed successfully");

                    console.log("Sending the following data to the server:");
                    console.log({
                        uuid: nodeServerSocket.id,  // Unique identifier for the socket session
                        username: username,
                        email: email,
                        password: hashedPassword,  // Use the hashed password
                        dateOfBirth: dateOfBirth
                    });

                    // Emit event to create a new account
                    nodeServerSocket.emit('create_account', {
                        uuid: nodeServerSocket.id,
                        username: username,
                        email: email,
                        password: hashedPassword,
                        dateOfBirth: dateOfBirth
                    }, (response) => {
                        // Handle server response after attempting to create an account
                        if (response && response.status === 'ok') {
                            console.log('Account created successfully:', response);
                            // Navigate to the SignIn screen after successful account creation
                            navigation.navigate('SignIn');
                        } else if (response && response.status === 'error') {
                            console.error('Server responded with an error:', response.error);
                            // Show an error message to the user
                        } else if (!response) {
                            console.error('No response from server');
                            // Handle the absence of a response from the server
                        } else {
                            console.error('Unexpected error');
                        }
                    });

                    console.log("Data sent to server, awaiting confirmation...");
                }
            });
        } else {
            console.error('Socket is not available.');
        }
    };

    // Function to handle pressing the Terms of Use text
    const onTermsOfUsePressed = () => {
        console.log("Terms of Use pressed");
        // Additional logic for navigating to Terms of Use can be added here
    };

    // Function to handle pressing the Privacy Policy text
    const onPrivacyPolicyPressed = () => {
        console.log("Privacy Policy pressed");
        // Additional logic for navigating to Privacy Policy can be added here
    };

    return (
        <View style={styles.root}>
            <Text style={styles.title}>Create Account</Text>
            
            {/* Input fields for user details */}
            <CustomInput placeholder='Username' value={username} setValue={setUsername} />
            <CustomInput placeholder='Email' value={email} setValue={setEmail} />
            <CustomInput placeholder='Password' value={password} setValue={setPassword} secureTextEntry={true} />
            <CustomInput placeholder='Repeat Password' value={passwordRepeat} setValue={setPasswordRepeat} secureTextEntry={true} />
            <CustomInput placeholder='Birth Date' value={dateOfBirth} setValue={setDateOfBirth} />
            
            {/* Register button */}
            <CustomButton text='Register' onPress={onRegisterPressed} type="TERTIARY"/>
            
            {/* Terms of Use and Privacy Policy text */}
            <Text style={styles.text}>
                By creating an account, you accept our 
                <Text style={styles.link} onPress={onTermsOfUsePressed}> Terms of Use</Text> 
                and 
                <Text style={styles.link} onPress={onPrivacyPolicyPressed}> Privacy Policy</Text>
            </Text>
            
            {/* Sign In button for users who already have an account */}
            <CustomButton text='Do you already have an account? Log in here' onPress={onSignInPressed} type="TERTIARY" />
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
        color: '#FDB075'
    }
});

export default SignUpScreen;
