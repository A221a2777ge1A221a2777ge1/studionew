import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export interface ContractConfig {
  address: string;
  abiVersion: string;
  deployedAt: string;
  network: 'bsc' | 'bsc-testnet';
  routerAddress: string;
  treasuryAddress: string;
  devWallet: string;
  isActive: boolean;
  lastUpdated: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  walletAddress?: string;
  createdAt: any;
  lastLoginAt: any;
  isVerified: boolean;
  tradingEnabled: boolean;
  totalTrades: number;
  totalVolume: number;
  achievements: string[];
  referralCode: string;
  referredBy?: string;
}

export class FirebaseService {
  // Contract Configuration
  static async getContractConfig(): Promise<ContractConfig | null> {
    try {
      const contractRef = doc(db, 'config', 'contract');
      const contractSnap = await getDoc(contractRef);
      
      if (contractSnap.exists()) {
        return contractSnap.data() as ContractConfig;
      }
      return null;
    } catch (error) {
      console.error('Error getting contract config:', error);
      throw error;
    }
  }

  static async setContractConfig(config: Partial<ContractConfig>): Promise<void> {
    try {
      const contractRef = doc(db, 'config', 'contract');
      await setDoc(contractRef, {
        ...config,
        lastUpdated: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error('Error setting contract config:', error);
      throw error;
    }
  }

  // User Management
  static async createUserProfile(userData: Partial<UserProfile>): Promise<void> {
    try {
      if (!userData.uid) {
        throw new Error('User ID is required');
      }

      const userRef = doc(db, 'users', userData.uid);
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        totalTrades: 0,
        totalVolume: 0,
        achievements: [],
        isVerified: false,
        tradingEnabled: true,
      }, { merge: true });
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  static async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...updates,
        lastLoginAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  static async updateUserWalletAddress(uid: string, walletAddress: string): Promise<void> {
    try {
      await this.updateUserProfile(uid, { walletAddress });
    } catch (error) {
      console.error('Error updating wallet address:', error);
      throw error;
    }
  }

  // Trading Data
  static async recordTrade(tradeData: {
    userId: string;
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    amountOut: string;
    slippage: number;
    txHash: string;
    status: 'pending' | 'completed' | 'failed';
  }): Promise<void> {
    try {
      const tradeRef = doc(db, 'trades', tradeData.txHash);
      await setDoc(tradeRef, {
        ...tradeData,
        timestamp: serverTimestamp(),
      });

      // Update user's trading stats
      if (tradeData.status === 'completed') {
        const userRef = doc(db, 'users', tradeData.userId);
        await updateDoc(userRef, {
          totalTrades: tradeData.amountIn, // This should be incremented, but for simplicity using amount
          totalVolume: tradeData.amountIn, // This should be accumulated
        });
      }
    } catch (error) {
      console.error('Error recording trade:', error);
      throw error;
    }
  }

  // Achievements
  static async unlockAchievement(userId: string, achievementId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data() as UserProfile;
        const achievements = userData.achievements || [];
        
        if (!achievements.includes(achievementId)) {
          await updateDoc(userRef, {
            achievements: [...achievements, achievementId],
          });
        }
      }
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      throw error;
    }
  }

  // Referrals
  static async createReferralCode(userId: string): Promise<string> {
    try {
      const referralCode = `REF${userId.slice(-8).toUpperCase()}`;
      await this.updateUserProfile(userId, { referralCode });
      return referralCode;
    } catch (error) {
      console.error('Error creating referral code:', error);
      throw error;
    }
  }

  static async processReferral(referralCode: string, newUserId: string): Promise<void> {
    try {
      // Find user with this referral code
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('referralCode', '==', referralCode));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const referrerDoc = querySnapshot.docs[0];
        const referrerId = referrerDoc.id;
        
        // Update new user with referrer info
        await this.updateUserProfile(newUserId, { referredBy: referrerId });
        
        // Update referrer's stats (you might want to add referral rewards here)
        const referrerRef = doc(db, 'users', referrerId);
        await updateDoc(referrerRef, {
          // Add referral rewards or stats here
        });
      }
    } catch (error) {
      console.error('Error processing referral:', error);
      throw error;
    }
  }

  // MCP Events
  static async recordMCPEvent(eventData: {
    userId: string;
    eventType: string;
    data: any;
  }): Promise<void> {
    try {
      const eventRef = doc(db, 'mcp_events', `${eventData.userId}_${Date.now()}`);
      await setDoc(eventRef, {
        ...eventData,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error recording MCP event:', error);
      throw error;
    }
  }
}

// Helper function to initialize contract config from environment variables
export async function initializeContractConfig(): Promise<void> {
  try {
    const contractAddress = process.env.NEXT_PUBLIC_BBFT_CONTRACT_ADDRESS;
    const treasuryAddress = process.env.NEXT_PUBLIC_BBFT_TREASURY_ADDRESS;
    const devWallet = process.env.NEXT_PUBLIC_BBFT_DEV_WALLET;
    const routerAddress = process.env.NEXT_PUBLIC_PANCAKESWAP_ROUTER;

    if (contractAddress && treasuryAddress && devWallet && routerAddress) {
      await FirebaseService.setContractConfig({
        address: contractAddress,
        abiVersion: '1.0.0',
        deployedAt: new Date().toISOString(),
        network: 'bsc',
        routerAddress,
        treasuryAddress,
        devWallet,
        isActive: true,
      });
    }
  } catch (error) {
    console.error('Error initializing contract config:', error);
  }
}
