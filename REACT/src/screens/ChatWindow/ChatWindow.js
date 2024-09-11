import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { useUserContext } from '../../../components/UserContext';
import { rasaServerSocket, pythonServerSocket, connectSockets, disconnectSockets } from '../../../components/SocketManager/SocketManager';
import { useRoute, useIsFocused } from '@react-navigation/native';
import emitToServerEvent from '../../../components/SocketUtils';
import TopNavigationBar from '../../../components/TopNavigationBar';
import QuestionnaireButtonLayout from '../../../components/QuestionnaireButtonLayout';

const ChatWindowScreen = () => {
  // State hooks to manage various aspects of the chat window
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [sessionID, setSessionID] = useState('');
  const { userUUID } = useUserContext(); // Get userUUID from the context
  const [questionnaireLayout, setQuestionnaireLayout] = useState(false);
  const [lastBotAnswer, setLastBotAnswer] = useState('');
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const route = useRoute();
  const { username } = route.params; // Get the username from the navigation route

  const isFocused = useIsFocused(); // Hook to check if the screen is focused

  // Function to generate a unique UUID for messages or sessions
  const generateUUID = () => `${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;

  // Function to create a user message object for GiftedChat
  const createUserMessage = (text) => ({
    _id: generateMessageID(),
    text,
    createdAt: new Date(),
    user: { _id: userUUID },
  });

  // Handle button clicks in the questionnaire layout
  const handleQuestionnaireButtonClick = (buttonName) => {
    const handleButtonClickLogic = (messageText) => {
      setIsLoading(true);
      if (!buttonsDisabled) {
        setButtonsDisabled(true);
        const messageId = generateUUID();

        // Create a new message object and update the message state
        const newMessage = {
          _id: messageId,
          text: messageText,
          createdAt: new Date(),
          user: { _id: userUUID },
        };

        setMessages(previousMessages => GiftedChat.append(previousMessages, [newMessage]));

        // Emit the user's message to the RASA server
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

        setIsLoading(false);

        // Log the user's response to a questionnaire question
        emitToServerEvent('questionnaire_question_answered', {
          UUID: userUUID,
          Username: username,
          UserResponse: messageText,
          QuestionID: generateUUID(),
          QuestionText: lastBotAnswer,
          QuestionType: 'Binary (Yes-No)',
        });
      } else {
        console.log("Buttons Disabled");
      }
    };

    // Handle the specific button clicks (Yes or No)
    switch (buttonName) {
      case 'Yes':
      case 'No':
        handleButtonClickLogic(buttonName);
        break;
      default:
        console.log(`Button ${buttonName} not handled`);
    }
  };

  // useEffect to manage socket connection when the component mounts
  useEffect(() => {
    connectSockets(); // Connect the sockets when the component mounts

    if (!socket) {
      setSocket(rasaServerSocket);
      rasaServerSocket.connect();
    }

    return () => {
      disconnectSockets(); // Disconnect the sockets when the component unmounts
    };
  }, []);

  // useEffect to log interaction whenever the screen is focused
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

  // useEffect to establish a session with RASA when the component mounts
  useEffect(() => {
    if (socket && !sessionID && userUUID) {
      setSessionID(userUUID); // Set userUUID as sessionID
      socket.emit('session_request', { session_id: userUUID }); // Open a unique session with RASA
      pythonServerSocket.emit('connection_log', { UUID: userUUID, Username: username, Connection: rasaServerSocket.id, ConnectionType: 'Session Request (RASA)' });
      console.log('Attempting to establish session request ' + userUUID);
    }
  }, [socket, sessionID, userUUID, username]);

  // useEffect to handle messages received from the bot
  useEffect(() => {
    const handleBotMessage = (data) => {
      console.log("Bot message received:", data);  // Logging for debug

      const botMessageId = generateMessageID();
      const botMessage = {
        _id: botMessageId,
        text: data.text,
        createdAt: new Date(),
        user: { _id: 'bot' },
      };

      setLastBotAnswer(data.text); // Store the last bot answer for future reference

      // Update the chat with the bot's message
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [botMessage])
      );

      setButtonsDisabled(false);

      // Log the bot's message
      emitToServerEvent('message_from_client', {
        UUID: userUUID,
        Username: 'RASA BOT',
        Message: data.text,
        MessageID: botMessageId,
        IsSystemMessage: 'False',
        MessageType: 'Bot Answer'
      });

      setIsLoading(false);
    };

    if (socket) {
      socket.on('bot_uttered', handleBotMessage);

      return () => {
        socket.off('bot_uttered', handleBotMessage); // Cleanup when the component unmounts
      };
    } else {
      setSocket(rasaServerSocket);
      rasaServerSocket.connect();
    }
  }, [socket, userUUID]);

  // Function to handle sending messages
  const onSend = (newMessages) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );
    setIsLoading(true);

    if (socket) {
      const userMessage = createUserMessage(newMessages[0].text);
      socket.emit(
        'user_uttered',
        {
          message: newMessages[0].text,
          session_id: sessionID,
        }
      );
      console.log(`${username} sending message ${userMessage.text} to RASA`);

      // Check if the user is ready to start a questionnaire
      if (typeof userMessage.text === 'string' && /ready/.test(userMessage.text) || /rdy/.test(userMessage.text) || /readt/.test(userMessage.text)) {
        setQuestionnaireLayout(true);
        console.log('Enabling questionnaire layout.');
      }

      // Log the user's message
      emitToServerEvent('message_from_client', {
        UUID: userUUID,
        Username: username,
        Message: userMessage.text,
        MessageID: userMessage._id,
        IsSystemMessage: 'False',
        MessageType: 'Question'
      });

      // Log the interaction
      emitToServerEvent('interaction_log', {
        UUID: userUUID,
        Username: username,
        InteractionType: 'Send Message (Chat Window)',
        InteractionOutput: userMessage.text,
      });
    }
  };

  // Function to render the avatar for the bot
  const renderAvatar = (props) => {
    const { currentMessage } = props;

    if (currentMessage.user._id === 'bot') {
      // Render a bot avatar (you can replace the image source with your bot's avatar)
      return (
        <View style={styles.botAvatarContainer}>
          <Image
            source={require('../../../assets/images/woman_stonks_64.png')} // Replace with your bot's avatar image
            style={styles.botAvatar}
          />
        </View>
      );
    }
  };

  // Function to generate a simple random ID for messages
  const generateMessageID = () =>
    Math.round(Math.random() * 1000000).toString();

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

      {/* Render questionnaire buttons if the layout is enabled */}
      <QuestionnaireButtonLayout
        showButtons={questionnaireLayout}
        onButtonClick={handleQuestionnaireButtonClick}
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
