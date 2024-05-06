import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import Logo from '../../../assets/images/logo.png';
import CustomInput from "../../../components/CustomInput";
import CustomButton from "../../../components/CustomButton";
import io from 'socket.io-client';
import { compare, hash, setRandomFallback } from 'react-native-bcrypt';
import { useNavigation } from '@react-navigation/native';
import { disconnectSockets, pythonServerSocket } from "../../../components/SocketManager/SocketManager";

const SignUpScreen = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    // Password Related
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');
    const { height } = useWindowDimensions();
    const navigation = useNavigation();
    //const [superServerSocket, setSuperServerSocket] = useState(null); // Initialize socket as null

    useEffect(() => {
        return () => {
            // Close the socket when the component unmounts
            disconnectSockets();
        };
    }, []);

    const onSignInPressed = () => {
        navigation.navigate('SignIn');
    }

    const onForgotPasswordPressed = () => {
        //console.warn("Forgot Password")
        navigation.navigate('ForgotPassword');
    }

    const onSignUpPressed = () => {
        //console.warn("On SignUp")
    }

    const onRegisterPressed = () => {
        if (pythonServerSocket) {
            // Hash the password before sending it
            hash(password, 5, (hashErr, hashedPassword) => {
                if (hashErr) {
                    console.error('Error hashing password:', hashErr);
                } else {
                    console.log("pass " + password)
                    // Send the account data to the Python Server
                    pythonServerSocket.emit('create_account', {
                        uuid: pythonServerSocket.id,
                        username: username,
                        email: email,
                        password: hashedPassword, // Send the hashed password
                        dateOfBirth: dateOfBirth
                    });
                }
            });
        } else {
            console.error('Socket is not available.');
        }
    }

    const onTermsOfUsePressed = () => {
        //console.warn("onTermsOfUsePressed")
    }

    const onPrivacyPolicyPressed = () => {
        //console.warn("onPrivacyPolicyPressed")
    }

    return (
        <View style={styles.root}>
            <Text style={styles.title}>Opret en Konto</Text>
            <CustomInput placeholder='Username' value={username} setValue={setUsername} />
            <CustomInput placeholder='Email' value={email} setValue={setEmail} />
            <CustomInput placeholder='Password' value={password} setValue={setPassword} secureTextEntry={true} />
            <CustomInput placeholder='Repeat Password' value={passwordRepeat} setValue={setPasswordRepeat} secureTextEntry={true} />
            <CustomInput placeholder='Birth Date' value={dateOfBirth} setValue={setDateOfBirth} />
            <CustomButton text='Register' onPress={onRegisterPressed} />
            <Text style={styles.text}>Ved at oprette en konto, accepterer du vores <Text style={styles.link} onPress={onTermsOfUsePressed}>Terms of Use</Text> and <Text style={styles.link} onPress={onPrivacyPolicyPressed}>Privacy Policy</Text></Text>
            <CustomButton text='Do you already have an account? Log in here' onPress={onSignInPressed} type="TERTIARY" />
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