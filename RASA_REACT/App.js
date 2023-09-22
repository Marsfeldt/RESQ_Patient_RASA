import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import io from 'socket.io-client';
import MessageItem from './components/MessageItem';
import { request } from 'http';
import { isErrored } from 'stream';

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
  // Controls whether to show the quick use buttons for the prom quiestionnaire
  const [isAnsweringProm, setisAnsweringProm] = useState(false);
  // Reference to the list of messages to allow for automatic scrolling
  const flatListRef = useRef(null);
  // Controls the individual socket id for the connected clients
  const [socketId, setSocketId] = useState('');
  // Controls whether the string typed in the input field is empty
  const [isInputEmpty, setIsInputEmpty] = useState(true);

  // Function to update the 'message' state when user types
  const handleTextInputChange = text => {
    setIsInputEmpty(text.trim() === '');
    console.log(isInputEmpty)
    setMessage(text);
  };

  useEffect(() => {
    // Connect to the WebSocket server
    // Change the URL to your Flask server's address
    const newSocket = io('http://10.0.2.2:6969');

    // On Socket Event 'connect' whenever we connect to a socket server
    newSocket.on('connect', () => {
      console.log(newSocket.id + ' Connected to server');
      // Updates the socket id for the connected client
      setSocketId(newSocket.id);
    });

    // On Socket Event 'disconnect' whenever we disconnect from a socket server
    newSocket.on('disconnect', () => {
      console.log(newSocket.id + ' Disconnected from server');
    });

    // Handle incoming messages
    newSocket.on('message', data => {
      console.log('Received message:', data);
      // Update your messages state with the received message by appending it
      setMessages(prevMessages => [...prevMessages, data]);
      setIsLoading(false);
      flatListRef.current.scrollToEnd({ animated: true });
    });

    setSocket(newSocket);

    return () => {
      // Clean up the socket connection when the component unmounts
      newSocket.disconnect();
    };
  }, []);

  const testFuction = () => {
    if (!isAnsweringProm) {
      setisAnsweringProm(true);
    } else {
      setisAnsweringProm(false);
    }

  }

  const sendMessage = () => {
    // Check if the socket is initialized before emitting the message
    if (socket) {
      if (socket.connected) {
        if (!isInputEmpty) {
          setIsLoading(true);
          setMessages([...messages, { text: message, isUser: true }]);
          flatListRef.current.scrollToEnd({ animated: true });
          socket.emit('message', { text: message });
          setIsLoading(false);
          setMessage(''); // Clear text input field

        } else {
          setMessages([
            ...messages,
            { text: 'You have not typed a message yet :D', isUser: false },
          ]);
        }
      } else {
        setMessages([
          ...messages,
          { text: 'You are not connected to the server, trying to establish connection now...', isUser: false },
        ]);
        setTimeout(() => {
          socket.connect();
          handleTextInputChange
        }, 3000); // Try to reconnect after a delay (e.g., 3 seconds)
      }
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
        ]}>
        <Text style={messageTextStyle}>{item.text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Socket ID: {socketId}</Text>
      </View>
      {isAnsweringProm && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.squareButton}
            onPress={() => {
              // Add functionality for Button 1
            }}
          >
            <Text style={styles.buttonText}>Strongly Disagree</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.squareButton}
            onPress={() => {
              // Add functionality for Button 1
            }}
          >
            <Text style={styles.buttonText}>Disagree</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.squareButton}
            onPress={() => {
              // Add functionality for Button 1
            }}
          >
            <Text style={styles.buttonText}>Neutral</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.squareButton}
            onPress={() => {
              // Add functionality for Button 1
            }}
          >
            <Text style={styles.buttonText}>Agree</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.squareButton}
            onPress={() => {
              // Add functionality for Button 1
            }}
          >
            <Text style={styles.buttonText}>Strongly Agree</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        ref={flatListRef}
        style={styles.messageList}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
      />
      {isLoading && (
        <Text style={styles.rasaTypingIndicator}>RASA is typing...</Text>
      )}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={message}
          onChangeText={handleTextInputChange}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
        >
          <Text style={styles.buttonText}>SEND</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Stylesheet
const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  squareButton: {
    width: 65, // Set the desired width for square buttons
    height: 50, // Set the desired height for square buttons
    backgroundColor: '#007AFF', // Background color for buttons
    borderRadius: 4, // Border radius for rounded corners
    alignItems: 'center', // Center content horizontally
    justifyContent: 'flex-start', // Align text at the top
  },
  buttonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white', // Text color for button labels
    textAlign: 'center', // Center text horizontally
    textAlignVertical: 'center', // Align text at the top vertically
    flex: 1, // Allow text to expand vertically
  },
  header: {
    height: 15, // Height of the header
    backgroundColor: '#007AFF', // Background color of the header
    justifyContent: 'center', // Center the content vertically
    alignItems: 'center', // Center the content horizontally
    marginBottom: 16,
  },
  headerText: {
    color: '#fff', // Text color of the header
    fontSize: 12, // Font size of the header text
    fontWeight: 'bold', // Font weight of the header text
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  messageList: {
    flex: 1,
    marginBottom: 8,
    padding: 8,

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
    backgroundColor: '#007AFF', // Change this to your desired button color
    borderRadius: 10, // Adjust the border radius to your preference
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3, // Add elevation for a subtle shadow effect (Android)
    shadowColor: '#000', // Shadow color (iOS)
    shadowOpacity: 0.2, // Shadow opacity (iOS)
    shadowOffset: { width: 1, height: 2 }, // Shadow offset (iOS)
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
  },
});

export default App;
