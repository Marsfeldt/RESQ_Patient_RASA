// AsyncStorageUtils.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveMessages = async (messages) => {
  try {
    await AsyncStorage.setItem('chatMessages', JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving messages to AsyncStorage:', error);
  }
};

export const loadMessages = async () => {
  try {
    const storedMessages = await AsyncStorage.getItem('chatMessages');
    return storedMessages ? JSON.parse(storedMessages) : [];
  } catch (error) {
    console.error('Error loading messages from AsyncStorage:', error);
    return [];
  }
};
