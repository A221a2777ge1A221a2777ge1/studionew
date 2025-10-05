import { 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  User,
  UserCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { mcpManager, createMCPContext, emitMCPEvent } from './mcp-pattern';
import { FirebaseService, UserProfile as FirebaseUserProfile } from './firebaseService';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  walletAddress?: string;
  username?: string;
  level: number;
  experience: number;
  totalTrades: number;
  totalVolume: number;
  achievements: string[];
  createdAt: number;
  lastLogin: number;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
}

export class AuthService {
  private googleProvider = new GoogleAuthProvider();

  constructor() {
    this.googleProvider.addScope('email');
    this.googleProvider.addScope('profile');
  }

  async signInWithGoogle(): Promise<UserProfile> {
    try {
      // Check if we're in MetaMask browser and handle accordingly
      const isMetaMaskBrowser = this.isMetaMaskBrowser();
      const isMobileBrowser = this.isMobileBrowser();
      
      if (isMetaMaskBrowser) {
        console.log('🔍 [AUTH DEBUG] Detected MetaMask browser, using redirect method');
        // Use redirect method for MetaMask browser
        return await this.signInWithGoogleRedirect();
      } else if (isMobileBrowser) {
        console.log('🔍 [AUTH DEBUG] Detected mobile browser, using redirect method to avoid policy issues');
        // Use redirect method for mobile browsers to avoid Google policy issues
        return await this.signInWithGoogleRedirect();
      } else {
        console.log('🔍 [AUTH DEBUG] Using popup method for desktop browser');
        // Use popup method for desktop browsers
        return await this.signInWithGooglePopup();
      }
    } catch (error: any) {
      // Handle specific Firebase auth errors silently
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        // Don't log these as errors - they are normal user behavior
        throw error;
      } else {
        // Log other errors
        console.error('Google sign-in error:', error);
        throw error;
      }
    }
  }

  private isMetaMaskBrowser(): boolean {
    if (typeof window === 'undefined') return false;
    
    const userAgent = navigator.userAgent;
    const ethereum = (window as any).ethereum;
    
    // Check for MetaMask browser indicators
    return (
      userAgent.includes('MetaMask') ||
      userAgent.includes('WebView') ||
      (ethereum && ethereum.isMetaMask) ||
      // Additional check for MetaMask mobile browser
      (userAgent.includes('Mobile') && ethereum && ethereum.isMetaMask)
    );
  }

  private isMobileBrowser(): boolean {
    if (typeof window === 'undefined') return false;
    
    const userAgent = navigator.userAgent;
    
    // Check for mobile browser indicators
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ||
      userAgent.includes('Mobile') ||
      userAgent.includes('mobile')
    );
  }

  private async signInWithGooglePopup(): Promise<UserProfile> {
    try {
      const result = await signInWithPopup(auth, this.googleProvider);
      const user = result.user;
      
      // Set MCP context first
      const context = createMCPContext(user.uid, { method: 'google' });
      mcpManager.setContext(context);
      
      const userProfile = await this.createOrUpdateUserProfile(user);
      
      // Emit MCP event (now context is set)
      try {
        await emitMCPEvent('user_authenticated', {
          method: 'google',
          userId: user.uid,
          userProfile,
        });
      } catch (mcpError) {
        console.warn('MCP event failed, continuing with auth:', mcpError);
      }

      return userProfile;
    } catch (error: any) {
      // Check if it's a Google policy error (Use secure browsers)
      if (error.code === 'auth/operation-not-allowed' || 
          error.message?.includes('Use secure browsers') ||
          error.message?.includes('does not comply with Google') ||
          error.message?.includes('Access blocked')) {
        
        console.log('🔍 [AUTH DEBUG] Google popup blocked by policy, falling back to redirect method');
        
        // Fall back to redirect method for mobile browsers
        return await this.signInWithGoogleRedirect();
      }
      
      // Re-throw other errors
      throw error;
    }
  }

  private async signInWithGoogleRedirect(): Promise<UserProfile> {
    // Use redirect method instead of popup
    const { signInWithRedirect, getRedirectResult } = await import('firebase/auth');
    
    try {
      // Check if we're returning from a redirect
      const result = await getRedirectResult(auth);
      
      if (result) {
        // User just returned from redirect
        const user = result.user;
        
        // Set MCP context first
        const context = createMCPContext(user.uid, { method: 'google' });
        mcpManager.setContext(context);
        
        const userProfile = await this.createOrUpdateUserProfile(user);
        
        // Emit MCP event (now context is set)
        try {
          await emitMCPEvent('user_authenticated', {
            method: 'google',
            userId: user.uid,
            userProfile,
          });
        } catch (mcpError) {
          console.warn('MCP event failed, continuing with auth:', mcpError);
        }

        return userProfile;
      } else {
        // No redirect result, initiate redirect
        console.log('🔍 [AUTH DEBUG] Initiating Google redirect authentication');
        await signInWithRedirect(auth, this.googleProvider);
        // This will redirect the page, so we won't reach here
        throw new Error('Redirect initiated');
      }
    } catch (error: any) {
      if (error.message === 'Redirect initiated') {
        throw error; // Re-throw redirect errors
      }
      console.error('Google redirect sign-in error:', error);
      throw error;
    }
  }


  async signInWithMetaMask(): Promise<UserProfile> {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        throw new Error('MetaMask is only available in browser environments');
      }

      // Check for MetaMask or other Web3 providers
      const ethereum = (window as any).ethereum;
      
      if (!ethereum) {
        // Check if we're on mobile and might need to redirect to MetaMask app
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
          // Try to open MetaMask app
          const currentUrl = window.location.href;
          const metamaskUrl = `metamask://dapp/${currentUrl}`;
          
          // Try to redirect to MetaMask app
          try {
            window.location.href = metamaskUrl;
          } catch (error) {
            console.error('Failed to redirect to MetaMask app:', error);
          }
          
          // If we can't detect MetaMask, provide helpful instructions
          throw new Error('MetaMask not detected. Please install MetaMask mobile app and open this site in the MetaMask browser.');
        } else {
          throw new Error('MetaMask not detected. Please install MetaMask browser extension.');
        }
      }

      // Check if MetaMask is locked
      const isMetaMaskLocked = ethereum.isMetaMask && !ethereum.selectedAddress;
      if (isMetaMaskLocked) {
        throw new Error('MetaMask is locked. Please unlock your MetaMask wallet and try again.');
      }

      // Request account access
      let accounts;
      try {
        accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      } catch (requestError: any) {
        if (requestError.code === 4001) {
          throw new Error('User rejected the connection request');
        } else if (requestError.code === -32002) {
          throw new Error('Connection request already pending. Please check MetaMask.');
        } else {
          throw new Error(`Connection failed: ${requestError.message || 'Unknown error'}`);
        }
      }
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please connect an account in MetaMask.');
      }

      const walletAddress = accounts[0];
      const uid = `metamask_${walletAddress}`;

      // Set MCP context first
      const context = createMCPContext(uid, { method: 'metamask', walletAddress });
      mcpManager.setContext(context);

      const userProfile = await this.createMetaMaskUserProfile(walletAddress);
      
      // Emit MCP event (now context is set)
      try {
        await emitMCPEvent('user_authenticated', {
          method: 'metamask',
          walletAddress,
          userProfile,
        });
      } catch (mcpError) {
        console.warn('MCP event failed, continuing with auth:', mcpError);
      }

      return userProfile;
    } catch (error) {
      console.error('MetaMask sign-in error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await emitMCPEvent('user_signed_out', {});
      await signOut(auth);
      mcpManager.setContext(null);
    } catch (error) {
      console.error('Sign-out error:', error);
      // Still try to sign out if event emission fails
      if (auth.currentUser) {
        await signOut(auth);
        mcpManager.setContext(null);
      }
      throw error;
    }
  }

  async updateUserPreferences(uid: string, preferences: Partial<UserProfile['preferences']>): Promise<void> {
    try {
      console.log("🔍 [FIREBASE DEBUG] Updating user preferences:", { uid, preferences });
      
      // Get current preferences to merge with new ones
      const currentPreferences = await this.getUserPreferences(uid);
      const updatedPreferences = { ...currentPreferences, ...preferences };
      
      // Store preferences in localStorage for immediate access
      localStorage.setItem(`user_preferences_${uid}`, JSON.stringify(updatedPreferences));
      console.log("🔍 [FIREBASE DEBUG] Preferences stored in localStorage:", updatedPreferences);
      
      // Also update Firebase user document with complete preferences
      try {
        await FirebaseService.updateUserProfile(uid, {
          preferences: updatedPreferences
        });
        console.log("🔍 [FIREBASE DEBUG] Preferences saved to Firebase successfully");
      } catch (firebaseError) {
        console.error("🔍 [FIREBASE DEBUG] Failed to save preferences to Firebase:", firebaseError);
        // Don't throw error, localStorage backup is sufficient
      }
    } catch (error) {
      console.error("🔍 [FIREBASE DEBUG] Error updating user preferences:", error);
      throw error;
    }
  }

  async getUserPreferences(uid: string): Promise<UserProfile['preferences']> {
    try {
      // First try to get from Firebase
      const firebaseProfile = await FirebaseService.getUserProfile(uid);
      if (firebaseProfile?.preferences) {
        return firebaseProfile.preferences;
      }
      
      // Fallback to localStorage
      const stored = localStorage.getItem(`user_preferences_${uid}`);
      if (stored) {
        const preferences = JSON.parse(stored);
        return preferences;
      }
      
      // Return default preferences
      return { theme: 'dark', notifications: true, language: 'en' };
    } catch (error) {
      console.error("🔍 [FIREBASE DEBUG] Error getting user preferences:", error);
      return { theme: 'dark', notifications: true, language: 'en' };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const firebaseProfile = await FirebaseService.getUserProfile(uid);
      if (!firebaseProfile) return null;
      
      // Get user preferences from localStorage
      const preferences = await this.getUserPreferences(uid);
      
      // Convert Firebase profile to auth profile format
      return {
        uid: firebaseProfile.uid,
        email: firebaseProfile.email,
        displayName: firebaseProfile.displayName,
        walletAddress: firebaseProfile.walletAddress,
        level: 1, // Default level
        experience: 0, // Default experience
        totalTrades: firebaseProfile.totalTrades,
        totalVolume: firebaseProfile.totalVolume,
        achievements: firebaseProfile.achievements,
        createdAt: firebaseProfile.createdAt?.toMillis?.() || Date.now(),
        lastLogin: firebaseProfile.lastLoginAt?.toMillis?.() || Date.now(),
        preferences
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  private async createOrUpdateUserProfile(user: User): Promise<UserProfile> {
    try {
      // Check if user profile exists
      const existingProfile = await FirebaseService.getUserProfile(user.uid);
      
      if (existingProfile) {
        // Update last login
        await FirebaseService.updateUserProfile(user.uid, {});
        
        // Return converted profile
        return {
          uid: existingProfile.uid,
          email: existingProfile.email,
          displayName: existingProfile.displayName,
          walletAddress: existingProfile.walletAddress,
          level: 1,
          experience: 0,
          totalTrades: existingProfile.totalTrades,
          totalVolume: existingProfile.totalVolume,
          achievements: existingProfile.achievements,
          createdAt: existingProfile.createdAt?.toMillis?.() || Date.now(),
          lastLogin: Date.now(),
          preferences: { theme: 'dark', notifications: true, language: 'en' },
        };
      } else {
        // Create new profile using FirebaseService
        const newProfileData = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Anonymous User',
          walletAddress: undefined,
          isVerified: false,
          tradingEnabled: true,
          totalTrades: 0,
          totalVolume: 0,
          achievements: [],
          referralCode: `REF${user.uid.slice(-8).toUpperCase()}`,
        };
        
        await FirebaseService.createUserProfile(newProfileData);
        
        // Return converted profile
        return {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Anonymous User',
          walletAddress: undefined,
          level: 1,
          experience: 0,
          totalTrades: 0,
          totalVolume: 0,
          achievements: [],
          createdAt: Date.now(),
          lastLogin: Date.now(),
          preferences: { theme: 'dark', notifications: true, language: 'en' },
        };
      }
    } catch (error) {
      console.error('Error creating/updating user profile:', error);
      throw error;
    }
  }

  private async createMetaMaskUserProfile(walletAddress: string): Promise<UserProfile> {
    const uid = `metamask_${walletAddress}`;
    
    try {
      // Check if user profile exists
      const existingProfile = await FirebaseService.getUserProfile(uid);
      
      if (existingProfile) {
        // Update last login
        await FirebaseService.updateUserProfile(uid, {});
        
        // Return converted profile
        return {
          uid: existingProfile.uid,
          email: existingProfile.email,
          displayName: existingProfile.displayName,
          walletAddress: existingProfile.walletAddress,
          level: 1,
          experience: 0,
          totalTrades: existingProfile.totalTrades,
          totalVolume: existingProfile.totalVolume,
          achievements: existingProfile.achievements,
          createdAt: existingProfile.createdAt?.toMillis?.() || Date.now(),
          lastLogin: Date.now(),
          preferences: { theme: 'dark', notifications: true, language: 'en' },
        };
      } else {
        // Create new profile using FirebaseService
        const newProfileData = {
          uid,
          email: '',
          displayName: `Wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
          walletAddress,
          isVerified: false,
          tradingEnabled: true,
          totalTrades: 0,
          totalVolume: 0,
          achievements: [],
          referralCode: `REF${uid.slice(-8).toUpperCase()}`,
        };
        
        await FirebaseService.createUserProfile(newProfileData);
        
        // Return converted profile
        return {
          uid,
          email: '',
          displayName: `Wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
          walletAddress,
          level: 1,
          experience: 0,
          totalTrades: 0,
          totalVolume: 0,
          achievements: [],
          createdAt: Date.now(),
          lastLogin: Date.now(),
          preferences: { theme: 'dark', notifications: true, language: 'en' },
        };
      }
    } catch (error) {
      console.error('Error creating/updating MetaMask user profile:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
