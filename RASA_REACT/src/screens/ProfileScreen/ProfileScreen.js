import React, { useState } from "react";
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import Logo from '../../../assets/images/logo.png';
import CustomInput from "../../../components/CustomInput";
import CustomButton from "../../../components/CustomButton";
import { useNavigation, useRoute } from '@react-navigation/native';
import TopNavigationBar from "../../../components/TopNavigationBar";
import LogOutScreen from "../LogOutScreen";

const ProfileScreen = () => {

    const route = useRoute();
    const { username } = route.params;

    return (
        <View>
            <TopNavigationBar username={username} />
            <Text style={styles.title}>Template</Text>
            <LogOutScreen />
        </View>
    );
};

const styles = StyleSheet.create({

});

export default ProfileScreen;