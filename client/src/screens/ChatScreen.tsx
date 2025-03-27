import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MessageBubble } from '../components/MessageBubble';
import { useChat } from '../context/ChatContext';
import { useScan } from '../context/ScanContext';
import { Conversation } from '../types';

// Conversation List Component
const ConversationItem: React.FC<{
  conversation: Conversation;
  onSelect: (conversation: Conversation) => void;
  isActive: boolean;
}> = ({ conversation, onSelect, isActive }) => {
  // Get the most recent message for the preview
  const lastMessage = conversation.messages.length > 0 
    ? conversation.messages[conversation.messages.length - 1] 
    : null;
    
  // Format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <TouchableOpacity 
      style={[styles.conversationItem, isActive && styles.activeConversation]} 
      onPress={() => onSelect(conversation)}
    >
      <Text style={styles.conversationTitle} numberOfLines={1}>
        {conversation.title || 'Untitled Conversation'}
      </Text>
      {lastMessage && (
        <Text style={styles.conversationPreview} numberOfLines={1}>
          {lastMessage.sender === 'user' ? 'You: ' : 'Ava: '}
          {lastMessage.text}
        </Text>
      )}
      <Text style={styles.conversationDate}>
        {formatDate(conversation.updatedAt)}
      </Text>
    </TouchableOpacity>
  );
};

const ChatScreen: React.FC = () => {
  const { 
    messages, 
    sendMessage, 
    loading, 
    conversations, 
    currentConversation,
    loadConversations,
    loadConversation,
    startNewConversation,
    setCurrentConversation 
  } = useChat();
  
  const { currentScan } = useScan();
  const [inputText, setInputText] = useState('');
  const [showConversations, setShowConversations] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);
  
  // Handle sending a message
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
  
  // Handle selecting a conversation
  const handleSelectConversation = async (conversation: Conversation) => {
    setShowConversations(false);
    await loadConversation(conversation.id);
  };
  
  // Handle creating a new conversation
  const handleNewConversation = async () => {
    setShowConversations(false);
    setCurrentConversation(null);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => setShowConversations(true)}
        >
          <Ionicons name="menu-outline" size={24} color="#333333" />
        </TouchableOpacity>
        
        <Text style={styles.title}>
          {currentConversation?.title || 'Chat with Ava'}
        </Text>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleNewConversation}
        >
          <Ionicons name="add-outline" size={24} color="#333333" />
        </TouchableOpacity>
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
      
      {/* Conversations Modal */}
      <Modal
        visible={showConversations}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowConversations(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Conversations</Text>
              <TouchableOpacity onPress={() => setShowConversations(false)}>
                <Ionicons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.newConversationButton}
              onPress={handleNewConversation}
            >
              <Ionicons name="add-circle-outline" size={20} color="#4A90E2" />
              <Text style={styles.newConversationText}>New Conversation</Text>
            </TouchableOpacity>
            
            <FlatList
              data={conversations}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ConversationItem 
                  conversation={item} 
                  onSelect={handleSelectConversation}
                  isActive={currentConversation?.id === item.id}
                />
              )}
              contentContainerStyle={styles.conversationsList}
              ListEmptyComponent={
                <Text style={styles.emptyListText}>
                  No conversations yet. Start a new one!
                </Text>
              }
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
    backgroundColor: '#FFFFFF',
  },
  headerButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    textAlign: 'center',
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
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  newConversationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 16,
  },
  newConversationText: {
    fontSize: 16,
    color: '#4A90E2',
    marginLeft: 8,
  },
  conversationsList: {
    paddingBottom: 16,
  },
  conversationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  activeConversation: {
    backgroundColor: '#F0F7FF',
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  conversationPreview: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  conversationDate: {
    fontSize: 12,
    color: '#999999',
  },
  emptyListText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 16,
    padding: 20,
  },
});

export default ChatScreen;
