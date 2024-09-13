import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet, useWindowDimensions, Button, BackHandler } from 'react-native';
import Logo from '../../assets/images/icons/woman_stonks.png';
import CustomButton from "../../components/common/CustomButton";
import { useUserContext } from '../../components/utils/contexts/UserContext';
import emitToServerEvent from "../../components/sockets/SocketUtils";
import { useNavigation, useRoute } from '@react-navigation/native';

const WelcomeBackScreen = () => {
    const { height } = useWindowDimensions(); // Get height from useWindowDimensions
    const route = useRoute();
    const { userUUID } = useUserContext();
    const { username } = route.params;

    const CloseApplicationButton = () => {
        BackHandler.exitApp();
    }

    useEffect(() => {
        emitToServerEvent('interaction_log', {
            UUID: userUUID,
            Username: username,
            InteractionType: 'Navigation',
            InteractionOutput: '-> Welcome Back Screen',
        });
    }, []);

    return (
        <View style={styles.root}>
            <Image source={Logo} style={[styles.logo, { height: height * 0.3 }]} resizeMode="contain" />
            <View style={styles.content}>
                <Text style={styles.title}>Welcome Back!</Text>
                <Text style={styles.description}>Please do not tell others about this message in the experiment. We just wanted to see if you actually came back. The experiment is now over, we wish you a great day!</Text>
                <CustomButton text='Close Application' onPress={CloseApplicationButton} />
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
