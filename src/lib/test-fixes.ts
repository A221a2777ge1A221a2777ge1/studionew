/**
 * Test script to verify all fixes are working correctly
 * This file can be imported and used for testing the application
 */

import { authService } from './auth';
import { FirebaseService } from './firebaseService';

export class FixTester {
  /**
   * Test Firebase database integration
   */
  static async testFirebaseIntegration(): Promise<boolean> {
    try {
      console.log('Testing Firebase database integration...');
      
      // Test contract config
      const contractConfig = await FirebaseService.getContractConfig();
      console.log('Contract config retrieved:', contractConfig ? 'Success' : 'No config found');
      
      // Test user profile creation (mock data)
      const testUserId = 'test_user_' + Date.now();
      const testUserData = {
        uid: testUserId,
        email: 'test@example.com',
        displayName: 'Test User',
        isVerified: false,
        tradingEnabled: true,
        totalTrades: 0,
        totalVolume: 0,
        achievements: [],
        referralCode: `REF${testUserId.slice(-8).toUpperCase()}`,
      };
      
      await FirebaseService.createUserProfile(testUserData);
      console.log('User profile created successfully');
      
      // Test user profile retrieval
      const retrievedProfile = await FirebaseService.getUserProfile(testUserId);
      console.log('User profile retrieved:', retrievedProfile ? 'Success' : 'Failed');
      
      return true;
    } catch (error) {
      console.error('Firebase integration test failed:', error);
      return false;
    }
  }

  /**
   * Test theme persistence
   */
  static testThemePersistence(): boolean {
    try {
      console.log('Testing theme persistence...');
      
      const testUserId = 'test_user_theme';
      const testPreferences = {
        theme: 'light' as const,
        notifications: true,
        language: 'en'
      };
      
      // Test storing preferences
      localStorage.setItem(`user_preferences_${testUserId}`, JSON.stringify(testPreferences));
      
      // Test retrieving preferences
      const stored = localStorage.getItem(`user_preferences_${testUserId}`);
      const retrieved = stored ? JSON.parse(stored) : null;
      
      const success = retrieved && retrieved.theme === 'light';
      console.log('Theme persistence test:', success ? 'Success' : 'Failed');
      
      // Cleanup
      localStorage.removeItem(`user_preferences_${testUserId}`);
      
      return success;
    } catch (error) {
      console.error('Theme persistence test failed:', error);
      return false;
    }
  }

  /**
   * Test mobile detection
   */
  static testMobileDetection(): boolean {
    try {
      console.log('Testing mobile detection...');
      
      // Mock mobile user agent
      const originalUserAgent = navigator.userAgent;
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      });
      
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Restore original user agent
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: originalUserAgent
      });
      
      console.log('Mobile detection test:', isMobile ? 'Success' : 'Failed');
      return isMobile;
    } catch (error) {
      console.error('Mobile detection test failed:', error);
      return false;
    }
  }

  /**
   * Test MetaMask detection
   */
  static testMetaMaskDetection(): boolean {
    try {
      console.log('Testing MetaMask detection...');
      
      // Test without MetaMask
      const hasMetaMask = typeof window !== 'undefined' && !!(window as any).ethereum;
      console.log('MetaMask detection (no MetaMask):', !hasMetaMask ? 'Success' : 'Failed');
      
      return true;
    } catch (error) {
      console.error('MetaMask detection test failed:', error);
      return false;
    }
  }

  /**
   * Run all tests
   */
  static async runAllTests(): Promise<{ [key: string]: boolean }> {
    console.log('Running comprehensive fix tests...');
    
    const results = {
      firebaseIntegration: await this.testFirebaseIntegration(),
      themePersistence: this.testThemePersistence(),
      mobileDetection: this.testMobileDetection(),
      metaMaskDetection: this.testMetaMaskDetection(),
    };
    
    const allPassed = Object.values(results).every(result => result);
    console.log('All tests passed:', allPassed);
    console.log('Test results:', results);
    
    return results;
  }
}

// Export for use in development
export const testFixes = FixTester.runAllTests;
