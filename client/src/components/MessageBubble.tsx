import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  return (
    <View style={[
      styles.container,
      isUser ? styles.userContainer : styles.avaContainer
    ]}>
      <View style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.avaBubble
      ]}>
        <Text style={[
          styles.text,
          isUser ? styles.userText : styles.avaText
        ]}>
          {message.text}
        </Text>
      </View>
      <Text style={[
        styles.timestamp,
        isUser ? styles.userTimestamp : styles.avaTimestamp
      ]}>
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  avaContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 4,
  },
  userBubble: {
    backgroundColor: '#4A90E2',
  },
  avaBubble: {
    backgroundColor: '#F1F1F1',
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  avaText: {
    color: '#333333',
  },
  timestamp: {
    fontSize: 12,
    marginHorizontal: 8,
  },
  userTimestamp: {
    color: '#666666',
    alignSelf: 'flex-end',
  },
  avaTimestamp: {
    color: '#666666',
    alignSelf: 'flex-start',
  },
});
