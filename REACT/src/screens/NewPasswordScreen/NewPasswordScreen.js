import React, { useState } from "react";
import { View, Text, StyleSheet } from 'react-native';
import CustomInput from "../../components/common/CustomInput";
import CustomButton from "../../components/common/CustomButton";

const NewPasswordScreen = () => {
    const [code, setCode] = useState('');  // This is the reset token
    const [newPassword, setNewPassword] = useState('');

    const onSignInPressed = () => {
        // Navigate back to the login screen
        // navigation.navigate('SignIn');
    };

    const onGodkendPress = async () => {
        try {
            console.log('Sending request to reset password...');
            const response = await fetch('http://localhost:5006/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resetToken: code,
                    newPassword: newPassword,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            if (data.status === 'ok') {
                console.log('Password reset successful');
                // Handle success
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
            <CustomInput placeholder='Enter the reset code' value={code} setValue={setCode} />
            <CustomInput placeholder='Enter your new password' value={newPassword} setValue={setNewPassword} secureTextEntry />
            <CustomButton text='Confirm' onPress={onGodkendPress} />
            <CustomButton text='Back to Log In' onPress={onSignInPressed} type="TERTIARY" />
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

export default NewPasswordScreen;
