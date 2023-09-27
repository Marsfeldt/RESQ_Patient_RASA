import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import io from 'socket.io-client';
import { GiftedChat } from 'react-native-gifted-chat';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [messages, setMessages] = useState([]); // State to store chat messages
  const [socket, setSocket] = useState(null); // State to manage the WebSocket connection
  const [isLoading, setIsLoading] = useState(false); // State to control typing indicator
  const [socketId, setSocketId] = useState(''); // State to store the socket ID

  // Function to simulate a typing delay for bot responses
  const simulateTypingDelay = (message, delay) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(message);
      }, delay);
    });
  };

  useEffect(() => {
    // Create a new WebSocket connection to the Rasa server
    const newSocket = io('http://192.168.0.47:5005');

    // Handle WebSocket connection events
    newSocket.on('connect', () => {
      console.log(newSocket.id + ' Connected to server');
      setSocketId(newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log(newSocket.id + ' Disconnected from server');
    });

    // Handle incoming messages from the bot
    newSocket.on('bot_uttered', async (data) => {
      const botMessage = {
        _id: uuidv4(),
        text: data.text,
        createdAt: new Date(),
        user: { _id: 'bot' },
      };

      // Show a typing indicator (optional)
      setIsLoading(true);

      // Simulate a typing delay (e.g., 500 milliseconds) before displaying the bot's message
      const typingDelay = 500;

      // Simulate the typing delay
      const delayedBotMessage = await simulateTypingDelay(botMessage, typingDelay);

      // Calculate the time it took for the bot's message to arrive
      const botMessageReceivedTime = new Date();
      const messageLatency = botMessageReceivedTime - botMessage.createdAt;
      console.log('Message latency:', messageLatency, 'ms');

      // Append the bot's message to the chat messages
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [delayedBotMessage])
      );

      // Remove the typing indicator (optional)
      setIsLoading(false);
      
    });

    setSocket(newSocket);

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Function to handle sending user messages
  const onSend = (newMessages) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );

    const text = newMessages[0].text;

    if (socket && socket.connected) {
      if (text.trim() !== '') {
        setIsLoading(true);

        const messageId = uuidv4();

        const newMessage = {
          _id: messageId,
          text: text,
          createdAt: new Date(),
          user: {
            _id: socket.id,
          },
        };

        // Log the message being sent to Rasa
        console.log('Sending message to Rasa:', newMessage);

        // Record the time before sending the message
        const messageSentTime = new Date();

        // Emit the user's message to Rasa
        // Emit the user's message to Rasa
        socket.emit('user_uttered', { session_id: socket.id, message: text }, () => {
          // Calculate the time it took for the message to be acknowledged
          const acknowledgmentTime = new Date() - messageSentTime;
          console.log('Acknowledgment time:', acknowledgmentTime, 'ms');

          // Continue with the rest of the code
          setIsLoading(false);
        });
      } else {
        // Handle empty message case here
      }
    } else {
      // Handle not connected to the server here
    }
  };

  // Function to render the bot's avatar
  const renderAvatar = () => {
    // Path to the bot's avatar image in your project folder
    const botAvatarPath =
      Platform.OS === 'android'
        ? require('./assets/bot.png') // Android
        : require('./assets/bot.png'); // iOS

    return (
      <Image
        source={botAvatarPath}
        style={{ width: 40, height: 40, borderRadius: 20 }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{ _id: socketId }}
        isTyping={isLoading}
        renderAvatar={renderAvatar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  rasaTypingIndicator: {
    color: 'black',
    fontSize: 18,
    alignSelf: 'center',
    marginVertical: 8,
  },
});

export default App;
