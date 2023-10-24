import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import Logo from '../../../assets/images/logo.png';
import CustomInput from "../../../components/CustomInput";
import CustomButton from "../../../components/CustomButton";
import { useNavigation } from '@react-navigation/native';
import io from 'socket.io-client';
import bcrypt from 'bcryptjs';

const SignInScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const { height } = useWindowDimensions();
    const navigation = useNavigation();

    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Create a socket connection when the component mounts
        const socket = io('http://172.24.222.4:5006');
        setSocket(socket);

        return () => {
            // Close the socket when the component unmounts
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        // Set up the event listener for 'user_password' here
        if (socket) {
            socket.on('user_password', (receivedHash) => {
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
            });
        }

        return () => {
            // Remove the event listener when the component unmounts
            if (socket) {
                socket.off('user_password');
            }
        };
    }, [socket, password, navigation]);

    const onSignInPressed = () => {
        // Request user password from the server
        if (socket) {
            socket.emit('login', username);
        } else {
            console.error('Socket is not available.');
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
