import React, { useState } from "react";
import { View, Text, StyleSheet } from 'react-native';
import CustomInput from "../../components/common/CustomInput";
import CustomButton from "../../components/common/CustomButton";
import { useNavigation } from '@react-navigation/native';

const ForgotPasswordScreen = () => {
    const [username, setUsername] = useState('');

    const navigation = useNavigation();

    const onBackToLoginPressed = () => {
        navigation.navigate('SignIn');
    };

    const onSendNewPasswordPressed = async () => {
        try {
            // Call the backend server to send a password reset email
            const response = await fetch('http://localhost:5006/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username }),
            });

            const data = await response.json();
            if (data.status === 'ok') {
                console.log('Password reset email sent');
            } else {
                console.error('Error:', data.error);
            }
        } catch (error) {
            console.error('Failed to reset password:', error);
        }
    };

    return (
        <View style={styles.root}>
            <Text style={styles.title}>Reset Password</Text>
            <CustomInput placeholder='Username' value={username} setValue={setUsername} />
            <CustomButton text='Send' onPress={onSendNewPasswordPressed} />
            <CustomButton text='Back to Log In' onPress={onBackToLoginPressed} type="TERTIARY" />
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
});

export default ForgotPasswordScreen;
