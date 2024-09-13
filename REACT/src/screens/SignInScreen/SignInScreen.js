import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import Logo from '../../assets/images/icons/woman_stonks.png';
import CustomInput from "../../components/common/CustomInput";
import CustomButton from "../../components/common/CustomButton";
import { rasaServerSocket, pythonServerSocket, connectSockets, disconnectSockets, reconnectSockets } from "../../components/sockets/SocketManager/SocketManager";
import { useNavigation } from '@react-navigation/native';
import bcrypt from 'bcryptjs';
import { useUserContext } from "../../components/utils/contexts/UserContext";
import emitToServerEvent from "../../components/sockets/SocketUtils";

const SignInScreen = () => {
    // State hooks for managing username and password inputs
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    // Context hook for setting the user UUID globally
    const { setUserUUID } = useUserContext();
    
    // Hook to get window dimensions, particularly height
    const { height } = useWindowDimensions();
    
    // Navigation hook for navigating between screens
    const navigation = useNavigation();

    // useEffect for handling socket connections and disconnections
    useEffect(() => {
        console.log('SignIn Screen Mounted');

        // Ensure sockets are connected only if they are not already connected
        if (!pythonServerSocket.connected && !rasaServerSocket.connected) {
            connectSockets();
        }

        // Set up event listeners for socket connections and disconnections
        socketConnectionEvent();

        // Log interaction for navigation to this screen
        emitToServerEvent('interaction_log', {
            UUID: "Anonymous User",
            Username: "Anonymous User",
            InteractionType: 'Navigation',
            InteractionOutput: '-> Sign In Screen'
        });

        // Cleanup function to disconnect sockets when the component unmounts
        return () => {
            disconnectSockets();
        };
    }, []);

    // Function to handle socket connection events
    const socketConnectionEvent = () => {
        // Log when RASA server connects
        rasaServerSocket.on('connect', () => {
            console.log(rasaServerSocket.id + ' RASA Server: Connected to server (Sign In Screen)');
        });

        // Log when RASA server disconnects
        rasaServerSocket.on('disconnect', () => {
            console.log(rasaServerSocket.id + ' RASA Server: Disconnected from server (Sign In Screen)');
        });

        // Log when Python server connects
        pythonServerSocket.on('connect', () => {
            console.log(pythonServerSocket.id + ' Python Server: Connected to server (Sign In Screen)');
        });

        // Log when Python server disconnects
        pythonServerSocket.on('disconnect', () => {
            console.log(pythonServerSocket.id + ' Python Server: Disconnected from server (Sign In Screen)');
        });
    };

    // useEffect to handle user credentials when received from server
    useEffect(() => {
        const handleUserCredentials = (data) => {
            if (data.error) {
                // Handle case where user is not found
                //console.warn("User not found.");
            } else {
                const receivedHash = data.password;

                // Compare the entered password with the hashed password from the server
                bcrypt.compare(password, receivedHash, (compareErr, result) => {
                    if (compareErr) {
                        // Handle error in password comparison
                        //console.error('Error comparing passwords:', compareErr);
                    } else if (result) {
                        // On successful login, update the user UUID in context
                        setUserUUID(data.uuid);

                        // Log successful login interaction
                        emitToServerEvent('interaction_log', {
                            UUID: rasaServerSocket.id,
                            Username: username,
                            InteractionType: 'Successful Login',
                            InteractionOutput: data.uuid + ' logged in',
                        });

                        // Check if a certain variable exists in the database and navigate accordingly
                        checkVariableInDatabase(data.uuid, (variableValue) => {
                            if (variableValue === 1) {
                                navigation.navigate('WelcomeBack', { username });
                            } else {
                                navigation.navigate('ChatWindow', { username });
                                //console.warn("Login Successful!");
                            }
                        });
                    } else {
                        // Handle invalid password case
                        //console.warn("Invalid Password");

                        // Log unsuccessful login interaction
                        emitToServerEvent('interaction_log', {
                            UUID: rasaServerSocket.id,
                            Username: username,
                            InteractionType: 'Unsuccessful Login',
                            InteractionOutput: username + ' Invalid Password',
                        });
                    }
                });
            }
        };

        // Register event listener for user credentials
        if (pythonServerSocket) {
            pythonServerSocket.on('user_credentials', handleUserCredentials);
        }

        // Cleanup function to remove event listener when the component unmounts
        return () => {
            pythonServerSocket.off('user_credentials', handleUserCredentials);
        };
    }, [password, navigation, setUserUUID]);

    // Function to check a variable in the database based on user UUID
    const checkVariableInDatabase = (userUUID, callback) => {
        // Emit event to server to check tutorial completion
        pythonServerSocket.emit('check_tutorial_completion', userUUID);
    
        // Listen for the server response
        const returnTutorialCompletionListener = (data) => {
            const completedTutorial = data.CompletedTutorial;
            callback(completedTutorial);
            console.log("Variable: " + completedTutorial);
    
            // Remove event listener after handling the response to avoid memory leaks
            pythonServerSocket.off('return_tutorial_completion', returnTutorialCompletionListener);
        };
    
        pythonServerSocket.on('return_tutorial_completion', returnTutorialCompletionListener);
    };

    // Function to handle Sign In button press
    const onSignInPressed = () => {
        console.log("Sign In Button Pressed");

        // Log button press interaction
        emitToServerEvent('interaction_log', {
            UUID: rasaServerSocket.id,
            Username: "Anonymous User",
            InteractionType: 'Button Press',
            InteractionOutput: 'Sign In',
        });

        // Ensure the socket is connected before emitting login event
        if (pythonServerSocket.connected && rasaServerSocket.connected) {
            pythonServerSocket.emit('login', username);
            console.log("Requesting Login from: " + username)
        } else {
            // Reconnect sockets if not connected and then emit login event
            reconnectSockets();
            pythonServerSocket.emit('login', username);
        }
    };

    // Function to handle Forgot Password button press
    const onForgotPasswordPressed = () => {
        navigation.navigate('ForgotPassword');
    };

    // Function to handle Sign Up button press
    const onSignUpPressed = () => {
        navigation.navigate('SignUp');
    };

    return (
        <View style={styles.root}>
            {/* Display logo image with dynamic height based on window height */}
            <Image source={Logo} style={[styles.logo, { height: height * 0.3 }]} resizeMode="contain" />
            
            {/* Custom inputs for username and password */}
            <CustomInput placeholder='Username' value={username} setValue={setUsername} />
            <CustomInput placeholder='Password' value={password} setValue={setPassword} secureTextEntry={true} />
            
            {/* Sign In button */}
            <CustomButton text='Sign In' onPress={onSignInPressed} />
            
            {/* Forgot Password button */}
            <CustomButton text='Forgot Password?' onPress={onForgotPasswordPressed} type="TERTIARY" />
            
            {/* Sign Up button */}
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
