import React, { createContext, useContext, useState } from 'react';
import { ChatState, Message } from '../types';
import { chatAPI } from '../services/api';

interface ChatContextType extends ChatState {
  sendMessage: (text: string, productId?: string) => Promise<void>;
  clearMessages: () => void;
}

const initialState: ChatState = {
  messages: [
    {
      id: '1',
      text: "Hi! I'm Ava, your personal health assistant. How can I help you today?",
      sender: 'ava',
      timestamp: new Date().toISOString()
    }
  ],
  loading: false,
  error: null
};

const ChatContext = createContext<ChatContextType>({
  ...initialState,
  sendMessage: async () => {},
  clearMessages: () => {}
});

export const useChat = () => useContext(ChatContext);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ChatState>(initialState);
  
  const sendMessage = async (text: string, productId?: string) => {
    try {
      // Add user message to state
      const userMessage: Message = {
        id: Date.now().toString(),
        text,
        sender: 'user',
        timestamp: new Date().toISOString()
      };
      
      setState({
        ...state,
        messages: [...state.messages, userMessage],
        loading: true,
        error: null
      });
      
      // Send to API
      const response = await chatAPI.sendMessage(text, productId);
      
      // Add Ava's response
      const avaMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ava',
        timestamp: new Date().toISOString()
      };
      
      setState(prevState => ({
        ...prevState,
        messages: [...prevState.messages, avaMessage],
        loading: false
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      setState(prevState => ({
        ...prevState,
        loading: false,
        error: 'Failed to send message'
      }));
    }
  };
  
  const clearMessages = () => {
    setState(initialState);
  };
  
  return (
    <ChatContext.Provider
      value={{
        ...state,
        sendMessage,
        clearMessages
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
