"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User } from 'firebase/auth';
import { UserProfile } from '@/lib/auth';

interface UserContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  refreshUserProfile: () => Promise<void>;
  signInWithGoogle: () => Promise<UserProfile>;
  signInWithMetaMask: () => Promise<UserProfile>;
  signOut: () => Promise<void>;
  updateUserPreferences: (preferences: any) => Promise<void>;
  getUserPreferences: () => Promise<any>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const authData = useAuth();

  return (
    <UserContext.Provider value={authData}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// Export the auth data for backward compatibility
export { useAuth };
