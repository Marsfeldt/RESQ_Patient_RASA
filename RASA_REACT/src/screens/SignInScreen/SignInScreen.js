import React, { useState } from "react";
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import Logo from '../../../assets/images/logo.png';
import CustomInput from "../../../components/CustomInput";
import CustomButton from "../../../components/CustomButton";

const SignInScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const { height } = useWindowDimensions();

    const onSignInPressed = () => {
        console.warn("Sign In")
    }

    const onFrogotPasswordPressed = () => {
        console.warn("Forgot Password")
    }

    const onSignUpPressed = () => {
        console.warn("On SignUp")
    }

    return (
        <View style={styles.root}>
            <Image source={Logo} style={[styles.logo, { height: height * 0.3 }]} resizeMode="contain" />
            <CustomInput placeholder='Brugernavn' value={username} setValue={setUsername} />
            <CustomInput placeholder='Password' value={password} setValue={setPassword} secureTextEntry={true} />
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