"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { walletService } from "@/lib/wallet-service";
import { Loader2, Wallet, CheckCircle, AlertCircle } from "lucide-react";

interface DashboardWalletConnectorProps {
  uid: string;
  onWalletLinked?: (address: string) => void;
}

export function DashboardWalletConnector({ uid, onWalletLinked }: DashboardWalletConnectorProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const { toast } = useToast();

  const handleConnectWallet = async () => {
    try {
      setIsConnecting(true);
      setError("");

      console.log('🔍 [DASHBOARD WALLET] Starting wallet connection for UID:', uid);

      // Use the wallet service to link wallet
      const result = await walletService.linkWallet(uid);

      if (result.success && result.wallet) {
        setConnectedAddress(result.wallet.address);
        
        toast({
          title: "Wallet Connected!",
          description: `Your wallet ${result.wallet.address.slice(0, 6)}...${result.wallet.address.slice(-4)} has been successfully linked.`,
        });

        // Notify parent component
        if (onWalletLinked) {
          onWalletLinked(result.wallet.address);
        }
      } else {
        throw new Error(result.message || "Failed to connect wallet");
      }

    } catch (err: any) {
      console.error('🔍 [DASHBOARD WALLET] Connection error:', err);
      setError(err.message);
      
      toast({
        title: "Connection Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Connect Your Wallet
        </CardTitle>
        <CardDescription>
          Link your wallet to start trading and manage your crypto portfolio
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {connectedAddress ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  Wallet Connected
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {formatAddress(connectedAddress)}
                </p>
              </div>
            </div>
            
            <Badge variant="secondary" className="w-full justify-center">
              Ready to Trade
            </Badge>
          </div>
        ) : (
          <div className="space-y-4">
            <Button 
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="w-full"
              size="lg"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet
                </>
              )}
            </Button>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Supports MetaMask, WalletConnect, and other compatible wallets</p>
              <p>• Works on desktop and mobile devices</p>
              <p>• Secure signature verification required</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
