import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import Logo from '../../assets/images/icons/woman_stonks.png';
import CustomInput from "../../components/common/CustomInput";
import CustomButton from "../../components/common/CustomButton";
import { rasaServerSocket, nodeServerSocket, connectSockets, disconnectSockets, reconnectSockets } from "../../components/sockets/SocketManager/SocketManager";
import { useNavigation } from '@react-navigation/native';
import bcrypt from 'bcryptjs';
import { useUserContext } from "../../components/utils/contexts/UserContext";
import emitToServerEvent from "../../components/sockets/SocketUtils";

const SignInScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { setUserUUID } = useUserContext();
    const { height } = useWindowDimensions();
    const navigation = useNavigation();

    useEffect(() => {
        console.log('SignIn Screen Mounted');
        if (!nodeServerSocket.connected && !rasaServerSocket.connected) {
            connectSockets();
        }

        // Log interaction for navigation to this screen
        emitToServerEvent('interaction_log', {
            UUID: "Anonymous User",
            Username: "Anonymous User",
            InteractionType: 'Navigation',
            InteractionOutput: '-> Sign In Screen'
        });

        // Clean up when component unmounts
        return () => {
            disconnectSockets();
        };
    }, []);

    useEffect(() => {
        const handleUserCredentials = (data) => {
            if (data.error) {
                console.warn("User not found.");
            } else {
                const receivedHash = data.password;

                // Compare the received hashed password with the user's input
                bcrypt.compare(password, receivedHash, (compareErr, result) => {
                    if (compareErr) {
                        console.error('Error comparing passwords:', compareErr);
                    } else if (result) {
                        // If the password matches
                        console.log('Password match successful');
                        setUserUUID(data.uuid);

                        // Navigate to the ChatWindow screen after successful login
                        navigation.navigate('ChatWindow');
                    } else {
                        // If the passwords do not match
                        console.log('Passwords do not match');
                    }
                });
            }
        };

        if (nodeServerSocket) {
            nodeServerSocket.on('user_credentials', handleUserCredentials);
        }

        // Clean up the event listener when component unmounts
        return () => {
            nodeServerSocket.off('user_credentials', handleUserCredentials);
        };
    }, [password, navigation, setUserUUID]);

    const onSignInPressed = () => {
        console.log("Sign In Button Pressed");

        // Log the interaction
        emitToServerEvent('interaction_log', {
            UUID: rasaServerSocket.id,
            Username: "Anonymous User",
            InteractionType: 'Button Press',
            InteractionOutput: 'Sign In',
        });

        // Check if both WebSocket connections are available
        if (nodeServerSocket.connected && rasaServerSocket.connected) {
            nodeServerSocket.emit('login', username);

            // Navigate to ChatWindow with the username
            navigation.navigate('ChatWindow', { username: username });  // Pass username as a parameter
        } else {
            reconnectSockets();
            nodeServerSocket.emit('login', username);

            // Navigate to ChatWindow with the username
            navigation.navigate('ChatWindow', { username: username });  // Pass username as a parameter
        }
    };


    // Ajout de la fonction pour gérer "Forgot Password"
    const onForgotPasswordPressed = () => {
        console.log("Forgot Password Button Pressed");
        // Logique de navigation ou d'action pour le mot de passe oublié
        navigation.navigate('ForgotPassword');
    };

    const onSignUpPressed = () => {
        console.log("Sign Up Button Pressed");
        navigation.navigate('SignUp');
    };

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
