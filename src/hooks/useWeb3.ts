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
  // Testnet
  PANCAKESWAP_TESTNET_ROUTER: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
  WBNB_TESTNET: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
  BUSD_TESTNET: '0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7',
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

  // Check if we're on mobile
  const isMobile = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }, []);

  // Check if MetaMask mobile app is available
  const isMetaMaskMobileAvailable = useCallback(() => {
    if (!isMobile()) return false;
    
    // Try to detect MetaMask mobile app
    const userAgent = navigator.userAgent;
    return userAgent.includes('MetaMask') || userAgent.includes('WebView');
  }, [isMobile]);

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
    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Handle mobile-specific connection logic
      if (isMobile()) {
        if (!isMetaMaskInstalled()) {
          // On mobile, try to open MetaMask app or show instructions
          const currentUrl = window.location.href;
          const metamaskUrl = `metamask://dapp/${currentUrl}`;
          
          // Try to open MetaMask app
          window.location.href = metamaskUrl;
          
          // Show fallback instructions after a delay
          setTimeout(() => {
            toast({
              title: 'MetaMask Mobile Required',
              description: 'Please install MetaMask mobile app and open this site in the MetaMask browser',
              variant: 'destructive',
            });
          }, 2000);
          
          throw new Error('MetaMask mobile app required. Please install MetaMask and open this site in the MetaMask browser.');
        }
      } else {
        // Desktop connection logic
        if (!isMetaMaskInstalled()) {
          throw new Error('MetaMask not installed. Please install the MetaMask browser extension.');
        }
      }

      // Request account access
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const account = accounts[0];
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(account);

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
