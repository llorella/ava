import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences, ScanResult, Message } from '../types';

// Create a custom error class for user not found errors
export class UserNotFoundError extends Error {
  constructor(message: string = 'User not found') {
    super(message);
    this.name = 'UserNotFoundError';
  }
}

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests and handle auth errors
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Check if it's a user not found error
    if (error.response && 
        error.response.status === 401 && 
        error.response.data && 
        error.response.data.code === 'USER_NOT_FOUND') {
      
      // Clear auth data
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      // Throw a specific error that can be caught by the auth context
      throw new UserNotFoundError();
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (email: string, password: string) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  }
};

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data as UserPreferences;
  },
  
  updateProfile: async (preferences: Partial<UserPreferences>) => {
    const response = await api.put('/user/profile', preferences);
    return response.data as UserPreferences;
  }
};

// Scan API
export const scanAPI = {
  scanLabel: async (
    imageBase64: string,
    productName?: string,
    productCategory?: string,
    barcode?: string
  ) => {
    const response = await api.post('/scan/label', {
      image: imageBase64,
      productName,
      productCategory,
      barcode
    });
    return response.data as ScanResult;
  },
  
  analyzeIngredients: async (text: string) => {
    const response = await api.post('/scan/analyze', { text });
    return response.data.ingredients;
  }
};

// Chat API
export const chatAPI = {
  sendMessage: async (message: string, productId?: string, conversationId?: string) => {
    const response = await api.post('/chat', { message, productId, conversationId });
    return {
      message: response.data.message as string,
      conversationId: response.data.conversationId as string
    };
  },
  
  createConversation: async (initialMessage?: string, productId?: string, title?: string) => {
    const response = await api.post('/chat/conversations', { initialMessage, productId, title });
    return response.data.conversation;
  },
  
  getConversation: async (conversationId: string) => {
    const response = await api.get(`/chat/conversations/${conversationId}`);
    return response.data.conversation;
  },
  
  getConversations: async (limit?: number, offset?: number) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const response = await api.get(`/chat/conversations?${params.toString()}`);
    return response.data.conversations;
  }
};

export default {
  auth: authAPI,
  user: userAPI,
  scan: scanAPI,
  chat: chatAPI
};
