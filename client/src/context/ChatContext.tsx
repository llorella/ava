import React, { createContext, useContext, useState, useEffect } from 'react';
import { ChatState, Message, Conversation } from '../types';
import { chatAPI, UserNotFoundError } from '../services/api';
import { useAuth } from './AuthContext';

interface ChatContextType extends ChatState {
  sendMessage: (text: string, productId?: string) => Promise<void>;
  clearMessages: () => void;
  loadConversations: () => Promise<void>;
  loadConversation: (conversationId: string) => Promise<void>;
  startNewConversation: (title?: string, productId?: string) => Promise<void>;
  setCurrentConversation: (conversation: Conversation | null) => void;
}

const defaultMessage: Message = {
  id: '1',
  text: "Hi! I'm Ava, your personal health assistant. How can I help you today?",
  sender: 'ava',
  timestamp: new Date().toISOString()
};

const initialState: ChatState = {
  conversations: [],
  currentConversation: null,
  messages: [defaultMessage],
  loading: false,
  error: null
};

const ChatContext = createContext<ChatContextType>({
  ...initialState,
  sendMessage: async () => {},
  clearMessages: () => {},
  loadConversations: async () => {},
  loadConversation: async () => {},
  startNewConversation: async () => {},
  setCurrentConversation: () => {}
});

export const useChat = () => useContext(ChatContext);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ChatState>(initialState);
  const { logout } = useAuth();

  // Load conversations when the app starts
  useEffect(() => {
    loadConversations();
  }, []);
  
  // Handle UserNotFoundError by logging out
  const handleAuthError = async (error: any) => {
    if (error instanceof UserNotFoundError) {
      console.log('User not found, logging out');
      await logout();
      return true;
    }
    return false;
  };
  
  // Load all conversations from the API
  const loadConversations = async () => {
    try {
      setState(prevState => ({ ...prevState, loading: true }));
      const conversations = await chatAPI.getConversations();
      
      setState(prevState => ({
        ...prevState,
        conversations,
        loading: false
      }));
    } catch (error) {
      console.error('Error loading conversations:', error);
      
      // Handle auth error (user not found)
      if (await handleAuthError(error)) {
        return;
      }
      
      setState(prevState => ({
        ...prevState,
        loading: false,
        error: 'Failed to load conversations'
      }));
    }
  };
  
  // Load a specific conversation
  const loadConversation = async (conversationId: string) => {
    try {
      setState(prevState => ({ ...prevState, loading: true }));
      
      const conversation = await chatAPI.getConversation(conversationId);
      
      // Transform the conversation to match our client format
      const formattedMessages = conversation.messages.map((msg: any) => ({
        id: msg.id,
        text: msg.content,
        sender: msg.sender,
        timestamp: msg.timestamp,
        conversationId: msg.conversationId
      }));
      
      const formattedConversation = {
        ...conversation,
        messages: formattedMessages
      };
      
      setState(prevState => ({
        ...prevState,
        currentConversation: formattedConversation,
        messages: formattedMessages,
        loading: false
      }));
    } catch (error) {
      console.error('Error loading conversation:', error);
      
      // Handle auth error (user not found)
      if (await handleAuthError(error)) {
        return;
      }
      
      setState(prevState => ({
        ...prevState,
        loading: false,
        error: 'Failed to load conversation'
      }));
    }
  };
  
  // Start a new conversation
  const startNewConversation = async (title?: string, productId?: string) => {
    try {
      setState(prevState => ({ ...prevState, loading: true }));
      
      const newConversation = await chatAPI.createConversation(
        undefined, // No initial message yet
        productId,
        title || 'New Conversation'
      );
      
      // Transform the conversation to match our client format
      const formattedMessages = newConversation.messages.map((msg: any) => ({
        id: msg.id,
        text: msg.content,
        sender: msg.sender,
        timestamp: msg.timestamp,
        conversationId: msg.conversationId
      }));
      
      const formattedConversation = {
        ...newConversation,
        messages: formattedMessages
      };
      
      setState(prevState => ({
        ...prevState,
        conversations: [formattedConversation, ...prevState.conversations],
        currentConversation: formattedConversation,
        messages: formattedMessages.length > 0 ? formattedMessages : [defaultMessage],
        loading: false
      }));
    } catch (error) {
      console.error('Error creating conversation:', error);
      
      // Handle auth error (user not found)
      if (await handleAuthError(error)) {
        return;
      }
      
      setState(prevState => ({
        ...prevState,
        loading: false,
        error: 'Failed to create conversation'
      }));
    }
  };
  
  // Set the current conversation
  const setCurrentConversation = (conversation: Conversation | null) => {
    setState(prevState => ({
      ...prevState,
      currentConversation: conversation,
      messages: conversation ? conversation.messages : [defaultMessage]
    }));
  };
  
  // Send a message in the current conversation
  const sendMessage = async (text: string, productId?: string) => {
    try {
      // Add user message to state
      const userMessage: Message = {
        id: Date.now().toString(),
        text,
        sender: 'user',
        timestamp: new Date().toISOString(),
        conversationId: state.currentConversation?.id
      };
      
      setState({
        ...state,
        messages: [...state.messages, userMessage],
        loading: true,
        error: null
      });
      
      // If we have a current conversation, send message to that conversation
      // Otherwise, create a new conversation
      let responseData;
      
      if (state.currentConversation?.id) {
        responseData = await chatAPI.sendMessage(
          text, 
          productId || state.currentConversation.productId, 
          state.currentConversation.id
        );
      } else {
        // Create a new conversation with this message
        const newConversation = await chatAPI.createConversation(text, productId);
        
        // Transform the conversation
        const formattedMessages = newConversation.messages.map((msg: any) => ({
          id: msg.id,
          text: msg.content,
          sender: msg.sender,
          timestamp: msg.timestamp,
          conversationId: newConversation.id
        }));
        
        const formattedConversation = {
          ...newConversation,
          messages: formattedMessages
        };
        
        // Add the conversation to state
        setState(prevState => ({
          ...prevState,
          conversations: [formattedConversation, ...prevState.conversations],
          currentConversation: formattedConversation,
          // Don't include the user message again since it's already in formattedMessages
          messages: formattedMessages,
          loading: true
        }));
        
        responseData = {
          message: formattedMessages.find((msg: any) => msg.sender === 'ava')?.text || '',
          conversationId: newConversation.id
        };
        
        // No need to load the conversation again as we already have the messages
        setState(prevState => ({
          ...prevState,
          loading: false
        }));
        return;
      }
      
      // Add Ava's response
      const avaMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseData.message,
        sender: 'ava',
        timestamp: new Date().toISOString(),
        conversationId: responseData.conversationId || state.currentConversation?.id
      };
      
      // Update the messages in the current conversation
      const updatedMessages = [...state.messages, avaMessage];
      
      setState(prevState => {
        // Update the conversation in the list
        const updatedConversations = prevState.conversations.map(conv => 
          conv.id === prevState.currentConversation?.id
            ? { ...conv, messages: updatedMessages }
            : conv
        );
        
        return {
          ...prevState,
          conversations: updatedConversations,
          currentConversation: prevState.currentConversation 
            ? { ...prevState.currentConversation, messages: updatedMessages }
            : null,
          messages: updatedMessages,
          loading: false
        };
      });
      
      // Refresh the conversations list
      loadConversations();
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Handle auth error (user not found)
      if (await handleAuthError(error)) {
        return;
      }
      
      setState(prevState => ({
        ...prevState,
        loading: false,
        error: 'Failed to send message'
      }));
    }
  };
  
  // Clear current conversation
  const clearMessages = () => {
    setState(prevState => ({
      ...prevState,
      currentConversation: null,
      messages: [defaultMessage]
    }));
  };
  
  return (
    <ChatContext.Provider
      value={{
        ...state,
        sendMessage,
        clearMessages,
        loadConversations,
        loadConversation,
        startNewConversation,
        setCurrentConversation
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
