'use client';

import { useEffect, useState } from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import { useAuth } from '@/lib/auth';

export function useTheme() {
  const { theme, setTheme: setNextTheme, resolvedTheme } = useNextTheme();
  const { user, userProfile, updateUserPreferences } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Debug: Log theme state changes
  useEffect(() => {
    console.log("🔍 [THEME DEBUG] Theme state changed:", {
      theme,
      resolvedTheme,
      user: user ? { uid: user.uid } : null,
      userProfile: userProfile ? { preferences: userProfile.preferences } : null,
      isLoading
    });
  }, [theme, resolvedTheme, user, userProfile, isLoading]);

  // Load user's theme preference on mount
  useEffect(() => {
    const loadUserTheme = async () => {
      console.log("🔍 [THEME DEBUG] Loading user theme:", {
        user: user ? { uid: user.uid } : null,
        userProfile: userProfile ? { preferences: userProfile.preferences } : null
      });

      if (user && userProfile?.preferences?.theme) {
        // Set theme from user preferences
        console.log("🔍 [THEME DEBUG] Setting theme from user preferences:", userProfile.preferences.theme);
        setNextTheme(userProfile.preferences.theme);
      } else if (!user) {
        // If no user, check localStorage for previous theme
        const storedTheme = localStorage.getItem('theme');
        console.log("🔍 [THEME DEBUG] No user, checking localStorage:", storedTheme);
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
    console.log("🔍 [THEME DEBUG] Setting theme:", { from: theme, to: newTheme });
    
    setNextTheme(newTheme);
    
    // Always store in localStorage for immediate persistence
    localStorage.setItem('theme', newTheme);
    console.log("🔍 [THEME DEBUG] Theme stored in localStorage:", newTheme);
    
    // Update user preferences if user is logged in
    if (user && newTheme !== theme) {
      try {
        console.log("🔍 [THEME DEBUG] Updating user preferences in Firebase:", { uid: user.uid, theme: newTheme });
        await updateUserPreferences(user.uid, { theme: newTheme as 'light' | 'dark' });
        console.log("🔍 [THEME DEBUG] Theme preference updated successfully");
      } catch (error) {
        console.error("🔍 [THEME DEBUG] Failed to update theme preference:", error);
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
