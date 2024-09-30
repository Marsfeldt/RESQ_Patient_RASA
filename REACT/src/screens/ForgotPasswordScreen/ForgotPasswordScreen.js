import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from 'react-native';
import CustomInput from "../../components/common/CustomInput";
import CustomButton from "../../components/common/CustomButton";
import { rasaServerSocket, nodeServerSocket, connectSockets, disconnectSockets, reconnectSockets, forgotpasswordSockets} from "../../components/sockets/SocketManager/SocketManager";
import { useNavigation } from '@react-navigation/native';
import emitToServerEvent from "../../components/sockets/SocketUtils"; // Utilisation de la fonction d'émission d'événement

const ForgotPasswordScreen = () => {
    const [mail, setMail] = useState(''); // Ici tu récupères l'email
    const [message, setMessage] = useState(''); // Pour afficher les messages d'erreur ou succès
    const [foundUsername, setFoundUsername] = useState(''); // Pour afficher le username trouvé dans la BDD
    const navigation = useNavigation();

    useEffect(() => {
        const handleResetResponse = (data) => {
            if (data.error) {
                setMessage("User not found or error occurred.");
            } else if (data.username) {
                setFoundUsername(data.username); // Sauvegarde le nom d'utilisateur trouvé
                setMessage(`User found: ${data.username}. A reset email has been sent.`);
            }
        };

        // Écoute l'événement de réponse du serveur
        if (nodeServerSocket) {
            nodeServerSocket.on('reset_password_response', handleResetResponse);
        }

        return () => {
            nodeServerSocket.off('reset_password_response', handleResetResponse);
        };
    }, []);

    const onSendNewPasswordPressed = () => {
    emitToServerEvent('interaction_log', {
                Username: "Anonymous User",
                InteractionType: 'Button Press',
                InteractionOutput: 'Reset Password',
            });
    console.log('Etape_1');
        if (nodeServerSocket.connected) {
            console.log('Etape_2');
            // Émission de l'événement pour récupérer les infos de l'utilisateur via le serveur
            nodeServerSocket.emit('reset_password', mail);
            console.log('Etape_3');
        } else {
            console.log('Etape_0');
            setMessage("Please enter your username or email.");
        }
    };

    const onBackToLoginPressed = () => {
        navigation.navigate('SignIn');
    };

    return (
        <View style={styles.root}>
            <Text style={styles.title}>Reset Password</Text>
            <CustomInput placeholder='Username or Email' value={mail} setValue={setMail} />
            <CustomButton text='Send' onPress={onSendNewPasswordPressed} />
            <CustomButton text='Back to Log In' onPress={onBackToLoginPressed} type="TERTIARY" />
            {message ? <Text style={styles.message}>{message}</Text> : null}
            {foundUsername ? <Text style={styles.username}>Found User: {foundUsername}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#051C60',
        margin: 10,
    },
    message: {
        color: 'red',
        marginTop: 10,
    },
    username: {
        color: 'green',
        marginTop: 10,
        fontWeight: 'bold',
    },
});

export default ForgotPasswordScreen;
