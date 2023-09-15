import React from 'react';
import { View, Text } from 'react-native';

const MessageItem = ({ text }) => {
  return (
    <View>
      <Text>{text}</Text>
    </View>
  );
};

export default MessageItem;