import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, useWindowDimensions, StatusBar, SafeAreaView } from 'react-native';
import Logo from '../../../assets/images/logo.png';
import CustomInput from "../../../components/CustomInput";
import CustomButton from "../../../components/CustomButton";
import { useNavigation, useRoute } from '@react-navigation/native';
import TopNavigationBar from "../../../components/TopNavigationBar";
import LogOutScreen from "../LogOutScreen";
import { useUserContext } from '../../../components/UserContext';
import emitToServerEvent from "../../../components/SocketUtils";


const ProfileScreen = () => {

    const route = useRoute();
    const { username } = route.params;
    const { userUUID } = useUserContext(); // Get userUUID from the context

    useEffect(() => {
        emitToServerEvent('interaction_log', {
            UUID: userUUID,
            Username: username,
            InteractionType: 'Navigation',
            InteractionOutput: '-> Profile Screen',
        });
    }, []);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <TopNavigationBar username={username} />
                <Text style={styles.title}>Template</Text>
                <LogOutScreen />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});

export default ProfileScreen;