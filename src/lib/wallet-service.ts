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
   * Check if MetaMask is injected (desktop or MetaMask mobile in-app browser)
   */
  isMetaMaskInjected(): boolean {
    return typeof window !== 'undefined' && !!(window as any).ethereum?.isMetaMask;
  }

  /**
   * Check if any wallet provider is injected
   */
  isAnyInjectedProvider(): boolean {
    return typeof window !== 'undefined' && !!(window as any).ethereum;
  }

  /**
   * Check if we're in MetaMask mobile browser
   */
  isInMetaMaskBrowser(): boolean {
    if (typeof window === 'undefined') return false;
    return navigator.userAgent.includes('MetaMask');
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
   * Connect using injected provider (desktop or MetaMask mobile in-app browser)
   */
  async connectInjectedProvider(): Promise<WalletConnectionResult> {
    if (!this.isAnyInjectedProvider()) {
      throw new Error('No injected wallet provider found');
    }

    try {
      console.log('🔍 [WALLET SERVICE] Connecting with injected provider');
      
      // Request account access
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please connect an account in your wallet.');
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = network.chainId.toString();

      console.log('🔍 [WALLET SERVICE] Injected provider connected:', {
        address,
        chainId,
        isMetaMask: this.isMetaMaskInjected(),
        isInMetaMaskBrowser: this.isInMetaMaskBrowser()
      });

      return {
        address,
        provider,
        signer,
        chainId
      };

    } catch (error: any) {
      console.error('🔍 [WALLET SERVICE] Injected provider connection error:', error);
      throw new Error(`Wallet connection failed: ${error.message}`);
    }
  }

  /**
   * Connect using MetaMask SDK (mobile deep-link)
   */
  async connectMetaMaskSDK(): Promise<WalletConnectionResult> {
    try {
      console.log('🔍 [WALLET SERVICE] Connecting with MetaMask SDK');
      
      // Dynamic import to avoid SSR issues
      const MetaMaskSDK = (await import('@metamask/sdk')).default;
      
      const MMSDK = new MetaMaskSDK({
        dappMetadata: {
          name: 'DreamCoin',
          url: window.location.origin
        },
        injectProvider: false, // Don't inject into window.ethereum
        communicationServerUrl: 'https://metamask-sdk-socket.metamask.io/',
      });

      const ethereum = MMSDK.getProvider();
      
      if (!ethereum) {
        throw new Error('MetaMask SDK provider not available');
      }

      // Request account access (this will deep-link to MetaMask app)
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please connect an account in MetaMask.');
      }

      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = network.chainId.toString();

      console.log('🔍 [WALLET SERVICE] MetaMask SDK connected:', {
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
      console.error('🔍 [WALLET SERVICE] MetaMask SDK connection error:', error);
      throw new Error(`MetaMask SDK connection failed: ${error.message}`);
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
   * Robust wallet connection flow - tries injected → MetaMask SDK → WalletConnect
   */
  async connectWallet(): Promise<WalletConnectionResult> {
    const isMobile = this.isMobile();
    const hasInjectedProvider = this.isAnyInjectedProvider();
    const isMetaMaskInjected = this.isMetaMaskInjected();
    const isInMetaMaskBrowser = this.isInMetaMaskBrowser();

    console.log('🔍 [WALLET SERVICE] Connection strategy:', {
      isMobile,
      hasInjectedProvider,
      isMetaMaskInjected,
      isInMetaMaskBrowser,
      userAgent: navigator.userAgent,
      ethereum: !!(window as any).ethereum
    });

    // Strategy 1: Try injected provider first (desktop or MetaMask mobile in-app browser)
    if (hasInjectedProvider) {
      console.log('🔍 [WALLET SERVICE] Trying injected provider connection');
      try {
        return await this.connectInjectedProvider();
      } catch (error) {
        console.warn('🔍 [WALLET SERVICE] Injected provider failed:', error);
        // Continue to next strategy
      }
    }

    // Strategy 2: Try MetaMask SDK deep-link (best for MetaMask mobile app)
    if (isMobile && !isInMetaMaskBrowser) {
      console.log('🔍 [WALLET SERVICE] Trying MetaMask SDK deep-link');
      try {
        return await this.connectMetaMaskSDK();
      } catch (error) {
        console.warn('🔍 [WALLET SERVICE] MetaMask SDK failed:', error);
        // Continue to next strategy
      }
    }

    // Strategy 3: Try WalletConnect fallback (universal wallet support)
    console.log('🔍 [WALLET SERVICE] Trying WalletConnect fallback');
    try {
      return await this.connectWalletConnect();
    } catch (error) {
      console.error('🔍 [WALLET SERVICE] WalletConnect failed:', error);
    }

    // All strategies failed
    throw new Error('No wallet available. Please install MetaMask or use a WalletConnect-compatible wallet.');
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
