import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserPreferences } from '../types';
import { userAPI } from '../services/api';
import { useAuth } from './AuthContext';

interface UserContextType {
  preferences: UserPreferences;
  loading: boolean;
  error: string | null;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
}

const defaultPreferences: UserPreferences = {
  allergies: [],
  dietaryPreferences: [],
  skinConditions: []
};

const UserContext = createContext<UserContextType>({
  preferences: defaultPreferences,
  loading: false,
  error: null,
  updatePreferences: async () => {}
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  
  // Load user preferences when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadPreferences();
    } else {
      // Reset to defaults when not authenticated
      setPreferences(defaultPreferences);
    }
  }, [isAuthenticated]);
  
  const loadPreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userPreferences = await userAPI.getProfile();
      setPreferences(userPreferences);
    } catch (error) {
      console.error('Error loading user preferences:', error);
      setError('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };
  
  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedPreferences = await userAPI.updateProfile(newPreferences);
      setPreferences(updatedPreferences);
    } catch (error) {
      console.error('Error updating user preferences:', error);
      setError('Failed to update preferences');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <UserContext.Provider
      value={{
        preferences,
        loading,
        error,
        updatePreferences
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
