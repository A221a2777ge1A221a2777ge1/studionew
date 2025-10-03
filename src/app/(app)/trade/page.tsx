"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { web3Provider, formatBalance, calculateSlippage } from "@/lib/web3";
import { emitMCPEvent } from "@/lib/mcp-pattern";
import { 
  ArrowUpDown, 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  Wallet,
  Loader2,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  price: number;
  change24h: number;
  liquidity: number;
}

interface TradeParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  slippage: number;
  deadline: number;
}

const SUPPORTED_TOKENS: Token[] = [
  {
    symbol: 'BNB',
    name: 'Binance Coin',
    address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    decimals: 18,
    price: 300.00,
    change24h: 2.5,
    liquidity: 1500000,
  },
  {
    symbol: 'CAKE',
    name: 'PancakeSwap',
    address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    decimals: 18,
    price: 2.85,
    change24h: -1.2,
    liquidity: 800000,
  },
  {
    symbol: 'BUSD',
    name: 'Binance USD',
    address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    decimals: 18,
    price: 1.00,
    change24h: 0.1,
    liquidity: 2000000,
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0x55d398326f99059fF775485246999027B3197955',
    decimals: 18,
    price: 1.00,
    change24h: -0.05,
    liquidity: 1800000,
  },
];

export default function TradePage() {
  const { userProfile } = useAuth();
  const [selectedTokenIn, setSelectedTokenIn] = useState<Token>(SUPPORTED_TOKENS[0]);
  const [selectedTokenOut, setSelectedTokenOut] = useState<Token>(SUPPORTED_TOKENS[1]);
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [slippage, setSlippage] = useState([0.5]);
  const [loading, setLoading] = useState(false);
  const [trading, setTrading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletBalance, setWalletBalance] = useState<string>("0");
  const [priceImpact, setPriceImpact] = useState(0);
  const [minimumReceived, setMinimumReceived] = useState("0");

  useEffect(() => {
    if (userProfile?.walletAddress) {
      setWalletConnected(true);
      loadWalletBalance();
    }
  }, [userProfile]);

  useEffect(() => {
    if (amountIn && selectedTokenIn && selectedTokenOut) {
      calculateOutput();
    }
  }, [amountIn, selectedTokenIn, selectedTokenOut, slippage]);

  const loadWalletBalance = async () => {
    if (!userProfile?.walletAddress) return;

    try {
      const balance = await web3Provider.getBalance(userProfile.walletAddress);
      setWalletBalance(balance);
    } catch (error) {
      console.error('Error loading wallet balance:', error);
    }
  };

  const calculateOutput = async () => {
    if (!amountIn || !selectedTokenIn || !selectedTokenOut) return;

    try {
      // Mock calculation - in real app, use PancakeSwap API
      const inputValue = parseFloat(amountIn) * selectedTokenIn.price;
      const outputAmount = inputValue / selectedTokenOut.price;
      
      setAmountOut(outputAmount.toFixed(6));
      
      // Calculate price impact (simplified)
      const impact = Math.abs(selectedTokenIn.price - selectedTokenOut.price) / selectedTokenIn.price * 100;
      setPriceImpact(impact);
      
      // Calculate minimum received
      const minReceived = calculateSlippage(outputAmount.toString(), slippage[0]);
      setMinimumReceived(minReceived);
      
    } catch (error) {
      console.error('Error calculating output:', error);
    }
  };

  const swapTokens = async () => {
    if (!userProfile?.walletAddress || !amountIn || !amountOut) return;

    try {
      setTrading(true);
      
      const tradeParams: TradeParams = {
        tokenIn: selectedTokenIn.address,
        tokenOut: selectedTokenOut.address,
        amountIn,
        slippage: slippage[0],
        deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes
      };

      // Emit MCP event for trade attempt
      await emitMCPEvent('trade_attempted', {
        userId: userProfile.uid,
        tradeParams,
      });

      // Execute trade (mock for demo)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Emit MCP event for successful trade
      await emitMCPEvent('trade_executed', {
        userId: userProfile.uid,
        tradeParams,
        txHash: '0x' + Math.random().toString(16).substr(2, 64),
      });

      // Reset form
      setAmountIn("");
      setAmountOut("");
      
      // Reload balance
      await loadWalletBalance();
      
    } catch (error) {
      console.error('Trade failed:', error);
      
      // Emit MCP event for failed trade
      await emitMCPEvent('trade_failed', {
        userId: userProfile.uid,
        error: error.message,
      });
    } finally {
      setTrading(false);
    }
  };

  const connectWallet = async () => {
    try {
      const address = await web3Provider.connect();
      setWalletConnected(true);
      await loadWalletBalance();
      
      await emitMCPEvent('wallet_connected', {
        userId: userProfile?.uid,
        walletAddress: address,
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const switchTokens = () => {
    const temp = selectedTokenIn;
    setSelectedTokenIn(selectedTokenOut);
    setSelectedTokenOut(temp);
    setAmountIn("");
    setAmountOut("");
  };

  const setMaxAmount = () => {
    if (selectedTokenIn.symbol === 'BNB') {
      setAmountIn((parseFloat(walletBalance) * 0.95).toString()); // Leave some for gas
    } else {
      setAmountIn(walletBalance);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gradient">
            Trade Tokens
          </h2>
          <p className="text-muted-foreground">
            Swap tokens on PancakeSwap with the best rates
          </p>
        </div>
        {!walletConnected && (
          <Button onClick={connectWallet} className="bg-gradient-african hover:shadow-african">
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="tribal-pattern">
            <CardHeader>
              <CardTitle>Swap Tokens</CardTitle>
              <CardDescription>
                Exchange tokens with minimal slippage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Token Input */}
              <div className="space-y-2">
                <Label>From</Label>
                <div className="flex space-x-2">
                  <Select value={selectedTokenIn.symbol} onValueChange={(value) => {
                    const token = SUPPORTED_TOKENS.find(t => t.symbol === value);
                    if (token) setSelectedTokenIn(token);
                  }}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_TOKENS.map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          <div className="flex items-center space-x-2">
                            <Coins className="w-4 h-4" />
                            <span>{token.symbol}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={amountIn}
                    onChange={(e) => setAmountIn(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm" onClick={setMaxAmount}>
                    MAX
                  </Button>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Balance: {formatBalance(walletBalance)} {selectedTokenIn.symbol}</span>
                  <span>≈ ${(parseFloat(amountIn || "0") * selectedTokenIn.price).toFixed(2)}</span>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={switchTokens}
                  className="rounded-full p-2"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
              </div>

              {/* Token Output */}
              <div className="space-y-2">
                <Label>To</Label>
                <div className="flex space-x-2">
                  <Select value={selectedTokenOut.symbol} onValueChange={(value) => {
                    const token = SUPPORTED_TOKENS.find(t => t.symbol === value);
                    if (token) setSelectedTokenOut(token);
                  }}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_TOKENS.map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          <div className="flex items-center space-x-2">
                            <Coins className="w-4 h-4" />
                            <span>{token.symbol}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={amountOut}
                    readOnly
                    className="flex-1"
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Balance: 0.0 {selectedTokenOut.symbol}</span>
                  <span>≈ ${(parseFloat(amountOut || "0") * selectedTokenOut.price).toFixed(2)}</span>
                </div>
              </div>

              {/* Slippage Settings */}
              <div className="space-y-3">
                <Label>Slippage Tolerance: {slippage[0]}%</Label>
                <Slider
                  value={slippage}
                  onValueChange={setSlippage}
                  max={5}
                  min={0.1}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.1%</span>
                  <span>5%</span>
                </div>
              </div>

              {/* Trade Button */}
              <Button
                onClick={swapTokens}
                disabled={!walletConnected || !amountIn || !amountOut || trading}
                className="w-full bg-gradient-african hover:shadow-african"
                size="lg"
              >
                {trading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Swapping...
                  </>
                ) : (
                  'Swap Tokens'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Trade Summary */}
          <Card className="tribal-pattern">
            <CardHeader>
              <CardTitle>Trade Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price Impact</span>
                <span className={priceImpact > 5 ? "text-red-500" : "text-green-500"}>
                  {priceImpact.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Minimum Received</span>
                <span>{minimumReceived} {selectedTokenOut.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slippage</span>
                <span>{slippage[0]}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network Fee</span>
                <span>~$0.50</span>
              </div>
            </CardContent>
          </Card>

          {/* Token Prices */}
          <Card className="tribal-pattern">
            <CardHeader>
              <CardTitle>Token Prices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {SUPPORTED_TOKENS.map((token) => (
                  <div key={token.symbol} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Coins className="w-4 h-4" />
                      <span className="font-medium">{token.symbol}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${token.price.toFixed(2)}</p>
                      <p className={`text-xs ${token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {token.change24h >= 0 ? '+' : ''}{token.change24h}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trading Tips */}
          <Card className="tribal-pattern">
            <CardHeader>
              <CardTitle>Trading Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <p className="text-sm">Always check price impact before trading</p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <p className="text-sm">Set appropriate slippage for volatile tokens</p>
              </div>
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                <p className="text-sm">Keep some BNB for gas fees</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}