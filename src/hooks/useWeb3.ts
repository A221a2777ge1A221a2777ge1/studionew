'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useToast } from '@/hooks/use-toast';

// BSC Mainnet Configuration
export const BSC_CONFIG = {
  chainId: '0x38', // 56 in hex
  chainName: 'Binance Smart Chain',
  rpcUrls: ['https://bsc-dataseed.binance.org/'],
  blockExplorerUrls: ['https://bscscan.com'],
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
};

// BSC Testnet Configuration
export const BSC_TESTNET_CONFIG = {
  chainId: '0x61', // 97 in hex
  chainName: 'Binance Smart Chain Testnet',
  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
  blockExplorerUrls: ['https://testnet.bscscan.com'],
  nativeCurrency: {
    name: 'tBNB',
    symbol: 'tBNB',
    decimals: 18,
  },
};

// Contract Addresses
export const CONTRACT_ADDRESSES = {
  // Mainnet
  PANCAKESWAP_ROUTER: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
  WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
  CAKE: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
  EVANA: process.env.NEXT_PUBLIC_EVANA_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
  // Testnet
  PANCAKESWAP_TESTNET_ROUTER: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
  WBNB_TESTNET: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
  BUSD_TESTNET: '0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7',
  EVANA_TESTNET: process.env.NEXT_PUBLIC_EVANA_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
};

// PancakeSwap Router ABI (simplified)
export const PANCAKESWAP_ROUTER_ABI = [
  'function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)',
  'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
  'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  'function WETH() external pure returns (address)',
];

// ERC20 Token ABI (simplified)
export const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

interface Web3State {
  isConnected: boolean;
  account: string | null;
  chainId: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  balance: string;
  isConnecting: boolean;
  error: string | null;
}

export const useWeb3 = () => {
  const { toast } = useToast();
  const [state, setState] = useState<Web3State>({
    isConnected: false,
    account: null,
    chainId: null,
    provider: null,
    signer: null,
    balance: '0',
    isConnecting: false,
    error: null,
  });

  // Check if MetaMask is installed
  const isMetaMaskInstalled = useCallback(() => {
    return typeof window !== 'undefined' && !!(window as any).ethereum;
  }, []);

  // Check if we're on mobile (memoized to prevent excessive calls)
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      console.log("🔍 [MOBILE DEBUG] Mobile detection (initial):", {
        userAgent: navigator.userAgent,
        isMobile: mobile
      });
      setIsMobileDevice(mobile);
    }
  }, []);

  const isMobile = useCallback(() => isMobileDevice, [isMobileDevice]);

  // Check if MetaMask mobile app is available (memoized)
  const [isMetaMaskMobile, setIsMetaMaskMobile] = useState<boolean>(false);
  
  // Function to check MetaMask availability
  const checkMetaMaskAvailability = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    const userAgent = navigator.userAgent;
    const ethereum = (window as any).ethereum;
    const hasMetaMask = userAgent.includes('MetaMask') || 
                       userAgent.includes('WebView') ||
                       ethereum?.isMetaMask ||
                       !!ethereum;
    
    // Comprehensive debug logging
    console.log("🔍 [MOBILE DEBUG] MetaMask availability check:", {
      timestamp: new Date().toISOString(),
      userAgent: userAgent,
      hasMetaMask: hasMetaMask,
      ethereum: !!ethereum,
      isMetaMask: ethereum?.isMetaMask,
      ethereumKeys: ethereum ? Object.keys(ethereum) : [],
      ethereumMethods: ethereum ? Object.getOwnPropertyNames(ethereum) : [],
      windowKeys: Object.keys(window).filter(key => key.includes('eth') || key.includes('web3')),
      localStorage: {
        waiting_for_metamask: localStorage.getItem('waiting_for_metamask'),
        metamask_redirect_time: localStorage.getItem('metamask_redirect_time')
      }
    });
    
    return hasMetaMask;
  }, []);
  
  useEffect(() => {
    if (isMobileDevice) {
      const hasMetaMask = checkMetaMaskAvailability();
      setIsMetaMaskMobile(hasMetaMask);
    }
  }, [isMobileDevice, checkMetaMaskAvailability]);

  const isMetaMaskMobileAvailable = useCallback(() => isMetaMaskMobile, [isMetaMaskMobile]);

  // Check if we're on the correct network (BSC Mainnet or Testnet)
  const isCorrectNetwork = useCallback((chainId: string) => {
    return chainId === BSC_CONFIG.chainId || chainId === BSC_TESTNET_CONFIG.chainId;
  }, []);

  // Get current network config based on chainId
  const getNetworkConfig = useCallback((chainId: string) => {
    if (chainId === BSC_CONFIG.chainId) {
      return BSC_CONFIG;
    } else if (chainId === BSC_TESTNET_CONFIG.chainId) {
      return BSC_TESTNET_CONFIG;
    }
    return null;
  }, []);

  // Switch to BSC network (defaults to mainnet)
  const switchToBSC = useCallback(async (useTestnet: boolean = false) => {
    if (!isMetaMaskInstalled()) {
      throw new Error('MetaMask not installed');
    }

    const targetConfig = useTestnet ? BSC_TESTNET_CONFIG : BSC_CONFIG;

    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetConfig.chainId }],
      });
    } catch (switchError: any) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [targetConfig],
          });
        } catch (addError) {
          throw new Error(`Failed to add ${targetConfig.chainName} network`);
        }
      } else {
        throw new Error(`Failed to switch to ${targetConfig.chainName} network`);
      }
    }
  }, [isMetaMaskInstalled]);

  // Connect wallet
  const connect = useCallback(async () => {
    console.log("🔍 [MOBILE DEBUG] Starting wallet connection process");
    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const mobile = isMobile();
      const hasMetaMask = isMetaMaskInstalled();
      
      // Comprehensive connection environment logging
      console.log("🔍 [MOBILE DEBUG] Connection environment:", {
        timestamp: new Date().toISOString(),
        isMobile: mobile,
        hasMetaMask: hasMetaMask,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        currentUrl: window.location.href,
        referrer: document.referrer,
        ethereum: {
          exists: !!(window as any).ethereum,
          isMetaMask: (window as any).ethereum?.isMetaMask,
          selectedAddress: (window as any).ethereum?.selectedAddress,
          chainId: (window as any).ethereum?.chainId,
          networkVersion: (window as any).ethereum?.networkVersion,
          isConnected: (window as any).ethereum?.isConnected?.(),
          providers: (window as any).ethereum?.providers
        },
        localStorage: {
          waiting_for_metamask: localStorage.getItem('waiting_for_metamask'),
          metamask_redirect_time: localStorage.getItem('metamask_redirect_time'),
          theme: localStorage.getItem('theme'),
          allKeys: Object.keys(localStorage)
        },
        sessionStorage: {
          allKeys: Object.keys(sessionStorage)
        }
      });

      // Handle mobile-specific connection logic
      if (mobile) {
        if (!hasMetaMask) {
          console.log("🔍 [MOBILE DEBUG] Mobile: MetaMask not detected, attempting to open MetaMask app");
          
          // Try to open MetaMask app using proper deep linking
          const currentUrl = encodeURIComponent(window.location.href);
          const metamaskUrl = `metamask://dapp/${currentUrl}`;
          
          console.log("🔍 [MOBILE DEBUG] Attempting to open MetaMask app:", {
            timestamp: new Date().toISOString(),
            currentUrl: window.location.href,
            encodedUrl: currentUrl,
            metamaskUrl: metamaskUrl,
            protocol: window.location.protocol,
            host: window.location.host,
            pathname: window.location.pathname,
            search: window.location.search,
            hash: window.location.hash
          });
          
          // Store the current timestamp to track when we initiated the redirect
          const redirectTime = Date.now().toString();
          localStorage.setItem('metamask_redirect_time', redirectTime);
          console.log("🔍 [MOBILE DEBUG] Stored redirect timestamp:", redirectTime);
          
          // Method 1: Try the proper MetaMask deep link format
          try {
            console.log("🔍 [MOBILE DEBUG] Method 1: Creating iframe for deep link");
            // Use a more reliable approach for mobile deep linking
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = metamaskUrl;
            document.body.appendChild(iframe);
            console.log("🔍 [MOBILE DEBUG] Iframe created and added to DOM");
            
            // Remove iframe after a short delay
            setTimeout(() => {
              try {
                document.body.removeChild(iframe);
                console.log("🔍 [MOBILE DEBUG] Iframe removed from DOM");
              } catch (error) {
                console.log("🔍 [MOBILE DEBUG] Error removing iframe:", error);
              }
            }, 1000);
          } catch (error) {
            console.log("🔍 [MOBILE DEBUG] Iframe method failed:", error);
          }
          
          // Method 2: Direct window.location as fallback
          try {
            console.log("🔍 [MOBILE DEBUG] Method 2: Direct window.location redirect");
            window.location.href = metamaskUrl;
            console.log("🔍 [MOBILE DEBUG] Window.location redirect attempted");
          } catch (error) {
            console.log("🔍 [MOBILE DEBUG] Direct redirect failed:", error);
          }
          
          // Method 3: Create a temporary link to trigger the app
          try {
            console.log("🔍 [MOBILE DEBUG] Method 3: Creating temporary link");
            const link = document.createElement('a');
            link.href = metamaskUrl;
            link.style.display = 'none';
            document.body.appendChild(link);
            console.log("🔍 [MOBILE DEBUG] Link created and added to DOM");
            link.click();
            console.log("🔍 [MOBILE DEBUG] Link clicked");
            document.body.removeChild(link);
            console.log("🔍 [MOBILE DEBUG] Link removed from DOM");
          } catch (error) {
            console.log("🔍 [MOBILE DEBUG] Link method failed:", error);
          }
          
          // Set a flag to indicate we're waiting for MetaMask
          localStorage.setItem('waiting_for_metamask', 'true');
          
          // Don't show any popup messages - let the background detection handle it
          console.log("🔍 [MOBILE DEBUG] MetaMask not detected, attempting silent redirect");
          
          // Don't throw an error, just return early to allow the waiting mechanism to work
          setState(prev => ({ ...prev, isConnecting: false }));
          return;
        } else {
          // MetaMask is available on mobile, clear the waiting flag
          localStorage.removeItem('waiting_for_metamask');
        }
      } else {
        // Desktop connection logic
        if (!hasMetaMask) {
          console.log("🔍 [MOBILE DEBUG] Desktop: MetaMask not installed");
          throw new Error('MetaMask not installed. Please install the MetaMask browser extension.');
        }
      }

      // Request account access
      console.log("🔍 [MOBILE DEBUG] Requesting account access");
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });

      console.log("🔍 [MOBILE DEBUG] Accounts received:", accounts);

      if (accounts.length === 0) {
        console.log("🔍 [MOBILE DEBUG] No accounts found");
        throw new Error('No accounts found');
      }

      const account = accounts[0];
      console.log("🔍 [MOBILE DEBUG] Using account:", account);
      
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(account);
      
      console.log("🔍 [MOBILE DEBUG] Wallet details:", {
        account,
        chainId: network.chainId.toString(),
        balance: ethers.formatEther(balance)
      });

      // Check if we're on the correct network
      if (!isCorrectNetwork(network.chainId.toString())) {
        // Try to switch to BSC mainnet first, then testnet if that fails
        try {
          await switchToBSC(false); // Try mainnet first
        } catch (error) {
          console.warn('Failed to switch to BSC mainnet, trying testnet:', error);
          try {
            await switchToBSC(true); // Try testnet
          } catch (testnetError) {
            throw new Error('Please switch to Binance Smart Chain (Mainnet or Testnet)');
          }
        }
        
        // Re-fetch after network switch
        const newNetwork = await provider.getNetwork();
        const newBalance = await provider.getBalance(account);
        
        setState({
          isConnected: true,
          account,
          chainId: newNetwork.chainId.toString(),
          provider,
          signer,
          balance: ethers.formatEther(newBalance),
          isConnecting: false,
          error: null,
        });
      } else {
        setState({
          isConnected: true,
          account,
          chainId: network.chainId.toString(),
          provider,
          signer,
          balance: ethers.formatEther(balance),
          isConnecting: false,
          error: null,
        });
      }

      toast({
        title: 'Wallet Connected',
        description: `Connected to ${formatAddress(account)}`,
      });

    } catch (error: any) {
      const errorMessage = error.message || 'Failed to connect wallet';
      console.error("🔍 [MOBILE DEBUG] Connection failed:", {
        error: errorMessage,
        stack: error.stack,
        isMobile: isMobile(),
        hasMetaMask: isMetaMaskInstalled()
      });
      
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));
      
      // Don't show toast for mobile redirect attempts
      if (!errorMessage.includes('MetaMask mobile app required')) {
        toast({
          title: 'Connection Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
      
      throw error;
    }
  }, [isMetaMaskInstalled, isMobile, isCorrectNetwork, switchToBSC, toast]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setState({
      isConnected: false,
      account: null,
      chainId: null,
      provider: null,
      signer: null,
      balance: '0',
      isConnecting: false,
      error: null,
    });

    toast({
      title: 'Wallet Disconnected',
      description: 'You have been disconnected from your wallet',
    });
  }, [toast]);

  // Get token balance
  const getTokenBalance = useCallback(async (tokenAddress: string): Promise<string> => {
    if (!state.provider || !state.account) {
      throw new Error('Wallet not connected');
    }

    try {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, state.provider);
      const balance = await contract.balanceOf(state.account);
      const decimals = await contract.decimals();
      
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error('Error getting token balance:', error);
      throw new Error('Failed to get token balance');
    }
  }, [state.provider, state.account]);

  // Get token price from PancakeSwap
  const getTokenPrice = useCallback(async (tokenAddress: string, amountIn: string): Promise<string> => {
    if (!state.provider) {
      throw new Error('Wallet not connected');
    }

    try {
      const router = new ethers.Contract(CONTRACT_ADDRESSES.PANCAKESWAP_ROUTER, PANCAKESWAP_ROUTER_ABI, state.provider);
      const path = [tokenAddress, CONTRACT_ADDRESSES.WBNB];
      const amounts = await router.getAmountsOut(ethers.parseEther(amountIn), path);
      
      return ethers.formatEther(amounts[1]);
    } catch (error) {
      console.error('Error getting token price:', error);
      throw new Error('Failed to get token price');
    }
  }, [state.provider]);

  // Execute token swap
  const swapTokens = useCallback(async (
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    amountOutMin: string,
    slippage: number = 0.5
  ): Promise<string> => {
    if (!state.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const router = new ethers.Contract(CONTRACT_ADDRESSES.PANCAKESWAP_ROUTER, PANCAKESWAP_ROUTER_ABI, state.signer);
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes
      const path = [tokenIn, tokenOut];

      const tx = await router.swapExactTokensForTokens(
        ethers.parseEther(amountIn),
        ethers.parseEther(amountOutMin),
        path,
        state.account,
        deadline
      );

      toast({
        title: 'Transaction Sent',
        description: `Transaction hash: ${tx.hash}`,
      });

      return tx.hash;
    } catch (error: any) {
      console.error('Error swapping tokens:', error);
      const errorMessage = error.message || 'Failed to swap tokens';
      
      toast({
        title: 'Swap Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      throw new Error(errorMessage);
    }
  }, [state.signer, state.account, toast]);

  // Listen for account and network changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== state.account) {
        // Account changed, reconnect
        connect();
      }
    };

    const handleChainChanged = (chainId: string) => {
      if (!isCorrectNetwork(chainId)) {
        toast({
          title: 'Wrong Network',
          description: 'Please switch to Binance Smart Chain',
          variant: 'destructive',
        });
      }
      // Reconnect to update chain info
      connect();
    };

    (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
    (window as any).ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if ((window as any).ethereum) {
        (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
        (window as any).ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [isMetaMaskInstalled, isCorrectNetwork, state.account, connect, disconnect, toast]);

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (!isMetaMaskInstalled()) return;

      try {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_accounts',
        });

        if (accounts.length > 0) {
          await connect();
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    };

    checkConnection();
  }, [isMetaMaskInstalled, connect]);

  // Check for MetaMask availability on mobile when waiting for it
  useEffect(() => {
    if (!isMobileDevice) return;

    const isWaitingForMetaMask = localStorage.getItem('waiting_for_metamask') === 'true';
    if (!isWaitingForMetaMask) return;

    // Immediate check when component mounts
    const immediateCheck = async () => {
      const hasMetaMask = checkMetaMaskAvailability();
      setIsMetaMaskMobile(hasMetaMask);
      
      if (hasMetaMask && !state.isConnected && !state.isConnecting) {
        console.log("🔍 [MOBILE DEBUG] MetaMask detected on immediate check, attempting connection");
        try {
          await connect();
          localStorage.removeItem('waiting_for_metamask');
        } catch (error) {
          console.log("🔍 [MOBILE DEBUG] Immediate auto-connection failed:", error);
        }
      }
    };

    immediateCheck();
  }, [isMobileDevice, checkMetaMaskAvailability, state.isConnected, state.isConnecting, connect]);

  // Listen for page visibility changes and focus events to detect when user returns from MetaMask app
  useEffect(() => {
    if (!isMobileDevice) return;

    const handleVisibilityChange = async () => {
      console.log("🔍 [MOBILE DEBUG] Page visibility changed:", {
        timestamp: new Date().toISOString(),
        visibilityState: document.visibilityState,
        hidden: document.hidden,
        isConnected: state.isConnected,
        isConnecting: state.isConnecting
      });
      
      if (document.visibilityState === 'visible') {
        console.log("🔍 [MOBILE DEBUG] Page became visible, checking MetaMask availability");
        
        // Re-check MetaMask availability when page becomes visible
        const hasMetaMask = checkMetaMaskAvailability();
        setIsMetaMaskMobile(hasMetaMask);
        
        console.log("🔍 [MOBILE DEBUG] Visibility change - MetaMask check result:", {
          hasMetaMask: hasMetaMask,
          isConnected: state.isConnected,
          isConnecting: state.isConnecting,
          shouldAttemptConnection: hasMetaMask && !state.isConnected && !state.isConnecting
        });
        
        // If MetaMask is now available and we're not connected, try to connect
        if (hasMetaMask && !state.isConnected && !state.isConnecting) {
          console.log("🔍 [MOBILE DEBUG] MetaMask detected after page visibility change, attempting connection");
          try {
            await connect();
          } catch (error) {
            console.log("🔍 [MOBILE DEBUG] Auto-connection failed:", error);
          }
        }
      }
    };

    const handleFocus = async () => {
      console.log("🔍 [MOBILE DEBUG] Window focused, checking MetaMask availability");
      
      // Re-check MetaMask availability when window gains focus
      const hasMetaMask = checkMetaMaskAvailability();
      setIsMetaMaskMobile(hasMetaMask);
      
      console.log("🔍 [MOBILE DEBUG] Focus change - MetaMask check result:", {
        hasMetaMask: hasMetaMask,
        isConnected: state.isConnected,
        isConnecting: state.isConnecting,
        shouldAttemptConnection: hasMetaMask && !state.isConnected && !state.isConnecting
      });
      
      // If MetaMask is now available and we're not connected, try to connect
      if (hasMetaMask && !state.isConnected && !state.isConnecting) {
        console.log("🔍 [MOBILE DEBUG] MetaMask detected after focus, attempting connection");
        try {
          await connect();
        } catch (error) {
          console.log("🔍 [MOBILE DEBUG] Auto-connection failed:", error);
        }
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isMobileDevice, checkMetaMaskAvailability, state.isConnected, state.isConnecting, connect]);

  // Periodic check for MetaMask availability when waiting for it
  useEffect(() => {
    if (!isMobileDevice) return;

    const isWaitingForMetaMask = localStorage.getItem('waiting_for_metamask') === 'true';
    if (!isWaitingForMetaMask) return;

    console.log("🔍 [MOBILE DEBUG] Waiting for MetaMask, starting periodic checks");
    
    let checkCount = 0;
    const checkInterval = setInterval(async () => {
      checkCount++;
      console.log(`🔍 [MOBILE DEBUG] Periodic check #${checkCount}`, {
        timestamp: new Date().toISOString(),
        checkCount: checkCount,
        isConnected: state.isConnected,
        isConnecting: state.isConnecting
      });
      
      const hasMetaMask = checkMetaMaskAvailability();
      setIsMetaMaskMobile(hasMetaMask);
      
      console.log(`🔍 [MOBILE DEBUG] Periodic check #${checkCount} result:`, {
        hasMetaMask: hasMetaMask,
        isConnected: state.isConnected,
        isConnecting: state.isConnecting,
        shouldAttemptConnection: hasMetaMask && !state.isConnected && !state.isConnecting
      });
      
      if (hasMetaMask && !state.isConnected && !state.isConnecting) {
        console.log("🔍 [MOBILE DEBUG] MetaMask detected during periodic check, attempting connection");
        try {
          await connect();
          localStorage.removeItem('waiting_for_metamask');
          localStorage.removeItem('metamask_redirect_time');
          clearInterval(checkInterval);
          console.log("🔍 [MOBILE DEBUG] Connection successful, cleared interval and localStorage");
        } catch (error) {
          console.log("🔍 [MOBILE DEBUG] Auto-connection failed during periodic check:", error);
        }
      }
      
      // After 10 seconds, show a helpful message if still waiting
      if (checkCount === 10 && !hasMetaMask) {
        console.log("🔍 [MOBILE DEBUG] Still waiting for MetaMask after 10 seconds");
        toast({
          title: 'MetaMask Not Detected',
          description: 'Please ensure you\'re using the MetaMask browser or install MetaMask app',
          variant: 'destructive',
        });
      }
      
      // After 20 seconds, show more specific guidance
      if (checkCount === 20 && !hasMetaMask) {
        console.log("🔍 [MOBILE DEBUG] Still waiting for MetaMask after 20 seconds");
        toast({
          title: 'Connection Help',
          description: 'Try: 1) Open MetaMask app 2) Use browser inside MetaMask 3) Visit this site again',
          variant: 'destructive',
        });
      }
    }, 1000); // Check every 1 second for faster detection

    // Clear interval after 30 seconds to avoid infinite checking
    const timeout = setTimeout(() => {
      clearInterval(checkInterval);
      localStorage.removeItem('waiting_for_metamask');
      localStorage.removeItem('metamask_redirect_time');
      
      // Show final instructions if still not connected
      if (!state.isConnected) {
        toast({
          title: 'Connection Timeout',
          description: 'Please try: 1) Open MetaMask app 2) Use browser inside MetaMask 3) Visit this site again',
          variant: 'destructive',
        });
        
        // Clear the waiting flag so user can try again
        localStorage.removeItem('waiting_for_metamask');
        localStorage.removeItem('metamask_redirect_time');
      }
    }, 30000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeout);
    };
  }, [isMobileDevice, checkMetaMaskAvailability, state.isConnected, state.isConnecting, connect]);

  // Function to clear waiting state and allow retry
  const clearWaitingState = useCallback(() => {
    console.log("🔍 [MOBILE DEBUG] Clearing waiting state");
    localStorage.removeItem('waiting_for_metamask');
    localStorage.removeItem('metamask_redirect_time');
    setState(prev => ({ ...prev, isConnecting: false, error: null }));
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    getTokenBalance,
    getTokenPrice,
    swapTokens,
    switchToBSC,
    getNetworkConfig,
    isMetaMaskInstalled: isMetaMaskInstalled(),
    isMobile: isMobile(),
    isMetaMaskMobileAvailable: isMetaMaskMobileAvailable(),
    isCorrectNetwork: state.chainId ? isCorrectNetwork(state.chainId) : false,
    currentNetworkConfig: state.chainId ? getNetworkConfig(state.chainId) : null,
    clearWaitingState,
  };
};

// Utility functions
export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatBalance = (balance: string, decimals: number = 4): string => {
  return parseFloat(balance).toFixed(decimals);
};

export const calculateSlippage = (amount: string, slippagePercent: number): string => {
  const amountBN = ethers.parseEther(amount);
  const slippageBN = amountBN * BigInt(Math.floor(slippagePercent * 100)) / BigInt(10000);
  return ethers.formatEther(amountBN - slippageBN);
};
