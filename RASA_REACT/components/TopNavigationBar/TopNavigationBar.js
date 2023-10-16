import { block } from '@onflow/fcl';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const TopNavigationBar = () => {

    const navigation = useNavigation();

    const onChatNavigate = () => {
        navigation.navigate('ChatWindow');
    }

    const onProfileNavigate = () => {
        navigation.navigate('Profile');
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={onChatNavigate} style={styles.button}>
                <Text style={styles.buttonText}>Chat</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Username</Text>
            <TouchableOpacity onPress={onProfileNavigate} style={styles.button}>
                <Text style={styles.buttonText}>Profil</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#2B57AD',
        height: 50,
        paddingHorizontal: 10,
    },
    button: {
        padding: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    title: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default TopNavigationBar;