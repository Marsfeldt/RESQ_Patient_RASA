import React from "react";
import { View, StyleSheet } from 'react-native';
import CustomButton from "../../components/common/CustomButton";
import { useNavigation } from '@react-navigation/native';

const LogOutScreen = () => {

    const navigation = useNavigation();

    const handleLogout = async () => {
        try {
            // Send a request to the backend to handle logout and disconnect sockets
            await fetch('http://localhost:5006/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // After successful logout, navigate back to SignIn screen
            navigation.navigate('SignIn');
        } catch (error) {
            console.error('Failed to log out:', error);
        }
    }

    return (
        <View style={styles.root}>
            <CustomButton text='Log Out' onPress={handleLogout} />
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        alignItems: 'center',
        padding: 20,
    },
});

export default LogOutScreen;
