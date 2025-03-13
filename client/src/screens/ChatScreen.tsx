import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MessageBubble } from '../components/MessageBubble';
import { useChat } from '../context/ChatContext';
import { useScan } from '../context/ScanContext';

const ChatScreen: React.FC = () => {
  const { messages, sendMessage, loading } = useChat();
  const { currentScan } = useScan();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  
  const handleSend = async () => {
    if (inputText.trim() === '' || loading) return;
    
    const text = inputText;
    setInputText('');
    
    // Send message with current product ID if available
    await sendMessage(text, currentScan?.product?.id);
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chat with Ava</Text>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble message={item} />
        )}
        contentContainerStyle={styles.messageList}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask about ingredients..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (inputText.trim() === '' || loading) && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={inputText.trim() === '' || loading}
          >
            {loading ? (
              <Ionicons name="ellipsis-horizontal" size={24} color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  messageList: {
    padding: 16,
    paddingBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E1E1E1',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F1F1',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingRight: 40,
    fontSize: 16,
    maxHeight: 120,
  },
  sendButton: {
    backgroundColor: '#4A90E2',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#A1A1A1',
  },
});

export default ChatScreen;
