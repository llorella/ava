import React from 'react';
import { AuthProvider } from './AuthContext';
import { UserProvider } from './UserContext';
import { ScanProvider } from './ScanContext';
import { ChatProvider } from './ChatContext';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <UserProvider>
        <ScanProvider>
          <ChatProvider>
            {children}
          </ChatProvider>
        </ScanProvider>
      </UserProvider>
    </AuthProvider>
  );
};
