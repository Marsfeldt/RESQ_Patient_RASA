import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import Logo from '../../../assets/images/logo.png';
import CustomInput from "../../../components/CustomInput";
import CustomButton from "../../../components/CustomButton";
import { hash } from 'react-native-bcrypt';
import { useNavigation } from '@react-navigation/native';
import { disconnectSockets, pythonServerSocket } from "../../../components/SocketManager/SocketManager";

const SignUpScreen = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');
    const { height } = useWindowDimensions();
    const navigation = useNavigation();

    useEffect(() => {
        return () => {
            disconnectSockets();
        };
    }, []);

    const onSignInPressed = () => {
        navigation.navigate('SignIn');
    }

    const onRegisterPressed = () => {
        console.log("Register button pressed");

        if (pythonServerSocket && pythonServerSocket.connected) {
            console.log("Socket is available");
            hash(password, 5, (hashErr, hashedPassword) => {
                if (hashErr) {
                    console.error('Error hashing password:', hashErr);
                } else {
                    console.log("Password hashed successfully");

                    console.log("Sending the following data to the server:");
                    console.log({
                        uuid: pythonServerSocket.id,
                        username: username,
                        email: email,
                        password: hashedPassword,
                        dateOfBirth: dateOfBirth
                    });

                    pythonServerSocket.emit('create_account', {
                        uuid: pythonServerSocket.id,
                        username: username,
                        email: email,
                        password: hashedPassword,
                        dateOfBirth: dateOfBirth
                    }, (response) => {
                        if (response && response.status === 'ok') {
                            console.log('Account created successfully:', response);
                            // Navigate to the SignIn screen after successful account creation
                            navigation.navigate('SignIn');
                        } else if (response && response.status === 'error') {
                            console.error('Server responded with an error:', response.error);
                            // Show an error message to the user
                        } else if (!response) {
                            console.error('No response from server');
                            // Handle the absence of response from the server
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

    const onTermsOfUsePressed = () => {
        console.log("Terms of Use pressed");
    }

    const onPrivacyPolicyPressed = () => {
        console.log("Privacy Policy pressed");
    }

    return (
        <View style={styles.root}>
            <Text style={styles.title}>Create Account</Text>
            <CustomInput placeholder='Username' value={username} setValue={setUsername} />
            <CustomInput placeholder='Email' value={email} setValue={setEmail} />
            <CustomInput placeholder='Password' value={password} setValue={setPassword} secureTextEntry={true} />
            <CustomInput placeholder='Repeat Password' value={passwordRepeat} setValue={setPasswordRepeat} secureTextEntry={true} />
            <CustomInput placeholder='Birth Date' value={dateOfBirth} setValue={setDateOfBirth} />
            <CustomButton text='Register' onPress={onRegisterPressed} type="TERTIARY"/>
            <Text style={styles.text}>By creating an account, you accept our <Text style={styles.link} onPress={onTermsOfUsePressed}>Terms of Use</Text> and <Text style={styles.link} onPress={onPrivacyPolicyPressed}>Privacy Policy</Text></Text>
            <CustomButton text='Do you already have an account? Log in here' onPress={onSignInPressed} type="TERTIARY" />
        </View>
    );
};


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
