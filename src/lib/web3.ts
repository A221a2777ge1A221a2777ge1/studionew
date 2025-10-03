import { ethers } from 'ethers';

// BSC Mainnet Configuration
export const BSC_CONFIG = {
  chainId: 56,
  chainName: 'Binance Smart Chain',
  rpcUrls: [process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://bsc-dataseed.binance.org/'],
  blockExplorerUrls: ['https://bscscan.com'],
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
};

// Contract Addresses
export const CONTRACT_ADDRESSES = {
  PANCAKESWAP_ROUTER: process.env.NEXT_PUBLIC_PANCAKESWAP_ROUTER || '0x10ED43C718714eb63d5aA57B78B54704E256024E',
  WBNB: process.env.NEXT_PUBLIC_WBNB_ADDRESS || '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
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

// Web3 Provider Utilities
export class Web3Provider {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  async connect(): Promise<string> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not detected');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
    
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    return await this.signer.getAddress();
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not connected');
    }
    
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not connected');
    }

    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
    const balance = await contract.balanceOf(walletAddress);
    const decimals = await contract.decimals();
    
    return ethers.formatUnits(balance, decimals);
  }

  async getTokenPrice(tokenAddress: string, amountIn: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not connected');
    }

    const router = new ethers.Contract(CONTRACT_ADDRESSES.PANCAKESWAP_ROUTER, PANCAKESWAP_ROUTER_ABI, this.provider);
    const path = [tokenAddress, CONTRACT_ADDRESSES.WBNB];
    const amounts = await router.getAmountsOut(ethers.parseEther(amountIn), path);
    
    return ethers.formatEther(amounts[1]);
  }

  async swapTokens(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    amountOutMin: string,
    slippage: number = 0.5
  ): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer not connected');
    }

    const router = new ethers.Contract(CONTRACT_ADDRESSES.PANCAKESWAP_ROUTER, PANCAKESWAP_ROUTER_ABI, this.signer);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes
    const path = [tokenIn, tokenOut];

    const tx = await router.swapExactTokensForTokens(
      ethers.parseEther(amountIn),
      ethers.parseEther(amountOutMin),
      path,
      await this.signer.getAddress(),
      deadline
    );

    return tx.hash;
  }
}

// Global Web3 instance
export const web3Provider = new Web3Provider();

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
