import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { useUserContext } from '../../../components/UserContext';
import { rasaServerSocket, pythonServerSocket, connectSockets, disconnectSockets } from '../../../components/SocketManager/SocketManager';
import { useRoute, useIsFocused } from '@react-navigation/native';
import emitToServerEvent from '../../../components/SocketUtils';
import TopNavigationBar from '../../../components/TopNavigationBar';
import QuestionnaireButtonLayout from '../../../components/QuestionnaireButtonLayout';

const ChatWindowScreen = () => {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [sessionID, setSessionID] = useState('');
  const { userUUID } = useUserContext(); // Get userUUID from the context
  const [questionnaireLayout, setQuestionnaireLayout] = useState(false);
  const [lastBotAnswer, setLastBotAnswer] = useState('');

  const route = useRoute();
  const { username } = route.params;

  const isFocused = useIsFocused(); // Hook to check if the screen is focused

  const generateUUID = () => `${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;

  const createUserMessage = (text) => ({
    _id: generateMessageID(),
    text,
    createdAt: new Date(),
    user: { _id: userUUID },
  });

  const handleQuestionnaireButtonClick = (buttonName) => {
    const handleButtonClickLogic = (messageText) => {
      const messageId = generateUUID();
      const messageSentTime = new Date();

      const newMessage = {
        _id: messageId,
        text: messageText,
        createdAt: new Date(),
        user: { _id: userUUID },
      };

      setMessages(previousMessages => GiftedChat.append(previousMessages, [newMessage]));

      rasaServerSocket.emit('user_uttered', { session_id: userUUID, message: messageText }, () => {
        
        emitToServerEvent('message_from_client', {
          UUID: userUUID,
          Username: username,
          Message: messageText,
          MessageID: messageId,
          IsSystemMessage: 'False',
          MessageType: 'Answer'
        });
      });

      emitToServerEvent('questionnaire_question_answered', {
        UUID: userUUID,
        Username: username,
        UserResponse: messageText,
        QuestionID: generateUUID(),
        QuestionText: lastBotAnswer,
        QuestionType: 'Likert (1-5)',
      });
    };

    switch (buttonName) {
      case 'Button1':
      case 'Button2':
      case 'Button3':
      case 'Button4':
      case 'Button5':
        handleButtonClickLogic(buttonName.slice(-1));
        break;
      default:
        console.log(`Button ${buttonName} not handled`);
    }
  };

  // Connect the socket when the component mounts
  useEffect(() => {
    connectSockets();

    return () => {
      disconnectSockets();
    };
  }, []);

  useEffect(() => {
    if (isFocused) {
      // This will run every time the screen is focused
      emitToServerEvent('interaction_log', {
        UUID: userUUID,
        Username: username,
        InteractionType: 'Navigation',
        InteractionOutput: '-> Chat Screen',
      });
    }
  }, [isFocused, userUUID, username]);

  useEffect(() => {
    // Establish a unique session when the component mounts
    if (socket && !sessionID && userUUID) {
      setSessionID(userUUID); // Set userUUID as sessionID
      socket.emit('session_request', { session_id: userUUID }); // This opens a unique session with RASA with a specified ID
      pythonServerSocket.emit('connection_log', { UUID: userUUID, Username: username, Connection: rasaServerSocket.id, ConnectionType: 'Session Request (RASA)' });
      console.log('attempting to establish session request ' + userUUID)
    }
  }, [socket, sessionID, userUUID, username]);

  useEffect(() => {
    // Add event listener for bot messages
    const handleBotMessage = (data) => {
      const botMessageId = generateMessageID();

      const botMessage = {
        _id: botMessageId,
        text: data.text,
        createdAt: new Date(),
        user: { _id: 'bot' },
      };

      setLastBotAnswer(data.text);

      if (/afsluttet/.test(data.text)) {
        setQuestionnaireLayout(false);
        console.log('Disabling questionnaire layout.');
      }

      if (typeof data.text === 'string' && /spørgeskema/.test(data.text)) {
        setQuestionnaireLayout(true);
        console.log('Enabling questionnaire layout.');
      }

      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [botMessage])
      );

      emitToServerEvent('message_from_client', {
        UUID: userUUID,
        Username: 'RASA BOT',
        Message: data.text,
        MessageID: botMessageId,
        IsSystemMessage: 'False',
        MessageType: 'Bot Answer'
      });
    };

    if (socket) {
      socket.on('bot_uttered', handleBotMessage);

      return () => {
        socket.off('bot_uttered', handleBotMessage);
      };
    } else {
      // Socket is not available, reconnect
      setSocket(rasaServerSocket);
      rasaServerSocket.connect();
    }
  }, [socket, userUUID]);

  const onSend = (newMessages) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );

    if (socket) {
      const userMessage = createUserMessage(newMessages[0].text);
      socket.emit(
        'user_uttered',
        {
          message: newMessages[0].text,
          session_id: sessionID,
        },
        () => {
          // Handle acknowledgment if needed
        }
      );
      console.log(`${username} sending message ${userMessage.text} to RASA`);
      emitToServerEvent('message_from_client', {
        UUID: userUUID,
        Username: username,
        Message: userMessage.text,
        MessageID: userMessage._id,
        IsSystemMessage: 'False',
        MessageType: 'Question'
      });

      emitToServerEvent('interaction_log', {
        UUID: userUUID,
        Username: username,
        InteractionType: 'Send Message (Chat Window)',
        InteractionOutput: userMessage.text,
      });
    }
  };

  const generateMessageID = () =>
    Math.round(Math.random() * 1000000).toString(); // Generate a simple random ID

  return (
    <View style={styles.container}>
      <TopNavigationBar username={username} />
      <QuestionnaireButtonLayout
        showButtons={questionnaireLayout}
        onButtonClick={handleQuestionnaireButtonClick}
      />
      <GiftedChat
        messages={messages}
        onSend={(newMessages) => onSend(newMessages)}
        user={{ _id: sessionID }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ChatWindowScreen;