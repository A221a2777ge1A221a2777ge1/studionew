import { ethers } from 'ethers';
import { EthereumProvider } from '@walletconnect/ethereum-provider';

export interface WalletConnectionResult {
  address: string;
  provider: ethers.BrowserProvider;
  signer: ethers.JsonRpcSigner;
  chainId: string;
}

export interface NonceVerificationResult {
  success: boolean;
  message?: string;
  wallet?: {
    address: string;
    linkedAt: string;
  };
}

export class WalletService {
  private static instance: WalletService;
  private walletConnectProvider: any = null;

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  /**
   * Check if MetaMask is available
   */
  isMetaMaskAvailable(): boolean {
    return typeof window !== 'undefined' && !!(window as any).ethereum?.isMetaMask;
  }

  /**
   * Check if we're on mobile
   */
  isMobile(): boolean {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Check if we're in MetaMask browser
   */
  isMetaMaskBrowser(): boolean {
    if (typeof window === 'undefined') return false;
    const userAgent = navigator.userAgent;
    return userAgent.includes('MetaMask') || userAgent.includes('WebView');
  }

  /**
   * Connect to MetaMask (desktop or mobile)
   */
  async connectMetaMask(): Promise<WalletConnectionResult> {
    if (!this.isMetaMaskAvailable()) {
      throw new Error('MetaMask not detected. Please install MetaMask browser extension or use MetaMask mobile app.');
    }

    try {
      // Request account access
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please connect an account in MetaMask.');
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = network.chainId.toString();

      console.log('🔍 [WALLET SERVICE] MetaMask connected:', {
        address,
        chainId,
        isMobile: this.isMobile(),
        isMetaMaskBrowser: this.isMetaMaskBrowser()
      });

      return {
        address,
        provider,
        signer,
        chainId
      };

    } catch (error: any) {
      console.error('🔍 [WALLET SERVICE] MetaMask connection error:', error);
      throw new Error(`MetaMask connection failed: ${error.message}`);
    }
  }

  /**
   * Connect using WalletConnect (mobile fallback)
   */
  async connectWalletConnect(): Promise<WalletConnectionResult> {
    try {
      if (!this.walletConnectProvider) {
        this.walletConnectProvider = await EthereumProvider.init({
          projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
          chains: [56], // BSC Mainnet
          showQrModal: true,
          metadata: {
            name: 'DreamCoin',
            description: 'Build your crypto empire with DreamCoin',
            url: window.location.origin,
            icons: [`${window.location.origin}/favicon.ico`]
          }
        });
      }

      // Enable session (triggers QR Code modal)
      await this.walletConnectProvider.enable();

      const provider = new ethers.BrowserProvider(this.walletConnectProvider);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = network.chainId.toString();

      console.log('🔍 [WALLET SERVICE] WalletConnect connected:', {
        address,
        chainId
      });

      return {
        address,
        provider,
        signer,
        chainId
      };

    } catch (error: any) {
      console.error('🔍 [WALLET SERVICE] WalletConnect connection error:', error);
      throw new Error(`WalletConnect connection failed: ${error.message}`);
    }
  }

  /**
   * Smart wallet connection - chooses best method for the device
   */
  async connectWallet(): Promise<WalletConnectionResult> {
    const isMobile = this.isMobile();
    const isMetaMaskBrowser = this.isMetaMaskBrowser();
    const hasMetaMask = this.isMetaMaskAvailable();

    console.log('🔍 [WALLET SERVICE] Connection strategy:', {
      isMobile,
      isMetaMaskBrowser,
      hasMetaMask
    });

    // Strategy 1: MetaMask browser - use direct connection
    if (isMetaMaskBrowser) {
      return await this.connectMetaMask();
    }

    // Strategy 2: Desktop with MetaMask extension
    if (!isMobile && hasMetaMask) {
      return await this.connectMetaMask();
    }

    // Strategy 3: Mobile with MetaMask available
    if (isMobile && hasMetaMask) {
      return await this.connectMetaMask();
    }

    // Strategy 4: Mobile without MetaMask - use WalletConnect
    if (isMobile && !hasMetaMask) {
      return await this.connectWalletConnect();
    }

    // Fallback: Try MetaMask anyway
    if (hasMetaMask) {
      return await this.connectMetaMask();
    }

    throw new Error('No compatible wallet found. Please install MetaMask or use a WalletConnect-compatible wallet.');
  }

  /**
   * Get nonce from backend
   */
  async getNonce(uid: string): Promise<string> {
    try {
      const response = await fetch(`/api/auth/nonce?uid=${uid}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to get nonce');
      }

      console.log('🔍 [WALLET SERVICE] Nonce received for UID:', uid);
      return data.nonce;

    } catch (error: any) {
      console.error('🔍 [WALLET SERVICE] Error getting nonce:', error);
      throw new Error(`Failed to get nonce: ${error.message}`);
    }
  }

  /**
   * Sign message with connected wallet
   */
  async signMessage(signer: ethers.JsonRpcSigner, message: string): Promise<string> {
    try {
      const signature = await signer.signMessage(message);
      console.log('🔍 [WALLET SERVICE] Message signed successfully');
      return signature;
    } catch (error: any) {
      console.error('🔍 [WALLET SERVICE] Error signing message:', error);
      throw new Error(`Failed to sign message: ${error.message}`);
    }
  }

  /**
   * Verify wallet ownership with backend
   */
  async verifyWalletOwnership(uid: string, address: string, signature: string): Promise<NonceVerificationResult> {
    try {
      const response = await fetch('/api/auth/verify-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid,
          address,
          signature
        })
      });

      const data = await response.json();
      console.log('🔍 [WALLET SERVICE] Wallet verification result:', data);
      return data;

    } catch (error: any) {
      console.error('🔍 [WALLET SERVICE] Error verifying wallet:', error);
      return {
        success: false,
        message: `Verification failed: ${error.message}`
      };
    }
  }

  /**
   * Complete wallet linking flow
   */
  async linkWallet(uid: string): Promise<NonceVerificationResult> {
    try {
      console.log('🔍 [WALLET SERVICE] Starting wallet linking flow for UID:', uid);

      // Step 1: Connect wallet
      const walletResult = await this.connectWallet();
      console.log('🔍 [WALLET SERVICE] Wallet connected:', walletResult.address);

      // Step 2: Get nonce from backend
      const nonce = await this.getNonce(uid);
      console.log('🔍 [WALLET SERVICE] Nonce received');

      // Step 3: Sign the nonce
      const signature = await this.signMessage(walletResult.signer, nonce);
      console.log('🔍 [WALLET SERVICE] Nonce signed');

      // Step 4: Verify with backend
      const verificationResult = await this.verifyWalletOwnership(uid, walletResult.address, signature);
      console.log('🔍 [WALLET SERVICE] Verification completed:', verificationResult);

      return verificationResult;

    } catch (error: any) {
      console.error('🔍 [WALLET SERVICE] Wallet linking failed:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnect(): Promise<void> {
    try {
      if (this.walletConnectProvider) {
        await this.walletConnectProvider.disconnect();
        this.walletConnectProvider = null;
      }
      console.log('🔍 [WALLET SERVICE] Wallet disconnected');
    } catch (error) {
      console.error('🔍 [WALLET SERVICE] Error disconnecting wallet:', error);
    }
  }
}

export const walletService = WalletService.getInstance();
