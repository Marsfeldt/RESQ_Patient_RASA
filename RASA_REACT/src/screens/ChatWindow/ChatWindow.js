import React, { useEffect, useState, useCallback } from 'react';
import { View, Image, Platform, StyleSheet } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import TopNavigationBar from '../../../components/TopNavigationBar';
import {
  rasaServerSocket,
  pythonServerSocket,
  connectSockets,
  disconnectSockets,
  reconnectSockets,
} from '../../../components/SocketManager/SocketManager';
import { useRoute } from '@react-navigation/native';
import { saveMessages, loadMessages } from '../../../components/AsyncStorageUtils';

const ChatWindowScreen = () => {
  const route = useRoute();
  const { username } = route.params;
  const [userUUID, setUserUUID] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Function for loading earlier messages in the chat conversation by loading them from the phones local storage
  const loadEarlierMessages = useCallback(async () => {
    try {
      const storedMessages = await loadMessages();

      if (storedMessages) {
        const formattedMessages = storedMessages.map((msg) => ({
          ...msg,
          createdAt: new Date(msg.createdAt),
        }));

        // This is used to ensure that we do not load duplicate messages by checking whether the message has already been loaded
        const newMessages = formattedMessages.filter(
          (msg) => !messages.some((existingMsg) => existingMsg._id === msg._id)
        );

        // Check if we have loaded all available messages
        if (newMessages.length > 0) {
          setMessages((previousMessages) =>
            GiftedChat.prepend(previousMessages, newMessages)
          );
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

  // function to generate a random UUID (Example, it looks like this: b16a2906-5f82-6c9e-d79d-cc3a65960f43)
  const generateUUID = () =>
    `${Math.random().toString(36).substring(2, 15)}-${Math.random()
      .toString(36)
      .substring(2, 15)}`;

  // Function to simulate a typing delay for the bot, because the speed is too fast :P
  const simulateTypingDelay = (message, delay) =>
    new Promise((resolve) => setTimeout(() => resolve(message), delay));

  // Function which handles information being sent from the front-end to the back-end python server
  const sendDataThroughDataSocket = (
    message,
    messageId,
    isSystemMessage,
    messageType
  ) => {
    pythonServerSocket.emit('message_from_client', {
      uuid: userUUID,
      username,
      message,
      messageId,
      isSystemMessage,
      messageType,
    });
  };

  // Function to log connection events from the RASA and PYTHON server, used for debugging
  const socketConnectionEvent = () => {
    const logConnection = (serverSocket, serverName) => {
      serverSocket.on('connect', () => {
        console.log(
          `${pythonServerSocket.id} ${serverName} Server: Connected to server (ChatWindow Screen)`
        );
      });

      serverSocket.on('disconnect', () => {
        console.log(
          `${pythonServerSocket.id} ${serverName} Server: Disconnected from server (ChatWindow Screen)`
        );
      });
    };

    logConnection(rasaServerSocket, 'RASA');
    logConnection(pythonServerSocket, 'Python');
  };

  useEffect(() => {
    // Calling reconnectsockets to ensure that if we are not already connected we connect, so that the chatbot is functional
    reconnectSockets();
    socketConnectionEvent();

    // We send information to the python server to fetch information from the currently logged in user
    pythonServerSocket.emit('fetch_user_information', username);

    // Once the information is successfully retrieved we set the current UUID to that of the logged in user
    pythonServerSocket.on('user_information_fetched', (data) => {
      const { fetchedUsername, fetchedUUID } = data;
      setUserUUID(fetchedUUID);
    });

    // This handles the event from whenever the bot gets a question
    rasaServerSocket.on('bot_uttered', async (data) => {
      const botText = data.text;
      const messageId = generateUUID();

      // Message which follows the layout of the library 'GiftedChat'
      const botMessage = {
        _id: messageId,
        text: botText,
        createdAt: new Date(),
        user: { _id: 'bot' },
      };

      setIsLoading(true);

      const typingDelay = 500;

      const delayedBotMessage = await simulateTypingDelay(
        botMessage,
        typingDelay
      );

      // Two variables that calculates the recieved time and the latency of when the message was retrieved
      const botMessageReceivedTime = new Date();
      const messageLatency = botMessageReceivedTime - botMessage.createdAt;

      console.log('Message latency:', messageLatency, 'ms');

      // Add the message to the chat window by appending it through the GiftedChat library
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [delayedBotMessage])
      );

      setIsLoading(false);

      // Sending the message from the bot to the backend for database storing
      sendDataThroughDataSocket(
        botText,
        messageId,
        'False',
        'Bot Answer'
      );
    });

    return () => {
      // Makes sure to remove all the listeners whenever the ChatWindow component unmounts as to ensure no server errors
      rasaServerSocket.off('bot_uttered');
      rasaServerSocket.off('connect');
      rasaServerSocket.off('disconnect');
      pythonServerSocket.off('fetch_user_information');
      pythonServerSocket.off('user_information_fetched');
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

  // Function which is called whenever the user is pressing the 'Send' button in the chat window
  const onSend = (newMessages) => {
    setMessages((previousMessages) => {
      const updatedMessages = GiftedChat.append(
        previousMessages,
        newMessages
      );

      saveMessages(updatedMessages);

      return updatedMessages;
    });

    const text = newMessages[0].text;

    // Makes sure that we are connected before we attempt to send the message to the bot
    if (rasaServerSocket && rasaServerSocket.connected) {
      if (text.trim() !== '') {
        setIsLoading(true);

        const messageId = generateUUID();

        const newMessage = {
          _id: messageId,
          text,
          createdAt: new Date(),
          user: {
            _id: rasaServerSocket.id,
          },
        };

        console.log('Sending message to Rasa:', newMessage);

        const messageSentTime = new Date();

        // This emits the users message from where the RASA server is listening for the users question on the event 'user_uttered'
        rasaServerSocket.emit(
          'user_uttered',
          { session_id: rasaServerSocket.id, message: text },
          () => {
            const acknowledgmentTime =
              new Date() - messageSentTime;
            console.log('Acknowledgment time:', acknowledgmentTime, 'ms');

            setIsLoading(false);

            sendDataThroughDataSocket(
              text,
              messageId,
              'False',
              'Question'
            );
          }
        );
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

  // Function responsible for rendering the bots avatar on its messages
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

  // The ChatWindow rendering layout
  return (
    <View style={styles.container}>
      <TopNavigationBar username={username} />
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
  rasaTypingIndicator: {
    color: 'black',
    fontSize: 18,
    alignSelf: 'center',
    marginVertical: 8,
  },
});

export default ChatWindowScreen;
