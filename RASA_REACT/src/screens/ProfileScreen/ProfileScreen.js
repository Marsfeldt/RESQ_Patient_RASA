import React, { useState } from "react";
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import Logo from '../../../assets/images/logo.png';
import CustomInput from "../../../components/CustomInput";
import CustomButton from "../../../components/CustomButton";
import { useNavigation } from '@react-navigation/native';
import TopNavigationBar from "../../../components/TopNavigationBar";

const ProfileScreen = () => {

    return (
        <View>
            <TopNavigationBar />
            <Text style={styles.title}>Template</Text>
        </View>
    );
};

const styles = StyleSheet.create({

});

export default ProfileScreen;