import React from "react";
import { View, Text, Image, StyleSheet, useWindowDimensions, Button } from 'react-native';
import Logo from '../../../assets/images/woman_stonks.png';
import CustomButton from "../../../components/CustomButton";

const WelcomeBackScreen = () => {
    const { height } = useWindowDimensions(); // Get height from useWindowDimensions

    const CloseApplicationButton = () => {
        console.log("Closed Application")
    }

    return (
        <View style={styles.root}>
            <Image source={Logo} style={[styles.logo, { height: height * 0.3 }]} resizeMode="contain" />
            <View style={styles.content}>
                <Text style={styles.title}>Velkommen Tilbage!</Text>
                <Text style={styles.description}>Fortæl venligst ikke andre i forsøget om denne besked, Vi ville bare se om du faktisk kom tilbage, forsøget er nu slut og du må have en rigtig god dag!</Text>
                <CustomButton text='Luk Applikationen' onPress={CloseApplicationButton} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#ffffff', // Set background color if needed
    },
    logo: {
        width: '70%',
        maxHeight: 300,
        maxWidth: 200,
    },
    content: {
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#051C60',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        color: 'gray',
        marginBottom: 20,
    },
});

export default WelcomeBackScreen;
