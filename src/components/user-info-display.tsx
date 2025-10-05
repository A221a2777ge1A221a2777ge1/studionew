"use client";

import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Wallet, Trophy, Star, User } from "lucide-react";

interface UserInfoDisplayProps {
  showAvatar?: boolean;
  showWallet?: boolean;
  showLevel?: boolean;
  compact?: boolean;
  className?: string;
}

export function UserInfoDisplay({ 
  showAvatar = true, 
  showWallet = true, 
  showLevel = true,
  compact = false,
  className = ""
}: UserInfoDisplayProps) {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-muted rounded-full"></div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted rounded"></div>
            <div className="h-3 w-16 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  const displayName = userProfile.displayName || user.email?.split('@')[0] || 'User';
  const avatarUrl = userProfile.photoURL || user.photoURL || `https://picsum.photos/seed/${user.uid}/48/48`;

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {showAvatar && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium">{displayName}</span>
          {showLevel && (
            <span className="text-xs text-muted-foreground">
              Level {userProfile.level || 1}
            </span>
          )}
        </div>
        {showWallet && userProfile.walletAddress && (
          <Badge variant="secondary" className="text-xs">
            <Wallet className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>User Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-3">
          {showAvatar && (
            <Avatar className="h-12 w-12">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
          <div className="flex-1">
            <h3 className="font-semibold">{displayName}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {showLevel && (
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Level {userProfile.level || 1}</p>
                <p className="text-xs text-muted-foreground">
                  {userProfile.experience || 0} XP
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm font-medium">{userProfile.totalTrades || 0}</p>
              <p className="text-xs text-muted-foreground">Total Trades</p>
            </div>
          </div>
        </div>

        {showWallet && (
          <div className="pt-2 border-t">
            {userProfile.walletAddress ? (
              <div className="flex items-center space-x-2">
                <Wallet className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-green-600">Wallet Connected</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {userProfile.walletAddress.slice(0, 6)}...{userProfile.walletAddress.slice(-4)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No wallet connected</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
