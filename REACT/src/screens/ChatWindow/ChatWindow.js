// ChatWindowScreen.js

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { useUserContext } from '../../components/utils/contexts/UserContext';
import { useRoute, useIsFocused } from '@react-navigation/native';
import TopNavigationBar from '../../components/navigation/TopNavigationBar';
import QuestionnaireButtonLayout from '../../components/questionnaire/QuestionnaireButtonLayout';

const ChatWindowScreen = () => {
  const [messages, setMessages] = useState([]);
  const { userUUID } = useUserContext();
  const [questionnaireLayout, setQuestionnaireLayout] = useState(false);
  const [lastBotAnswer, setLastBotAnswer] = useState('');
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const route = useRoute();
  const { username } = route.params || {};
  const isFocused = useIsFocused();

  // Function to generate a unique ID for messages
  const generateUUID = () =>
    `${Math.random().toString(36).substring(2, 15)}-${Math.random()
      .toString(36)
      .substring(2, 15)}`;

  // Function to create a user message object
  const createUserMessage = (text) => ({
    _id: generateUUID(),
    text,
    createdAt: new Date(),
    user: { _id: userUUID },
  });

  useEffect(() => {
    // Effect when userUUID or username changes
  }, [userUUID, username]);

  useEffect(() => {
    if (isFocused) {
      // Log the navigation interaction
      logInteraction({
        UUID: userUUID,
        Username: username,
        InteractionType: 'Navigation',
        InteractionOutput: '-> Chat Screen',
      });
    }
  }, [isFocused, userUUID, username]);

  // Function to handle receiving messages from the bot
  const handleBotMessage = (data) => {
    if (data && data.text) {
      const botMessage = {
        _id: generateUUID(),
        text: data.text,
        createdAt: new Date(),
        user: { _id: 'bot' },
      };

      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, botMessage)
      );
    }

    setIsLoading(false);
  };

  // Function to send messages to the bot
  const onSend = async (newMessages) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );
    setIsLoading(true);

    const userMessage = createUserMessage(newMessages[0].text);

    try {
      // Send the message to the backend via HTTP request
      const response = await fetch('http://10.0.2.2:5006/send_message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessages[0].text,
          session_id: userUUID,
        }),
      });

      // Read the response as text first to capture raw output
      const responseText = await response.text();

      // Attempt to parse the response text as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error('Failed to parse server response');
      }

      if (data.status === 'error') {
        // Handle errors returned by the backend
        console.error('Backend error:', data.error);
        setIsLoading(false);
        return;
      }

      // Handle the bot's response
      handleBotMessage(data);

      // Log the interaction
      logInteraction({
        UUID: userUUID,
        Username: username,
        InteractionType: 'Send Message (Chat Window)',
        InteractionOutput: userMessage.text,
      });
    } catch (error) {
      // Log detailed error information
      console.error('Error sending message:', error);

      // Check if it's a network-related error or server-side issue
      if (error instanceof TypeError) {
        console.error('Network or CORS issue:', error.message);
      }

      setIsLoading(false);
      // Optionally, display an alert to the user or handle the error gracefully
    }
  };

  // Function to log interactions to the server
  const logInteraction = async (interactionData) => {
    try {
      await fetch('http://10.0.2.2:5006/interaction_log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(interactionData),
      });
    } catch (error) {
      console.error('Error logging interaction:', error);
      // Handle error if necessary
    }
  };

  // Function to handle clicks on questionnaire buttons
  const handleQuestionnaireButtonClick = (buttonName) => {
    // Specific logic based on the button clicked
    switch (buttonName) {
      case 'Yes':
        // User clicked Yes
        break;
      case 'No':
        // User clicked No
        break;
      default:
        // Unknown button clicked
        break;
    }

    // Disable buttons after a click to prevent multiple clicks
    setButtonsDisabled(true);
  };

  // Function to render the bot's avatar
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
    return null;
  };

  return (
    <View style={styles.container}>
      <TopNavigationBar username={username} />

      <GiftedChat
        messages={messages}
        onSend={(newMessages) => onSend(newMessages)}
        user={{ _id: userUUID }}
        isTyping={isLoading}
        renderAvatar={renderAvatar}
        textInputStyle={{ color: 'black' }}
      />

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
