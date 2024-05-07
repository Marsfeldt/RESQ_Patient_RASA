import React, { useState } from 'react';
import { View, TouchableOpacity, Button, Text, StyleSheet } from 'react-native';

const QuestionnaireButtonLayout = ({ showButtons, onButtonClick, buttonsDisabled }) => {

    return (
        <View>
            {showButtons && (
                <View style={styles.container}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => onButtonClick('Yes')}
                        disabled={buttonsDisabled}
                    >
                        <Text style={styles.buttonText}>Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => onButtonClick('No')}
                        disabled={buttonsDisabled}
                    >
                        <Text style={styles.buttonText}>No</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 10,
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#0084FF',
        padding: 15,
        borderRadius: 5,
        width: 170, // Adjust the width as needed
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    buttonAbbreviation: {
        color: 'white',
        fontSize: 12,
        marginTop: 5,
    },
});

export default QuestionnaireButtonLayout;