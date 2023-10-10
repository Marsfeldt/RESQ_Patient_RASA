import React, { useState } from "react";
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import Logo from '../../../assets/images/logo.png';
import CustomInput from "../../../components/CustomInput";
import CustomButton from "../../../components/CustomButton";
import { useNavigation } from '@react-navigation/native';

const SignUpScreen = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');

    const { height } = useWindowDimensions();

    const navigation = useNavigation();

    const onSignInPressed = () => {
        navigation.navigate('SignIn');
    }

    const onForgotPasswordPressed = () => {
        console.warn("Forgot Password")
        navigation.navigate('ForgotPassword');
    }

    const onSignUpPressed = () => {
        console.warn("On SignUp")
    }

    const onRegisterPressed = () => {
        console.warn("OnRegisterPressed")
    }

    const onTermsOfUsePressed = () => {
        console.warn("onTermsOfUsePressed")
    }

    const onPrivacyPolicyPressed = () => {
        console.warn("onPrivacyPolicyPressed")
    }

    return (
        <View style={styles.root}>
            <Text style={styles.title}>Opret en Konto</Text>
            <CustomInput placeholder='Brugernavn' value={username} setValue={setUsername} />
            <CustomInput placeholder='Email' value={email} setValue={setEmail} />
            <CustomInput placeholder='Password' value={password} setValue={setPassword} secureTextEntry={true} />
            <CustomInput placeholder='Repeat Password' value={passwordRepeat} setValue={setPasswordRepeat} secureTextEntry={true} />
            <CustomButton text='Register' onPress={onRegisterPressed} />
            <Text style={styles.text}>Ved at oprette en konto, accepterer du vores <Text style={styles.link} onPress={onTermsOfUsePressed}>Terms of Use</Text> og vores <Text style={styles.link} onPress={onPrivacyPolicyPressed}>Privacy Policy</Text></Text>
            <CustomButton text='Har du allerede en konto, log ind her' onPress={onSignInPressed} type="TERTIARY" />
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