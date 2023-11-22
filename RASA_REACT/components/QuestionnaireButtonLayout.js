import React, { useState } from 'react';
import { View, TouchableOpacity, Button, Text, StyleSheet } from 'react-native';

const QuestionnaireButtonLayout = ({ showButtons, onButtonClick }) => {

    return (
        <View>
            {showButtons && (
                <View style={styles.container}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => onButtonClick('Button1')}
                    >
                        <Text style={styles.buttonText}>1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => onButtonClick('Button2')}
                    >
                        <Text style={styles.buttonText}>2</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => onButtonClick('Button3')}
                    >
                        <Text style={styles.buttonText}>3</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => onButtonClick('Button4')}
                    >
                        <Text style={styles.buttonText}>4</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => onButtonClick('Button5')}
                    >
                        <Text style={styles.buttonText}>5</Text>
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
        backgroundColor: '#3498db',
        padding: 15,
        borderRadius: 5,
        width: 50, // Adjust the width as needed
        fontSize: 20,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default QuestionnaireButtonLayout;