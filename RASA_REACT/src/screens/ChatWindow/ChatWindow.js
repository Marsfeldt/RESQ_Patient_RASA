import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { useUserContext } from '../../../components/UserContext';
import { rasaServerSocket, pythonServerSocket, connectSockets, disconnectSockets } from '../../../components/SocketManager/SocketManager';
import { useRoute, useIsFocused } from '@react-navigation/native';
import emitToServerEvent from '../../../components/SocketUtils';
import TopNavigationBar from '../../../components/TopNavigationBar';

const ChatWindowScreen = () => {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [sessionID, setSessionID] = useState('');
  const { userUUID } = useUserContext(); // Get userUUID from the context

  const route = useRoute();
  const { username } = route.params;

  const isFocused = useIsFocused(); // Hook to check if the screen is focused

  const createUserMessage = (text) => ({
    _id: generateMessageID(),
    text,
    createdAt: new Date(),
    user: { _id: userUUID },
  });

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