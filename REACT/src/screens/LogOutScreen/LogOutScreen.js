import React, { useState } from "react";
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import Logo from '../../assets/images/logos/logo.png';
import CustomInput from "../../components/common/CustomInput";
import CustomButton from "../../components/common/CustomButton";
import { useNavigation } from '@react-navigation/native';
import { rasaServerSocket, nodeServerSocket, disconnectSockets } from "../../components/sockets/SocketManager/SocketManager";
import Navigation from "../Navigation";

const LogOutScreen = () => {

    const navigation = useNavigation();

    const handleLogout = () => {
        disconnectSockets();
        //console.warn("Log Out Successful!");
        navigation.navigate('SignIn');
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

export default LogOutScreen;