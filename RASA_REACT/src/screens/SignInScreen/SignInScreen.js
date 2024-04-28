import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import Logo from '../../../assets/images/woman_stonks.png';
import CustomInput from "../../../components/CustomInput";
import CustomButton from "../../../components/CustomButton";
import { rasaServerSocket, pythonServerSocket, connectSockets, disconnectSockets, reconnectSockets } from "../../../components/SocketManager/SocketManager";
import { useNavigation } from '@react-navigation/native';
import bcrypt from 'bcryptjs';
import { useUserContext } from "../../../components/UserContext";
import emitToServerEvent from "../../../components/SocketUtils";

const SignInScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { setUserUUID } = useUserContext();
    const { height } = useWindowDimensions(); // Get height from useWindowDimensions
    const navigation = useNavigation();

    useEffect(() => {
        console.log('SignIn Screen Mounted')
        // When the component mounts we connect the sockets
        if (!pythonServerSocket.connected && !rasaServerSocket.connected) {
            connectSockets();
        }

        socketConnectionEvent();

        emitToServerEvent('interaction_log', {
            UUID: "Anonymous User",
            Username: "Anonymous User",
            InteractionType: 'Navigation',
            InteractionOutput: '-> Sign In Screen'
        });

        return () => {
            // Close the sockets when the component unmounts
            disconnectSockets();
        };
    }, []);

    const socketConnectionEvent = () => {

        rasaServerSocket.on('connect', () => {
            console.log(rasaServerSocket.id + ' RASA Server: Connected to server (Sign In Screen)');
        });

        rasaServerSocket.on('disconnect', () => {
            console.log(rasaServerSocket.id + ' RASA Server: Connected to server (Sign In Screen)');
        });

        pythonServerSocket.on('connect', () => {
            console.log(pythonServerSocket.id + ' Python Server: Connected to server (Sign In Screen)');
        });

        pythonServerSocket.on('disconnect', () => {
            console.log(pythonServerSocket.id + ' Python Server: Disconnected from server (Sign In Screen)');
        });
    }

    useEffect(() => {
        const handleUserCredentials = (data) => {
            if (data.error) {
                console.warn("User not found.");
            } else {
                const receivedHash = data.password;
                bcrypt.compare(password, receivedHash, (compareErr, result) => {
                    if (compareErr) {
                        console.error('Error comparing passwords:', compareErr);
                    } else if (result) {
                        // Update userUUID in the context
                        setUserUUID(data.uuid);
                        emitToServerEvent('interaction_log', {
                            UUID: rasaServerSocket.id,
                            Username: username,
                            InteractionType: 'Successful Login',
                            InteractionOutput: data.uuid + 'logged in',
                        });
                        checkVariableInDatabase(data.uuid, (variableValue) => {
                            if (variableValue === 1) {
                                navigation.navigate('WelcomeBack', { username });
                            } else {
                                navigation.navigate('ChatWindow', { username });
                                console.warn("Login Successful!");
                            }
                        });
                        //navigation.navigate('ChatWindow', { username });
                    } else {
                        console.warn("Invalid Password");
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

        if (pythonServerSocket) {
            pythonServerSocket.on('user_credentials', handleUserCredentials);
        }

        return () => {
            pythonServerSocket.off('user_credentials', handleUserCredentials);
        };
    }, [password, navigation, setUserUUID]);

    const checkVariableInDatabase = (userUUID, callback) => {
        // Emit event to server to check tutorial completion
        pythonServerSocket.emit('check_tutorial_completion', userUUID);
    
        // Listen for the response
        const returnTutorialCompletionListener = (data) => {
            // Data contains the completedTutorial value
            const completedTutorial = data.CompletedTutorial;
            callback(completedTutorial);
            console.log("Variable: " + completedTutorial);
    
            // Remove the event listener to avoid memory leaks
            pythonServerSocket.off('return_tutorial_completion', returnTutorialCompletionListener);
        };
    
        pythonServerSocket.on('return_tutorial_completion', returnTutorialCompletionListener);
    };

    const onSignInPressed = () => {
        console.log("Sign In Button Pressed");

        emitToServerEvent('interaction_log', {
            UUID: rasaServerSocket.id,
            Username: "Anonymous User",
            InteractionType: 'Button Press',
            InteractionOutput: 'Sign In',
        });

        // Ensure the socket is connected
        if (pythonServerSocket.connected && rasaServerSocket.connected) {
            // Request user password from the server
            pythonServerSocket.emit('login', username);
            console.log("Requesting Login from: " + username)
        } else {
            // If the socket is not connected, reconnect it and emit the event
            reconnectSockets();
            pythonServerSocket.emit('login', username);
        }
    }

    const onForgotPasswordPressed = () => {
        navigation.navigate('ForgotPassword');
    }

    const onSignUpPressed = () => {
        navigation.navigate('SignUp');
    }

    return (
        <View style={styles.root}>
            <Image source={Logo} style={[styles.logo, { height: height * 0.3 }]} resizeMode="contain" />
            <CustomInput placeholder='Username' value={username} setValue={setUsername} />
            <CustomInput placeholder='Password' value={password} setValue={setPassword} secureTextEntry={true} />
            <CustomButton text='Sign In' onPress={onSignInPressed} />
            <CustomButton text='Forgot Password?' onPress={onForgotPasswordPressed} type="TERTIARY" />
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
