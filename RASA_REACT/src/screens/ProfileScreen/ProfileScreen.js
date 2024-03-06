import React, { useState } from "react";
import { View, Text, Image, StyleSheet, useWindowDimensions, StatusBar, SafeAreaView } from 'react-native';
import Logo from '../../../assets/images/logo.png';
import CustomInput from "../../../components/CustomInput";
import CustomButton from "../../../components/CustomButton";
import { useNavigation, useRoute } from '@react-navigation/native';
import TopNavigationBar from "../../../components/TopNavigationBar";
import LogOutScreen from "../LogOutScreen";
import StepCounter from "../../../components/StepCounter";

const ProfileScreen = () => {

    const route = useRoute();
    const { username } = route.params;

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <TopNavigationBar username={username} />
                <Text style={styles.title}>Template</Text>
                <LogOutScreen />
                <StatusBar barStyle="dark-content" />
                <StepCounter />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({

});

export default ProfileScreen;