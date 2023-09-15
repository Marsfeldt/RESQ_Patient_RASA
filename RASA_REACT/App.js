import React, { useEffect, useState, useRef  } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import io from 'socket.io-client';
import MessageItem from './components/MessageItem';
import { request } from 'http';


function App() {
  // Defines use state for references to the variables
  // Controls the single messages sent to and from react to socket server
  const [message, setMessage] = useState('');
  // Controls the list of messages in the chat window
  const [messages, setMessages] = useState([]);
  // Controls an instance of the socket so that they can be referenced
  const [socket, setSocket] = useState(null);
  // Controls the loading and isLoading from the "rasa is typing..." message in the chat window
  const [isLoading, setIsLoading] = useState(false);
  // Reference to the list of messages to allow for automatic scrolling
  const flatListRef = useRef(null);

  // Function to update the 'message' state when user types
  const handleTextInputChange = (text) => {
    setMessage(text);
  };

  useEffect(() => {
    // Connect to the WebSocket server
    // Change the URL to your Flask server's address
    const newSocket = io('http://10.0.2.2:6969');

    // On Socket Event 'connect' whenever we connect to a socket server
    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    // On Socket Event 'disconnect' whenever we disconnect from a socket server
    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    // Handle incoming messages
    newSocket.on('message', (data) => {
      console.log('Received message:', data);
      // Update your messages state with the received message by appending it
      setMessages((prevMessages) => [...prevMessages, data]);
      setIsLoading(false);
      flatListRef.current.scrollToEnd({ animated: true });
    });

    setSocket(newSocket);

    return () => {
      // Clean up the socket connection when the component unmounts
      newSocket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    // Check if the socket is initialized before emitting the message
    if (socket) {
      setIsLoading(true);
      setMessages([...messages, { text: message, isUser: true }]);
      socket.emit('message', { text: message });
      // Clear the input field after sending
      //setMessages((prevMessages) => [...prevMessages, message]);
      setMessage('');
    }
  };

  // Controls how the messages are rendered in the chat window, depending on
  // if it is the user or the chatbot who is sending the messages
  const renderMessage = ({ item }) => {
    // Check if the message is sent by the user
    const isSentByUser = item.isUser;
  
    const messageTextStyle = {
      fontSize: 16,
      color: isSentByUser ? 'white' : 'black', // Set text color based on sender
    };

    return (
      <View
        style={[
          styles.messageContainer,
          isSentByUser ? styles.sentMessage : styles.receivedMessage,
        ]}
      >
        <Text style={messageTextStyle}>{item.text}</Text>
      </View>
    );
  };
  //(text) => setMessage(text)
  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        style={styles.messageList}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
      />
      {isLoading && <Text style={styles.rasaTypingIndicator}>RASA is typing...</Text>}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={message}
          onChangeText={handleTextInputChange}
        />
        <Button style={styles.sendButton} title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
}

// Stylesheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  messageList: {
    flex: 1,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  sendButton: {
    // Add border radius to the send button
    borderRadius: 8,
  },
  messageContainer: {
    maxWidth: '70%', // Adjust the max width to your preference
    borderRadius: 8,
    marginVertical: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e0e0', // Background color for received messages
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF', // Background color for sent messages
    color: 'white', // Text color for sent messages
  },
  messageText: {
    color: 'white',
    fontSize: 16,
  },
  sentMessageText: {
    color: 'white', // Text color for user messages
    fontSize: 16,
  },
  receivedMessageText: {
    color: 'black', // Text color for bot's messages
    fontSize: 16,
  },
  loadingIndicator: {
    alignSelf: 'center',
    marginVertical: 8,
  },
  rasaTypingIndicator: {
    color: 'black',
    fontSize: 18,
  }
});

export default App;