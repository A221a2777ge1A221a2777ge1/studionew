import { ethers } from 'ethers';

export interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  slippageTolerance: number; // Percentage (e.g., 0.5 for 0.5%)
  deadline: number; // Unix timestamp
  recipient: string;
}

export interface SwapQuote {
  amountOut: string;
  priceImpact: number;
  minimumAmountOut: string;
  path: string[];
}

export class SwapService {
  private provider: ethers.JsonRpcProvider | null = null;
  private routerContract: ethers.Contract | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  constructor(
    private routerAddress: string,
    private rpcUrl: string,
    private chainId: number
  ) {
    this.initializeProvider();
  }

  private initializeProvider() {
    try {
      this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
    } catch (error) {
      console.error('Failed to initialize swap provider:', error);
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
      
      // Initialize router contract with signer
      this.routerContract = new ethers.Contract(
        this.routerAddress,
        this.getRouterABI(),
        this.signer
      );

      return true;
    } catch (error) {
      console.error('Failed to connect wallet for swap:', error);
      return false;
    }
  }

  private getRouterABI() {
    // PancakeSwap Router ABI (simplified)
    return [
      "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
      "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
      "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
      "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
      "function WETH() external pure returns (address)"
    ];
  }

  async getQuote(params: SwapParams): Promise<SwapQuote> {
    try {
      if (!this.routerContract) {
        throw new Error('Router contract not initialized');
      }

      const path = [params.tokenIn, params.tokenOut];
      const amountInWei = ethers.parseEther(params.amountIn);
      
      // Get amounts out
      const amounts = await this.routerContract.getAmountsOut(amountInWei, path);
      const amountOut = ethers.formatEther(amounts[1]);
      
      // Calculate minimum amount out based on slippage tolerance
      const slippageMultiplier = (100 - params.slippageTolerance) / 100;
      const minimumAmountOut = (parseFloat(amountOut) * slippageMultiplier).toString();
      
      // Calculate price impact (simplified)
      const priceImpact = this.calculatePriceImpact(params.amountIn, amountOut);

      return {
        amountOut,
        priceImpact,
        minimumAmountOut,
        path
      };
    } catch (error) {
      console.error('Failed to get quote:', error);
      throw error;
    }
  }

  private calculatePriceImpact(amountIn: string, amountOut: string): number {
    // Simplified price impact calculation
    // In a real implementation, you would compare against a reference price
    const inputValue = parseFloat(amountIn);
    const outputValue = parseFloat(amountOut);
    
    if (inputValue === 0) return 0;
    
    // This is a placeholder calculation
    // Real implementation would use market data
    return Math.abs((outputValue - inputValue) / inputValue) * 100;
  }

  async swapTokens(params: SwapParams): Promise<ethers.TransactionResponse> {
    try {
      if (!this.routerContract || !this.signer) {
        throw new Error('Router contract or signer not initialized');
      }

      const path = [params.tokenIn, params.tokenOut];
      const amountInWei = ethers.parseEther(params.amountIn);
      const amountOutMinWei = ethers.parseEther(params.minimumAmountOut || '0');
      const deadline = Math.floor(Date.now() / 1000) + params.deadline;

      // Check if swapping to ETH
      const wethAddress = await this.routerContract.WETH();
      const isSwapToETH = params.tokenOut.toLowerCase() === wethAddress.toLowerCase();

      let tx: ethers.TransactionResponse;

      if (isSwapToETH) {
        // Swap tokens for ETH
        tx = await this.routerContract.swapExactTokensForETH(
          amountInWei,
          amountOutMinWei,
          path,
          params.recipient,
          deadline
        );
      } else {
        // Swap tokens for tokens
        tx = await this.routerContract.swapExactTokensForTokens(
          amountInWei,
          amountOutMinWei,
          path,
          params.recipient,
          deadline
        );
      }

      return tx;
    } catch (error) {
      console.error('Failed to execute swap:', error);
      throw error;
    }
  }

  async swapETHForTokens(
    tokenOut: string,
    amountOutMin: string,
    slippageTolerance: number,
    deadline: number,
    recipient: string
  ): Promise<ethers.TransactionResponse> {
    try {
      if (!this.routerContract || !this.signer) {
        throw new Error('Router contract or signer not initialized');
      }

      const wethAddress = await this.routerContract.WETH();
      const path = [wethAddress, tokenOut];
      const amountOutMinWei = ethers.parseEther(amountOutMin);
      const deadlineTimestamp = Math.floor(Date.now() / 1000) + deadline;

      // Get ETH amount from signer's balance
      const balance = await this.signer.provider.getBalance(await this.signer.getAddress());
      const ethAmount = balance; // Use full balance for simplicity

      const tx = await this.routerContract.swapExactETHForTokens(
        amountOutMinWei,
        path,
        recipient,
        deadlineTimestamp,
        { value: ethAmount }
      );

      return tx;
    } catch (error) {
      console.error('Failed to swap ETH for tokens:', error);
      throw error;
    }
  }

  // Utility functions
  formatSlippageTolerance(slippage: number): string {
    return `${slippage}%`;
  }

  parseSlippageTolerance(slippageString: string): number {
    const cleaned = slippageString.replace('%', '');
    return parseFloat(cleaned) || 0;
  }

  validateSlippageTolerance(slippage: number): boolean {
    return slippage >= 0 && slippage <= 50; // Max 50% slippage
  }

  getRecommendedSlippageTolerance(tokenPair: string): number {
    // Return recommended slippage based on token pair
    // This is a simplified implementation
    const stablePairs = ['USDT', 'USDC', 'BUSD', 'DAI'];
    const hasStable = stablePairs.some(stable => tokenPair.includes(stable));
    
    return hasStable ? 0.1 : 0.5; // 0.1% for stable pairs, 0.5% for others
  }

  calculateDeadline(minutes: number = 20): number {
    return minutes * 60; // Convert minutes to seconds
  }

  isConnected(): boolean {
    return this.routerContract !== null && this.signer !== null;
  }
}

// Factory functions
export function createSwapService(): SwapService {
  const routerAddress = process.env.NEXT_PUBLIC_PANCAKESWAP_ROUTER || '0x10ED43C718714eb63d5aA57B78B54704E256024E';
  const rpcUrl = process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://bsc-dataseed.binance.org/';
  const chainId = 56; // BSC Mainnet

  return new SwapService(routerAddress, rpcUrl, chainId);
}

export function createTestnetSwapService(): SwapService {
  const routerAddress = process.env.NEXT_PUBLIC_PANCAKESWAP_TESTNET_ROUTER || '0xD99D1c33F9fC3444f8101754aBC46c52416550D1';
  const rpcUrl = process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/';
  const chainId = 97; // BSC Testnet

  return new SwapService(routerAddress, rpcUrl, chainId);
}
