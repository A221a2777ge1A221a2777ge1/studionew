import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  User,
  UserCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { createMCPContext, emitMCPEvent } from './mcp-pattern';

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
    // Configure Google provider
    this.googleProvider.addScope('email');
    this.googleProvider.addScope('profile');
  }

  async signInWithGoogle(): Promise<UserProfile> {
    try {
      const result: UserCredential = await signInWithPopup(auth, this.googleProvider);
      const user = result.user;
      
      // Create or update user profile
      const userProfile = await this.createOrUpdateUserProfile(user);
      
      // Emit MCP event
      await emitMCPEvent('user_authenticated', {
        method: 'google',
        userId: user.uid,
        userProfile,
      });

      return userProfile;
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }

  async signInWithEmail(email: string, password: string): Promise<UserProfile> {
    try {
      const result: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      const userProfile = await this.createOrUpdateUserProfile(user);
      
      await emitMCPEvent('user_authenticated', {
        method: 'email',
        userId: user.uid,
        userProfile,
      });

      return userProfile;
    } catch (error) {
      console.error('Email sign-in error:', error);
      throw error;
    }
  }

  async signUpWithEmail(email: string, password: string, displayName: string): Promise<UserProfile> {
    try {
      const result: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Update display name
      await user.updateProfile({ displayName });
      
      const userProfile = await this.createOrUpdateUserProfile(user);
      
      await emitMCPEvent('user_registered', {
        method: 'email',
        userId: user.uid,
        userProfile,
      });

      return userProfile;
    } catch (error) {
      console.error('Email sign-up error:', error);
      throw error;
    }
  }

  async signInWithMetaMask(): Promise<UserProfile> {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask not detected');
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const walletAddress = accounts[0];
      
      // Create anonymous user profile for MetaMask
      const userProfile = await this.createMetaMaskUserProfile(walletAddress);
      
      await emitMCPEvent('user_authenticated', {
        method: 'metamask',
        walletAddress,
        userProfile,
      });

      return userProfile;
    } catch (error) {
      console.error('MetaMask sign-in error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      await emitMCPEvent('user_signed_out', {});
    } catch (error) {
      console.error('Sign-out error:', error);
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
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...updates,
        lastUpdated: Date.now(),
      });
      
      await emitMCPEvent('user_profile_updated', {
        userId: uid,
        updates,
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async linkWalletAddress(uid: string, walletAddress: string): Promise<void> {
    try {
      await this.updateUserProfile(uid, { walletAddress });
      
      await emitMCPEvent('wallet_linked', {
        userId: uid,
        walletAddress,
      });
    } catch (error) {
      console.error('Error linking wallet:', error);
      throw error;
    }
  }

  private async createOrUpdateUserProfile(user: User): Promise<UserProfile> {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    const now = Date.now();
    
    if (userDoc.exists()) {
      // Update existing user
      const existingProfile = userDoc.data() as UserProfile;
      const updatedProfile: UserProfile = {
        ...existingProfile,
        email: user.email || existingProfile.email,
        displayName: user.displayName || existingProfile.displayName,
        photoURL: user.photoURL || existingProfile.photoURL,
        lastLogin: now,
      };
      
      await setDoc(userRef, updatedProfile);
      return updatedProfile;
    } else {
      // Create new user profile
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Anonymous User',
        photoURL: user.photoURL,
        level: 1,
        experience: 0,
        totalTrades: 0,
        totalVolume: 0,
        achievements: [],
        createdAt: now,
        lastLogin: now,
        preferences: {
          theme: 'dark',
          notifications: true,
          language: 'en',
        },
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
      // Update existing MetaMask user
      const existingProfile = userDoc.data() as UserProfile;
      const updatedProfile: UserProfile = {
        ...existingProfile,
        lastLogin: now,
      };
      
      await setDoc(userRef, updatedProfile);
      return updatedProfile;
    } else {
      // Create new MetaMask user profile
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
        preferences: {
          theme: 'dark',
          notifications: true,
          language: 'en',
        },
      };
      
      await setDoc(userRef, newProfile);
      return newProfile;
    }
  }
}

// Global auth service instance
export const authService = new AuthService();

// Auth state management hook
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        const profile = await authService.getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
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
    signInWithEmail: authService.signInWithEmail.bind(authService),
    signUpWithEmail: authService.signUpWithEmail.bind(authService),
    signInWithMetaMask: authService.signInWithMetaMask.bind(authService),
    signOut: authService.signOut.bind(authService),
    updateUserProfile: authService.updateUserProfile.bind(authService),
    linkWalletAddress: authService.linkWalletAddress.bind(authService),
  };
};

// Import React hooks
import { useState, useEffect } from 'react';
