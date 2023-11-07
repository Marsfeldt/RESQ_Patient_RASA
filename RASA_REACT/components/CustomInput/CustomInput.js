import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';


const CustomInput = ({ value, setValue, placeholder, secureTextEntry }) => {
    // Theme variables
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    const styles = StyleSheet.create({
        container: {
            backgroundColor: isDarkMode ? 'black' : 'white',
            width: '100%',
            borderColor: isDarkMode ? 'gray' : '#e8e8e8',
            borderWidth: 1,
            borderRadius: 5,
            paddingHorizontal: 10,
            marginVertical: 5,
        },
        input: {
            color: isDarkMode ? 'white' : 'black',
        },
    });

    return (
        <View style={styles.container}>
            <TextInput
                value={value}
                onChangeText={setValue}
                placeholder={placeholder}
                placeholderTextColor={isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'}
                style={styles.input}
                secureTextEntry={secureTextEntry}
            />
        </View>
    );
};

export default CustomInput