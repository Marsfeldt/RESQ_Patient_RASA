import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import Logo from '../../../assets/images/logo.png';
import CustomInput from "../../../components/CustomInput";
import CustomButton from "../../../components/CustomButton";
import { rasaServerSocket, pythonServerSocket, connectSockets, disconnectSockets } from "../../../components/SocketManager/SocketManager";
import { useNavigation } from '@react-navigation/native';
import bcrypt from 'bcryptjs';

const SignInScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const { height } = useWindowDimensions();
    const navigation = useNavigation();

    useEffect(() => {

        // When the component mounts we connect the sockets
        connectSockets();

        pythonServerSocket.on('connect', () => {
            console.log(pythonServerSocket.id + ' Python Server: Connected to server (Sign In Screen)');
        });

        pythonServerSocket.on('disconnect', () => {
            console.log(pythonServerSocket.id + ' Python Server: Disconnected from server (Sign In Screen)');
        });

        return () => {
            // Close the sockets when the component unmounts
            disconnectSockets();
        };
    }, []);

    useEffect(() => {
        // Set up the event listener for 'user_password' here
        const handleUserPassword = (receivedHash) => {
            if (receivedHash === "User not found") {
                console.warn("User not found.");
            } else {
                bcrypt.compare(password, receivedHash, (compareErr, result) => {
                    if (compareErr) {
                        console.error('Error comparing passwords:', compareErr);
                    } else if (result) {
                        console.warn("Login Successful!");
                        navigation.navigate('ChatWindow', { username });
                    } else {
                        console.warn("Invalid Password");
                    }
                });
            }
        };

        if (pythonServerSocket) {
            pythonServerSocket.on('user_password', handleUserPassword);
        }

        return () => {
            // Remove the event listener when the component unmounts
            if (pythonServerSocket) {
                pythonServerSocket.off('user_password', handleUserPassword);
            }
        };
    }, [password, navigation]);

    const onSignInPressed = () => {
        console.log("Sign In Button Pressed");
        
        // Ensure the socket is connected
        if (pythonServerSocket.connected) {
            // Request user password from the server
            pythonServerSocket.emit('login', username);
        } else {
            // If the socket is not connected, reconnect it and emit the event
            pythonServerSocket.connect();
            pythonServerSocket.emit('login', username);
        }
    }

    const onFrogotPasswordPressed = () => {
        navigation.navigate('ForgotPassword');
    }

    const onSignUpPressed = () => {
        navigation.navigate('SignUp');
    }

    return (
        <View style={styles.root}>
            <Image source={Logo} style={[styles.logo, { height: height * 0.3 }]} resizeMode="contain" />
            <CustomInput placeholder='Brugernavn' value={username} setValue={setUsername} />
            <CustomInput placeholder='Kodeord' value={password} setValue={setPassword} secureTextEntry={true} />
            <CustomButton text='Log Ind' onPress={onSignInPressed} />
            <CustomButton text='Glemt kodeord?' onPress={onFrogotPasswordPressed} type="TERTIARY" />
            <CustomButton text='Har du ikke en konto, Opret en' onPress={onSignUpPressed} type="TERTIARY" />
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
