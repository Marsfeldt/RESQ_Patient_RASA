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

                bcrypt.compare(password, receivedHash, (compareErr, result) => {
                    console.log('Password entered by user:', password);
                    console.log('Hashed password from database:', receivedHash);
                    if (compareErr) {
                        console.error('Error comparing passwords:', compareErr);
                    } else if (result) {
                        console.log('Password match successful');
                        setUserUUID(data.uuid);
                    } else {
                        console.log('Passwords do not match');
                    }
                });

            }
        };

        if (nodeServerSocket) {
            nodeServerSocket.on('user_credentials', handleUserCredentials);
        }

        return () => {
            nodeServerSocket.off('user_credentials', handleUserCredentials);
        };
    }, [password, navigation, setUserUUID]);

    const onSignInPressed = () => {
        console.log("Sign In Button Pressed");
        emitToServerEvent('interaction_log', {
            UUID: rasaServerSocket.id,
            Username: "Anonymous User",
            InteractionType: 'Button Press',
            InteractionOutput: 'Sign In',
        });

        if (nodeServerSocket.connected && rasaServerSocket.connected) {
            nodeServerSocket.emit('login', username);
        } else {
            reconnectSockets();
            nodeServerSocket.emit('login', username);
        }
    };

    const onForgotPasswordPressed = () => {
        navigation.navigate('ForgotPassword');
    };

    const onSignUpPressed = () => {
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
