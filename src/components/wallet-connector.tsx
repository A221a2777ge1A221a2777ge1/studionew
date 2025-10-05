"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { walletService } from '@/lib/wallet-service';
import { Wallet, Smartphone, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface WalletConnectorProps {
  onWalletLinked?: (address: string) => void;
  onClose?: () => void;
}

export function WalletConnector({ onWalletLinked, onClose }: WalletConnectorProps) {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStep, setConnectionStep] = useState<string>('');

  const handleConnectWallet = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in with Google first before connecting your wallet.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    setConnectionStep('Connecting wallet...');

    try {
      const result = await walletService.linkWallet(user.uid);

      if (result.success) {
        setConnectionStep('Wallet linked successfully!');
        
        toast({
          title: "Wallet Connected!",
          description: `Successfully linked wallet ${result.wallet?.address.slice(0, 6)}...${result.wallet?.address.slice(-4)}`,
        });

        onWalletLinked?.(result.wallet?.address || '');
        onClose?.();
      } else {
        throw new Error(result.message || 'Failed to link wallet');
      }

    } catch (error: any) {
      console.error('Wallet connection error:', error);
      
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
      setConnectionStep('');
    }
  };

  const getConnectionMethod = () => {
    const isMobile = walletService.isMobile();
    const hasInjectedProvider = walletService.isAnyInjectedProvider();
    const isInMetaMaskBrowser = walletService.isInMetaMaskBrowser();

    if (isInMetaMaskBrowser) {
      return {
        method: 'MetaMask Browser',
        description: 'Direct connection via MetaMask browser',
        icon: <Wallet className="h-5 w-5" />,
        color: 'bg-orange-500'
      };
    } else if (hasInjectedProvider) {
      return {
        method: 'Wallet Extension',
        description: 'Connection via browser wallet extension',
        icon: <Wallet className="h-5 w-5" />,
        color: 'bg-orange-500'
      };
    } else if (isMobile) {
      return {
        method: 'Mobile Wallet',
        description: 'Connection via MetaMask app or WalletConnect',
        icon: <Smartphone className="h-5 w-5" />,
        color: 'bg-blue-500'
      };
    } else {
      return {
        method: 'Wallet Extension',
        description: 'Connection via browser wallet extension',
        icon: <Wallet className="h-5 w-5" />,
        color: 'bg-orange-500'
      };
    }
  };

  const connectionInfo = getConnectionMethod();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Connect Wallet
        </CardTitle>
        <CardDescription>
          Link your wallet to complete your profile and start trading
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Method Info */}
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <div className={`p-2 rounded-full ${connectionInfo.color} text-white`}>
            {connectionInfo.icon}
          </div>
          <div>
            <div className="font-medium">{connectionInfo.method}</div>
            <div className="text-sm text-muted-foreground">{connectionInfo.description}</div>
          </div>
        </div>

        {/* Security Info */}
        <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
          <Shield className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <div className="font-medium text-green-800 dark:text-green-200">Secure Process</div>
            <div className="text-green-700 dark:text-green-300">
              We'll ask you to sign a message to verify wallet ownership. No private keys are shared.
            </div>
          </div>
        </div>

        {/* Connection Steps */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Connection Process:</div>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Connect your wallet</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Sign a verification message</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Wallet linked to your account</span>
            </div>
          </div>
        </div>

        {/* Mobile Instructions */}
        {walletService.isMobile() && !walletService.isAnyInjectedProvider() && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              Mobile Wallet Options:
            </div>
            <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
              <div>• <strong>MetaMask:</strong> Install MetaMask app and use WalletConnect</div>
              <div>• <strong>Other Wallets:</strong> Use WalletConnect to connect any compatible wallet</div>
              <div>• <strong>Best Experience:</strong> Open this site in MetaMask browser</div>
            </div>
          </div>
        )}

        {/* Connection Status */}
        {connectionStep && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-blue-800 dark:text-blue-200">{connectionStep}</span>
          </div>
        )}

        {/* Connect Button */}
        <Button 
          onClick={handleConnectWallet}
          disabled={isConnecting || !user}
          className="w-full"
          size="lg"
        >
          {isConnecting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </>
          )}
        </Button>

        {/* User Status */}
        {user && (
          <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800 dark:text-green-200">
              Signed in as {user.email}
            </span>
          </div>
        )}

        {!user && (
          <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              Please sign in with Google first
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
