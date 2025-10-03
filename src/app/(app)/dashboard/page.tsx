"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { web3Provider, formatBalance, formatAddress } from "@/lib/web3";
import { emitMCPEvent } from "@/lib/mcp-pattern";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Trophy, 
  Coins, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Star
} from "lucide-react";

interface WalletBalance {
  bnb: string;
  tokens: Array<{
    symbol: string;
    balance: string;
    value: number;
    change24h: number;
  }>;
  totalValue: number;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  totalValue: number;
  level: number;
  avatar?: string;
}

export default function Dashboard() {
  const { userProfile } = useAuth();
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [userProfile]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load wallet balance if wallet is connected
      if (userProfile?.walletAddress) {
        await loadWalletBalance();
        setWalletConnected(true);
      }

      // Load leaderboard data
      await loadLeaderboard();

      // Emit MCP event
      await emitMCPEvent('dashboard_loaded', {
        userId: userProfile?.uid,
        walletConnected: !!userProfile?.walletAddress,
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWalletBalance = async () => {
    if (!userProfile?.walletAddress) return;

    try {
      const bnbBalance = await web3Provider.getBalance(userProfile.walletAddress);
      
      // Mock token balances for demo
      const mockTokens = [
        { symbol: 'CAKE', balance: '150.25', value: 450.75, change24h: 5.2 },
        { symbol: 'BUSD', balance: '1000.00', value: 1000.00, change24h: 0.1 },
        { symbol: 'USDT', balance: '500.00', value: 500.00, change24h: -0.2 },
      ];

      const totalValue = parseFloat(bnbBalance) * 300 + mockTokens.reduce((sum, token) => sum + token.value, 0);

      setWalletBalance({
        bnb: bnbBalance,
        tokens: mockTokens,
        totalValue,
      });
    } catch (error) {
      console.error('Error loading wallet balance:', error);
    }
  };

  const loadLeaderboard = async () => {
    // Mock leaderboard data
    const mockLeaderboard: LeaderboardEntry[] = [
      { rank: 1, username: 'CryptoKing', totalValue: 125000, level: 25, avatar: '/avatars/1.png' },
      { rank: 2, username: 'DeFiMaster', totalValue: 98000, level: 22, avatar: '/avatars/2.png' },
      { rank: 3, username: 'BNBWhale', totalValue: 87500, level: 20, avatar: '/avatars/3.png' },
      { rank: 4, username: 'PancakePro', totalValue: 72000, level: 18, avatar: '/avatars/4.png' },
      { rank: 5, username: 'AfricanTycoon', totalValue: 65000, level: 16, avatar: '/avatars/5.png' },
    ];

    setLeaderboard(mockLeaderboard);
  };

  const connectWallet = async () => {
    try {
      const address = await web3Provider.connect();
      // Update user profile with wallet address
      // This would typically be handled by the auth service
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

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gradient">
            Welcome back, {userProfile?.displayName || 'Tycoon'}!
          </h2>
          <p className="text-muted-foreground">
            Level {userProfile?.level || 1} • {userProfile?.experience || 0} XP
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="badge-glow">
            <Trophy className="w-4 h-4 mr-1" />
            Rank #{leaderboard.findIndex(entry => entry.username === userProfile?.displayName) + 1 || 'N/A'}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="tribal-pattern">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">
                  ${walletBalance?.totalValue.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12.5% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="tribal-pattern">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {userProfile?.totalTrades || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +3 this week
                </p>
              </CardContent>
            </Card>

            <Card className="tribal-pattern">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-secondary">
                  {userProfile?.achievements?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {userProfile?.achievements?.length || 0} unlocked
                </p>
              </CardContent>
            </Card>

            <Card className="tribal-pattern">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Experience</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">
                  {userProfile?.experience || 0}
                </div>
                <Progress value={((userProfile?.experience || 0) % 1000) / 10} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {1000 - ((userProfile?.experience || 0) % 1000)} XP to next level
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="tribal-pattern">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Start trading and building your empire
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-gradient-african hover:shadow-african" asChild>
                  <a href="/trade">
                    <Coins className="w-4 h-4 mr-2" />
                    Start Trading
                  </a>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/achievements">
                    <Trophy className="w-4 h-4 mr-2" />
                    View Achievements
                  </a>
                </Button>
                {!walletConnected && (
                  <Button variant="outline" className="w-full" onClick={connectWallet}>
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="tribal-pattern">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest trading activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <ArrowUpRight className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Bought CAKE</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                    <Badge variant="secondary">+$150</Badge>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-destructive/10 rounded-full">
                      <ArrowDownRight className="w-4 h-4 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Sold BNB</p>
                      <p className="text-xs text-muted-foreground">5 hours ago</p>
                    </div>
                    <Badge variant="destructive">-$75</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="wallet" className="space-y-4">
          {walletConnected && walletBalance ? (
            <div className="space-y-4">
              <Card className="tribal-pattern">
                <CardHeader>
                  <CardTitle>Wallet Balance</CardTitle>
                  <CardDescription>
                    Connected: {formatAddress(userProfile?.walletAddress || '')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-accent/10 rounded-full">
                          <Coins className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium">BNB</p>
                          <p className="text-sm text-muted-foreground">Binance Coin</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatBalance(walletBalance.bnb)} BNB</p>
                        <p className="text-sm text-muted-foreground">
                          ${(parseFloat(walletBalance.bnb) * 300).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    {walletBalance.tokens.map((token, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Coins className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{token.symbol}</p>
                            <p className="text-sm text-muted-foreground">Token</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{token.balance} {token.symbol}</p>
                          <p className="text-sm text-muted-foreground">
                            ${token.value.toFixed(2)} 
                            <span className={`ml-1 ${token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {token.change24h >= 0 ? '+' : ''}{token.change24h}%
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="tribal-pattern">
              <CardHeader>
                <CardTitle>Connect Your Wallet</CardTitle>
                <CardDescription>
                  Connect your wallet to view your balances and start trading
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={connectWallet} className="w-full bg-gradient-african hover:shadow-african">
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card className="tribal-pattern">
            <CardHeader>
              <CardTitle>Top Tycoons</CardTitle>
              <CardDescription>
                The most successful traders in African Tycoon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div key={entry.rank} className="flex items-center space-x-4 p-3 rounded-lg bg-card/50">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/20">
                      <span className="text-sm font-bold text-accent">#{entry.rank}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{entry.username}</p>
                      <p className="text-sm text-muted-foreground">Level {entry.level}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-accent">${entry.totalValue.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Portfolio Value</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}