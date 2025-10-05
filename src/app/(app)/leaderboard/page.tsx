"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Crown, Trophy, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { FirebaseService } from "@/lib/firebaseService";

interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  displayName: string;
  email: string;
  totalVolume: number;
  totalTrades: number;
  isCurrentUser: boolean;
}

export default function LeaderboardPage() {
  const { user, userProfile } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real implementation, you would fetch leaderboard data from Firebase
        // For now, we'll create a mock leaderboard based on available user data
        const mockLeaderboardData: LeaderboardUser[] = [
          {
            id: '1',
            rank: 1,
            name: 'CryptoKing.eth',
            displayName: 'CryptoKing',
            email: 'cryptoking@example.com',
            totalVolume: 15000000.75,
            totalTrades: 1250,
            isCurrentUser: false,
          },
          {
            id: '2',
            rank: 2,
            name: 'DeFiMaster.bnb',
            displayName: 'DeFi Master',
            email: 'defimaster@example.com',
            totalVolume: 12500000.50,
            totalTrades: 980,
            isCurrentUser: false,
          },
          {
            id: '3',
            rank: 3,
            name: 'TokenTrader.sol',
            displayName: 'Token Trader',
            email: 'tokentrader@example.com',
            totalVolume: 11000000.00,
            totalTrades: 856,
            isCurrentUser: false,
          },
          // Add current user if they exist
          ...(user && userProfile ? [{
            id: user.uid,
            rank: 4,
            name: userProfile.displayName || userProfile.username || 'You',
            displayName: userProfile.displayName || 'Anonymous',
            email: userProfile.email,
            totalVolume: userProfile.totalVolume || 0,
            totalTrades: userProfile.totalTrades || 0,
            isCurrentUser: true,
          }] : []),
          {
            id: '5',
            rank: 5,
            name: 'BlockchainBoss',
            displayName: 'Blockchain Boss',
            email: 'blockchainboss@example.com',
            totalVolume: 8000000.00,
            totalTrades: 642,
            isCurrentUser: false,
          },
          {
            id: '6',
            rank: 6,
            name: 'CryptoNinja',
            displayName: 'Crypto Ninja',
            email: 'cryptoninja@example.com',
            totalVolume: 6500000.00,
            totalTrades: 534,
            isCurrentUser: false,
          },
          {
            id: '7',
            rank: 7,
            name: 'DeFiWarrior',
            displayName: 'DeFi Warrior',
            email: 'defiwarrior@example.com',
            totalVolume: 6200000.00,
            totalTrades: 487,
            isCurrentUser: false,
          },
          {
            id: '8',
            rank: 8,
            name: 'TokenHodler',
            displayName: 'Token Hodler',
            email: 'tokenhodler@example.com',
            totalVolume: 5800000.00,
            totalTrades: 423,
            isCurrentUser: false,
          },
        ];

        // Sort by total volume (descending)
        mockLeaderboardData.sort((a, b) => b.totalVolume - a.totalVolume);
        
        // Update ranks
        mockLeaderboardData.forEach((user, index) => {
          user.rank = index + 1;
        });

        setLeaderboardData(mockLeaderboardData);
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
        setError('Failed to load leaderboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [user, userProfile]);

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center gap-4 mb-6">
          <Trophy className="h-8 w-8 text-accent" />
          <h1 className="text-3xl font-bold">Leaderboard</h1>
        </div>
        <Card className="border-secondary/80 border-2">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <span className="ml-2">Loading leaderboard...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="flex items-center gap-4 mb-6">
          <Trophy className="h-8 w-8 text-accent" />
          <h1 className="text-3xl font-bold">Leaderboard</h1>
        </div>
        <Card className="border-secondary/80 border-2">
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-6">
        <Trophy className="h-8 w-8 text-accent" />
        <h1 className="text-3xl font-bold">Leaderboard</h1>
      </div>
      <Card className="border-secondary/80 border-2">
        <CardHeader>
            <CardTitle className="text-xl font-semibold">Top Players</CardTitle>
            <CardDescription>The mightiest players in the EVANA universe. Your rank is highlighted.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">Total Volume (USD)</TableHead>
                <TableHead className="text-right">Trades</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData.map((user) => (
                <TableRow key={user.id} className={cn("text-base", user.isCurrentUser && 'bg-primary/10')}>
                  <TableCell className="font-bold text-lg">
                    <div className="flex items-center gap-2">
                        {user.rank}
                        {user.rank === 1 && <Crown className="h-6 w-6 text-accent" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary">
                        <AvatarFallback>{user.displayName.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-medium">{user.name}</span>
                        {user.isCurrentUser && (
                          <Badge variant="secondary" className="ml-2">You</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-lg text-accent">
                    ${user.totalVolume.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {user.totalTrades.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
