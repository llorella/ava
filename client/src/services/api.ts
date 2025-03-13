import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences, ScanResult, Message } from '../types';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
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
  sendMessage: async (message: string, productId?: string) => {
    const response = await api.post('/chat', { message, productId });
    return response.data.message as string;
  }
};

export default {
  auth: authAPI,
  user: userAPI,
  scan: scanAPI,
  chat: chatAPI
};
