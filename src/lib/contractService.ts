import { ethers } from 'ethers';
import EVANA_ABI from '../abi/EVANA.json';

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface ContractConfig {
  address: string;
  rpcUrl: string;
  chainId: number;
}

export class ContractService {
  private provider: ethers.JsonRpcProvider | ethers.BrowserProvider | null = null;
  private contract: ethers.Contract | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  constructor(private config: ContractConfig) {
    this.initializeProvider();
  }

  private initializeProvider() {
    try {
      this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);
    } catch (error) {
      console.error('Failed to initialize provider:', error);
    }
  }

  async connectWallet(): Promise<boolean> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not installed');
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Get the provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      // Initialize contract with signer
      this.contract = new ethers.Contract(
        this.config.address,
        EVANA_ABI,
        this.signer
      );

      return true;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return false;
    }
  }

  async getBalance(address: string): Promise<string> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const balance = await this.contract.balanceOf(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw error;
    }
  }

  async getTotalSupply(): Promise<string> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const totalSupply = await this.contract.totalSupply();
      return ethers.formatEther(totalSupply);
    } catch (error) {
      console.error('Failed to get total supply:', error);
      throw error;
    }
  }

  async getTokenInfo() {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const [name, symbol, decimals, totalSupply] = await Promise.all([
        this.contract.name(),
        this.contract.symbol(),
        this.contract.decimals(),
        this.contract.totalSupply()
      ]);

      return {
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: ethers.formatEther(totalSupply)
      };
    } catch (error) {
      console.error('Failed to get token info:', error);
      throw error;
    }
  }

  async getTradingInfo() {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const [
        tradingActive,
        swapEnabled,
        buyFee,
        sellFee,
        maxBuyAmount,
        maxSellAmount,
        maxWalletAmount
      ] = await Promise.all([
        this.contract.tradingActive(),
        this.contract.swapEnabled(),
        this.contract.buyFee(),
        this.contract.sellFee(),
        this.contract.maxBuyAmount(),
        this.contract.maxSellAmount(),
        this.contract.maxWalletAmount()
      ]);

      return {
        tradingActive,
        swapEnabled,
        buyFee: Number(buyFee),
        sellFee: Number(sellFee),
        maxBuyAmount: ethers.formatEther(maxBuyAmount),
        maxSellAmount: ethers.formatEther(maxSellAmount),
        maxWalletAmount: ethers.formatEther(maxWalletAmount)
      };
    } catch (error) {
      console.error('Failed to get trading info:', error);
      throw error;
    }
  }

  async approve(spender: string, amount: string): Promise<ethers.TransactionResponse> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contract or signer not initialized');
      }

      const amountWei = ethers.parseEther(amount);
      const tx = await this.contract.approve(spender, amountWei);
      return tx;
    } catch (error) {
      console.error('Failed to approve:', error);
      throw error;
    }
  }

  async transfer(to: string, amount: string): Promise<ethers.TransactionResponse> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contract or signer not initialized');
      }

      const amountWei = ethers.parseEther(amount);
      const tx = await this.contract.transfer(to, amountWei);
      return tx;
    } catch (error) {
      console.error('Failed to transfer:', error);
      throw error;
    }
  }

  async manualSwap(): Promise<ethers.TransactionResponse> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contract or signer not initialized');
      }

      const tx = await this.contract.manualSwap();
      return tx;
    } catch (error) {
      console.error('Failed to execute manual swap:', error);
      throw error;
    }
  }

  async addLiquidity(tokenAmount: string, ethAmount: string): Promise<ethers.TransactionResponse> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contract or signer not initialized');
      }

      const tokenAmountWei = ethers.parseEther(tokenAmount);
      const ethAmountWei = ethers.parseEther(ethAmount);
      
      const tx = await this.contract.addLiquidity(tokenAmountWei, ethAmountWei, {
        value: ethAmountWei
      });
      return tx;
    } catch (error) {
      console.error('Failed to add liquidity:', error);
      throw error;
    }
  }

  async enableTrading(status: boolean, deadBlocks: number = 1): Promise<ethers.TransactionResponse> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contract or signer not initialized');
      }

      const tx = await this.contract.enableTrading(status, deadBlocks);
      return tx;
    } catch (error) {
      console.error('Failed to enable trading:', error);
      throw error;
    }
  }

  // Owner functions
  async updateBuyFee(fee: number): Promise<ethers.TransactionResponse> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contract or signer not initialized');
      }

      const tx = await this.contract.updateBuyFee(fee);
      return tx;
    } catch (error) {
      console.error('Failed to update buy fee:', error);
      throw error;
    }
  }

  async updateSellFee(fee: number): Promise<ethers.TransactionResponse> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contract or signer not initialized');
      }

      const tx = await this.contract.updateSellFee(fee);
      return tx;
    } catch (error) {
      console.error('Failed to update sell fee:', error);
      throw error;
    }
  }

  async removeLimits(): Promise<ethers.TransactionResponse> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contract or signer not initialized');
      }

      const tx = await this.contract.removeLimits();
      return tx;
    } catch (error) {
      console.error('Failed to remove limits:', error);
      throw error;
    }
  }

  // Treasury functions
  async updateSwapThreshold(amount: string): Promise<ethers.TransactionResponse> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contract or signer not initialized');
      }

      const amountWei = ethers.parseEther(amount);
      const tx = await this.contract.updateSwapThreshold(amountWei);
      return tx;
    } catch (error) {
      console.error('Failed to update swap threshold:', error);
      throw error;
    }
  }

  async withdrawStuckETH(): Promise<ethers.TransactionResponse> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contract or signer not initialized');
      }

      const tx = await this.contract.withdrawStuckETH();
      return tx;
    } catch (error) {
      console.error('Failed to withdraw stuck ETH:', error);
      throw error;
    }
  }

  // Utility functions
  getContractAddress(): string {
    return this.config.address;
  }

  getChainId(): number {
    return this.config.chainId;
  }

  isConnected(): boolean {
    return this.contract !== null && this.signer !== null;
  }
}

// Factory function to create contract service
export function createContractService(): ContractService {
  const config: ContractConfig = {
    address: process.env.NEXT_PUBLIC_EVANA_CONTRACT_ADDRESS || '',
    rpcUrl: process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://bsc-dataseed.binance.org/',
    chainId: 56 // BSC Mainnet
  };

  return new ContractService(config);
}

// Testnet factory function
export function createTestnetContractService(): ContractService {
  const config: ContractConfig = {
    address: process.env.NEXT_PUBLIC_EVANA_CONTRACT_ADDRESS || '',
    rpcUrl: process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    chainId: 97 // BSC Testnet
  };

  return new ContractService(config);
}
