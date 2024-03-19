import React, { useEffect, useState, useCallback } from 'react';
import { View, Image, Platform, StyleSheet } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import TopNavigationBar from '../../../components/TopNavigationBar';
import { rasaServerSocket, pythonServerSocket, connectSockets, disconnectSockets, reconnectSockets } from '../../../components/SocketManager/SocketManager';
import { useRoute } from '@react-navigation/native';
import { saveMessages, loadMessages } from '../../../components/AsyncStorageUtils';
import QuestionnaireButtonLayout from '../../../components/QuestionnaireButtonLayout';

const ChatWindowScreen = () => {
  const route = useRoute();
  const { username } = route.params;
  const [userUUID, setUserUUID] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [questionnaireLayout, setQuestionnaireLayout] = useState(false);

  // Questionnaire Related States
  const [lastBotAnswer, setLastBotAnswer] = useState('');

  const handleQuestionnaireButtonClick = (buttonName) => {
    const handleButtonClickLogic = (messageText) => {
      setIsLoading(true);
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
        const acknowledgmentTime = new Date() - messageSentTime;
        console.log('Acknowledgment time:', acknowledgmentTime, 'ms');

        setIsLoading(false);

        sendDataThroughDataSocket(messageText, messageId, 'False', 'Question');
      });

      pythonServerSocket.emit('questionnaire_question_answered', {
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

  const loadEarlierMessages = useCallback(async () => {
    try {
      const storedMessages = await loadMessages();

      if (storedMessages) {
        const formattedMessages = storedMessages.map(msg => ({ ...msg, createdAt: new Date(msg.createdAt) }));
        const newMessages = formattedMessages.filter(msg => !messages.some(existingMsg => existingMsg._id === msg._id));

        if (newMessages.length > 0) {
          setMessages(previousMessages => GiftedChat.prepend(previousMessages, newMessages));
        } else {
          console.log('No new earlier messages found.');
        }
      } else {
        console.log('No earlier messages found.');
      }
    } catch (error) {
      console.error('Error loading earlier messages:', error);
    }
  }, [messages]);

  const generateUUID = () => `${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;

  const simulateTypingDelay = (message, delay) => new Promise(resolve => setTimeout(() => resolve(message), delay));

  const sendDataThroughDataSocket = (message, messageId, isSystemMessage, messageType) => {
    pythonServerSocket.emit('message_from_client', {
      uuid: userUUID,
      username,
      message,
      messageId,
      isSystemMessage,
      messageType,
    });
  };

  const socketConnectionEvent = () => {
    const logConnection = (serverSocket, serverName) => {
      serverSocket.on('connect', () => {
        serverSocket.emit('session_request', { session_id: userUUID });
        console.log(`${serverSocket.id} ${serverName} Server: Connected to server (ChatWindow Screen)`);
      });

      serverSocket.on('disconnect', () => {
        console.log(`${serverSocket.id} ${serverName} Server: Disconnected from server (ChatWindow Screen)`);
      });
    };

    logConnection(rasaServerSocket, 'RASA');
    logConnection(pythonServerSocket, 'Python');
  };

  useEffect(() => {
    socketConnectionEvent();
    reconnectSockets();

    pythonServerSocket.emit('fetch_user_information', username);

    const handleUserInformation = (data) => {
      const { fetchedUUID } = data;
      setUserUUID(fetchedUUID);
    };

    pythonServerSocket.on('user_information_fetched', handleUserInformation);

    rasaServerSocket.on('bot_uttered', async (data) => {
      const botText = data.text;
      const messageId = generateUUID();
      setLastBotAnswer(botText);

      const botMessage = {
        _id: messageId,
        text: botText,
        createdAt: new Date(),
        user: { _id: 'bot' },
      };

      setIsLoading(true);

      const typingDelay = 500;
      const delayedBotMessage = await simulateTypingDelay(botMessage, typingDelay);

      const botMessageReceivedTime = new Date();
      const messageLatency = botMessageReceivedTime - botMessage.createdAt;
      console.log('Message latency:', messageLatency, 'ms');

      setMessages(previousMessages => GiftedChat.append(previousMessages, [delayedBotMessage]));

      if (/afsluttet/.test(botText)) {
        setQuestionnaireLayout(false);
        console.log('Disabling questionnaire layout.');
      }

      if (typeof botText === 'string' && /spørgeskema/.test(botText)) {
        setQuestionnaireLayout(true);
        console.log('Enabling questionnaire layout.');
      }

      setIsLoading(false);

      sendDataThroughDataSocket(botText, messageId, 'False', 'Bot Answer');
    });

    return () => {
      rasaServerSocket.off('bot_uttered');
      rasaServerSocket.off('connect');
      rasaServerSocket.off('disconnect');
      pythonServerSocket.off('fetch_user_information');
      pythonServerSocket.off('user_information_fetched', handleUserInformation);
      pythonServerSocket.off('connect');
      pythonServerSocket.off('disconnect');
      disconnectSockets();
    };
  }, [userUUID]);

  const appendAndSaveMessages = (newMessages) => {
    const updatedMessages = GiftedChat.append(messages, newMessages);
    setMessages(updatedMessages);
    saveMessages(updatedMessages);
  };

  const onSend = (newMessages) => {
    setMessages(previousMessages => {
      const updatedMessages = GiftedChat.append(previousMessages, newMessages);
      saveMessages(updatedMessages);
      return updatedMessages;
    });

    const text = newMessages[0].text;

    if (rasaServerSocket && rasaServerSocket.connected) {
      if (text.trim() !== '') {
        setIsLoading(true);
        const messageId = generateUUID();
        const newMessage = {
          _id: messageId,
          text,
          createdAt: new Date(),
          user: { _id: userUUID },
        };

        console.log('Sending message to Rasa:', newMessage);

        const messageSentTime = new Date();

        rasaServerSocket.emit('user_uttered', { session_id: userUUID, message: text }, () => {
          const acknowledgmentTime = new Date() - messageSentTime;
          console.log('Acknowledgment time:', acknowledgmentTime, 'ms');
          setIsLoading(false);
          sendDataThroughDataSocket(text, messageId, 'False', 'Question');
        });

        saveMessages([...messages, ...newMessages]);
      } else {
        const newMessage = {
          _id: generateUUID(),
          text: 'Din besked er tom',
          createdAt: new Date(),
          user: { _id: 'bot' },
        };

        appendAndSaveMessages(newMessage);
      }
    } else {
      const newMessage = {
        _id: generateUUID(),
        text: 'Du er ikke tilsluttet til serveren, genopretter forbindelse...',
        createdAt: new Date(),
        user: { _id: 'bot' },
      };
      reconnectSockets();
      appendAndSaveMessages(newMessage);
    }
  };

  const renderAvatar = ({ currentMessage }) => {
    if (currentMessage.user._id === 'bot') {
      const botAvatarPath = Platform.select({
        android: require('../../../assets/bot.png'), // Android dependency
        ios: require('../../../assets/bot.png'), // IOS dependency
      });

      return (
        <Image
          source={botAvatarPath}
          style={{ width: 40, height: 40, borderRadius: 20 }}
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      <TopNavigationBar username={username} />
      <QuestionnaireButtonLayout
        showButtons={questionnaireLayout}
        onButtonClick={handleQuestionnaireButtonClick}
      />
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{ _id: userUUID }}
        isTyping={isLoading}
        renderAvatar={renderAvatar}
        loadEarlier={true}
        onLoadEarlier={loadEarlierMessages}
        placeholder="Skriv en besked..."
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBFC',
  },
});

export default ChatWindowScreen;
