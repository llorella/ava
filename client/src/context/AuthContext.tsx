import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, User } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null
};

const AuthContext = createContext<AuthContextType>({
  ...initialState,
  login: async () => {},
  register: async () => {},
  logout: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  
  // Load token from storage on mount
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userJson = await AsyncStorage.getItem('user');
        
        if (token && userJson) {
          const user = JSON.parse(userJson) as User;
          setState({
            isAuthenticated: true,
            user,
            token,
            loading: false,
            error: null
          });
        } else {
          setState({
            ...initialState,
            loading: false
          });
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        setState({
          ...initialState,
          loading: false,
          error: 'Failed to load authentication state'
        });
      }
    };
    
    loadToken();
  }, []);
  
  // Login
  const login = async (email: string, password: string) => {
    try {
      setState({
        ...state,
        loading: true,
        error: null
      });
      
      const { token, user } = await authAPI.login(email, password);
      
      // Save to storage
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      setState({
        isAuthenticated: true,
        user,
        token,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Login error:', error);
      setState({
        ...state,
        loading: false,
        error: 'Invalid credentials'
      });
      throw error;
    }
  };
  
  // Register
  const register = async (email: string, password: string) => {
    try {
      setState({
        ...state,
        loading: true,
        error: null
      });
      
      const { token, user } = await authAPI.register(email, password);
      
      // Save to storage
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      setState({
        isAuthenticated: true,
        user,
        token,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Registration error:', error);
      setState({
        ...state,
        loading: false,
        error: 'Registration failed'
      });
      throw error;
    }
  };
  
  // Logout
  const logout = async () => {
    try {
      // Clear storage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      setState({
        ...initialState,
        loading: false
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
