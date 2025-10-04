'use client';

import { useEffect, useState } from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import { useAuth } from '@/lib/auth';

export function useTheme() {
  const { theme, setTheme: setNextTheme, resolvedTheme } = useNextTheme();
  const { user, userProfile, updateUserPreferences } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Load user's theme preference on mount
  useEffect(() => {
    const loadUserTheme = async () => {
      if (user && userProfile?.preferences?.theme) {
        // Set theme from user preferences
        setNextTheme(userProfile.preferences.theme);
      } else if (!user) {
        // If no user, check localStorage for previous theme
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
          setNextTheme(storedTheme);
        }
      }
      setIsLoading(false);
    };

    loadUserTheme();
  }, [user, userProfile, setNextTheme]);

  // Custom setTheme function that persists to user preferences
  const setTheme = async (newTheme: string) => {
    setNextTheme(newTheme);
    
    // Always store in localStorage for immediate persistence
    localStorage.setItem('theme', newTheme);
    
    // Update user preferences if user is logged in
    if (user && newTheme !== theme) {
      try {
        await updateUserPreferences(user.uid, { theme: newTheme as 'light' | 'dark' });
      } catch (error) {
        console.error('Failed to update theme preference:', error);
      }
    }
  };

  return {
    theme,
    setTheme,
    resolvedTheme,
    isLoading,
  };
}
