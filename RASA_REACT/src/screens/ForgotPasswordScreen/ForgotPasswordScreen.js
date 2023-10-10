import React, { useState } from "react";
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import Logo from '../../../assets/images/logo.png';
import CustomInput from "../../../components/CustomInput";
import CustomButton from "../../../components/CustomButton";
import { useNavigation } from '@react-navigation/native';

const ForgotPasswordScreen = () => {
    const [username, setUsername] = useState('');

    const navigation = useNavigation();

    const onBackToLoginPressed = () => {
        navigation.navigate('SignIn');
    }

    const onSendNewPasswordPressed = () => {
        console.warn("onSendNewPasswordPressed")
    }

    return (
        <View style={styles.root}>
            <Text style={styles.title}>Reset Password</Text>
            <CustomInput placeholder='Brugernavn' value={username} setValue={setUsername} />
            <CustomButton text='Send' onPress={onSendNewPasswordPressed} />
            <CustomButton text='Tilbage til Log ind' onPress={onBackToLoginPressed} type="TERTIARY" />
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

export default ForgotPasswordScreen;