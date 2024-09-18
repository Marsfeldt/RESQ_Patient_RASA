import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { useUserContext } from '../../components/utils/contexts/UserContext';
import { rasaServerSocket, connectSockets, disconnectSockets } from '../../components/sockets/SocketManager/SocketManager';
import { useRoute, useIsFocused } from '@react-navigation/native';
import emitToServerEvent from '../../components/sockets/SocketUtils';
import TopNavigationBar from '../../components/navigation/TopNavigationBar';
import QuestionnaireButtonLayout from '../../components/questionnaire/QuestionnaireButtonLayout';

const ChatWindowScreen = () => {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [sessionID, setSessionID] = useState('');
  const { userUUID } = useUserContext();
  const [questionnaireLayout, setQuestionnaireLayout] = useState(false);
  const [lastBotAnswer, setLastBotAnswer] = useState('');
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const route = useRoute();
  const { username } = route.params;
  const isFocused = useIsFocused();

  const generateUUID = () => `${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;

  const createUserMessage = (text) => ({
    _id: generateUUID(),
    text,
    createdAt: new Date(),
    user: { _id: userUUID },
  });

  useEffect(() => {
    connectSockets();
    if (!socket) {
      setSocket(rasaServerSocket);
      rasaServerSocket.connect();
    }

    return () => {
      disconnectSockets();
    };
  }, []);

  useEffect(() => {
    if (isFocused) {
      emitToServerEvent('interaction_log', {
        UUID: userUUID,
        Username: username,
        InteractionType: 'Navigation',
        InteractionOutput: '-> Chat Screen',
      });
    }
  }, [isFocused, userUUID, username]);

  useEffect(() => {
    if (socket && !sessionID && userUUID) {
      setSessionID(userUUID);
      socket.emit('session_request', { session_id: userUUID });
    }
  }, [socket, sessionID, userUUID]);

  useEffect(() => {
    const handleBotMessage = (data) => {
      const botMessageId = generateUUID();
      const botMessage = {
        _id: botMessageId,
        text: data.text,
        createdAt: new Date(),
        user: { _id: 'bot' },
      };

      setLastBotAnswer(data.text);
      setMessages((previousMessages) => GiftedChat.append(previousMessages, [botMessage]));
      setButtonsDisabled(false);
      setIsLoading(false);
    };

    if (socket) {
      socket.on('bot_uttered', handleBotMessage);

      return () => {
        socket.off('bot_uttered', handleBotMessage);
      };
    } else {
      setSocket(rasaServerSocket);
      rasaServerSocket.connect();
    }
  }, [socket, userUUID]);

  const onSend = (newMessages) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));
    setIsLoading(true);

    if (socket) {
      const userMessage = createUserMessage(newMessages[0].text);
      socket.emit('user_uttered', { message: newMessages[0].text, session_id: sessionID });

      emitToServerEvent('message_from_client', {
        UUID: userUUID,
        Username: username,
        Message: userMessage.text,
        MessageID: userMessage._id,
        IsSystemMessage: 'False',
        MessageType: 'Question',
      });

      emitToServerEvent('interaction_log', {
        UUID: userUUID,
        Username: username,
        InteractionType: 'Send Message (Chat Window)',
        InteractionOutput: userMessage.text,
      });
    }
  };

  // Fonction pour gérer les clics sur les boutons du questionnaire
  const handleQuestionnaireButtonClick = (buttonName) => {
    console.log(`Button clicked: ${buttonName}`);

    // Logique spécifique en fonction du bouton cliqué
    switch (buttonName) {
      case 'Yes':
        // Logique pour le bouton "Yes"
        console.log("You clicked Yes");
        break;
      case 'No':
        // Logique pour le bouton "No"
        console.log("You clicked No");
        break;
      default:
        console.log(`Unknown button: ${buttonName}`);
        break;
    }

    // Désactiver les boutons après un clic pour éviter des clics multiples
    setButtonsDisabled(true);
  };

  const renderAvatar = (props) => {
    const { currentMessage } = props;

    if (currentMessage.user._id === 'bot') {
      return (
        <View style={styles.botAvatarContainer}>
          <Image
            source={require('../../assets/images/icons/woman_stonks_64.png')}
            style={styles.botAvatar}
          />
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <TopNavigationBar username={username} />

      <GiftedChat
        messages={messages}
        onSend={(newMessages) => onSend(newMessages)}
        user={{ _id: sessionID }}
        isTyping={isLoading}
        renderAvatar={renderAvatar}
        textInputStyle={{ color: 'black' }}
      />

      <QuestionnaireButtonLayout
        showButtons={questionnaireLayout}
        onButtonClick={handleQuestionnaireButtonClick} // Utilise la fonction définie
        buttonsDisabled={buttonsDisabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  botAvatarContainer: {
    marginRight: 10,
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

export default ChatWindowScreen;
