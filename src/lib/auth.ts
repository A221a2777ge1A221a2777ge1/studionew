import { useState, useEffect } from 'react';
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
          // Try to detect if MetaMask mobile app is installed
          const metamaskDeepLink = 'metamask://dapp/';
          const currentUrl = window.location.href;
          
          // If we can't detect MetaMask, provide helpful instructions
          throw new Error('MetaMask not detected. Please install MetaMask mobile app or use MetaMask browser extension.');
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
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists() ? userDoc.data() as UserProfile : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  private async createOrUpdateUserProfile(user: User): Promise<UserProfile> {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    const now = Date.now();
    
    if (userDoc.exists()) {
      const updatedProfile = { lastLogin: now };
      await updateDoc(userRef, updatedProfile);
      return { ...userDoc.data(), ...updatedProfile } as UserProfile;
    } else {
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Anonymous User',
        photoURL: user.photoURL || undefined,
        level: 1,
        experience: 0,
        totalTrades: 0,
        totalVolume: 0,
        achievements: [],
        createdAt: now,
        lastLogin: now,
        preferences: { theme: 'dark', notifications: true, language: 'en' },
      };
      await setDoc(userRef, newProfile);
      return newProfile;
    }
  }

  private async createMetaMaskUserProfile(walletAddress: string): Promise<UserProfile> {
    const uid = `metamask_${walletAddress}`;
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    const now = Date.now();

    if (userDoc.exists()) {
      const updatedProfile = { lastLogin: now };
      await updateDoc(userRef, updatedProfile);
      return { ...userDoc.data(), ...updatedProfile } as UserProfile;
    } else {
      const newProfile: UserProfile = {
        uid,
        email: '',
        displayName: `Wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        walletAddress,
        level: 1,
        experience: 0,
        totalTrades: 0,
        totalVolume: 0,
        achievements: [],
        createdAt: now,
        lastLogin: now,
        preferences: { theme: 'dark', notifications: true, language: 'en' },
      };
      await setDoc(userRef, newProfile);
      return newProfile;
    }
  }
}

export const authService = new AuthService();

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
    signInWithGoogle: authService.signInWithGoogle.bind(authService),
    signInWithMetaMask: authService.signInWithMetaMask.bind(authService),
    signOut: authService.signOut.bind(authService),
  };
};
