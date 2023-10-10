import React, { useState } from "react";
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import Logo from '../../../assets/images/logo.png';
import CustomInput from "../../../components/CustomInput";
import CustomButton from "../../../components/CustomButton";

const NewPasswordScreen = () => {
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');


    const onSignInPressed = () => {
        console.warn("OnSendPress")
    }

    const onGodkendPress = () => {
        console.warn("OnSendPress")
    }

    return (
        <View style={styles.root}>
            <Text style={styles.title}>Reset Password</Text>
            <CustomInput placeholder='Kode' value={code} setValue={setCode} />
            <CustomInput placeholder='Indtast dit nye kodeord' value={newPassword} setValue={setNewPassword} />
            <CustomButton text='Godkend' onPress={onGodkendPress} />
            <CustomButton text='Tilbage til Log ind' onPress={onSignInPressed} type="TERTIARY" />
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

export default NewPasswordScreen;