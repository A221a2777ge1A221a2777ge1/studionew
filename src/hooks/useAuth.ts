import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { authService, UserProfile } from '@/lib/auth';
import { mcpManager, createMCPContext } from '@/lib/mcp-pattern';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserProfile = async () => {
    if (user) {
      console.log('🔍 [AUTH HOOK] Refreshing user profile for UID:', user.uid);
      try {
        const profile = await authService.getUserProfile(user.uid);
        setUserProfile(profile);
        console.log('🔍 [AUTH HOOK] User profile refreshed:', profile);
      } catch (error) {
        console.error('🔍 [AUTH HOOK] Error refreshing user profile:', error);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        if (!mcpManager.getContext()) {
          mcpManager.setContext(createMCPContext(user.uid));
        }
        const profile = await authService.getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        if (mcpManager.getContext()) {
          mcpManager.setContext(null);
        }
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return {
    user,
    userProfile,
    loading,
    refreshUserProfile,
    signInWithGoogle: authService.signInWithGoogle.bind(authService),
    signInWithMetaMask: authService.signInWithMetaMask.bind(authService),
    signOut: authService.signOut.bind(authService),
    updateUserPreferences: authService.updateUserPreferences.bind(authService),
    getUserPreferences: authService.getUserPreferences.bind(authService),
  };
};
