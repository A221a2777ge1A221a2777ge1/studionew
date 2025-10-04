'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Smartphone, ExternalLink, Download, AlertCircle } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { useToast } from '@/hooks/use-toast';

interface MobileWalletConnectorProps {
  onConnect?: () => void;
  onClose?: () => void;
  isOpen?: boolean;
}

export function MobileWalletConnector({ onConnect, onClose, isOpen = false }: MobileWalletConnectorProps) {
  const { isMobile, isMetaMaskInstalled, connect, isConnecting } = useWeb3();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(isOpen);

  useEffect(() => {
    setShowDialog(isOpen);
  }, [isOpen]);

  const handleConnect = async () => {
    try {
      await connect();
      onConnect?.();
      setShowDialog(false);
      onClose?.();
    } catch (error: any) {
      if (error.message.includes('MetaMask mobile app required')) {
        // Don't show error toast for mobile redirect
        return;
      }
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect wallet',
        variant: 'destructive',
      });
    }
  };

  const handleOpenMetaMaskApp = () => {
    if (isMobile) {
      const currentUrl = encodeURIComponent(window.location.href);
      const metamaskUrl = `metamask://dapp/${currentUrl}`;
      
      console.log("🔍 [MOBILE DEBUG] Opening MetaMask app with URL:", metamaskUrl);
      
      try {
        // Store timestamp for tracking
        localStorage.setItem('metamask_redirect_time', Date.now().toString());
        
        // Try to open MetaMask app using iframe method (more reliable)
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = metamaskUrl;
        document.body.appendChild(iframe);
        
        // Remove iframe after delay
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
        
        // Also try direct redirect as fallback
        window.location.href = metamaskUrl;
        
        // Set flag to indicate we're waiting for MetaMask
        localStorage.setItem('waiting_for_metamask', 'true');
        
        // Show helpful message
        toast({
          title: 'Opening MetaMask...',
          description: 'After connecting in MetaMask, return to this website to complete the connection',
          variant: 'default',
        });
        
        // Close the dialog
        setShowDialog(false);
        onClose?.();
      } catch (error) {
        console.error('Error opening MetaMask app:', error);
        toast({
          title: 'MetaMask Mobile Required',
          description: 'Please install MetaMask mobile app and open this site in the MetaMask browser',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDownloadMetaMask = () => {
    if (isMobile) {
      const userAgent = navigator.userAgent;
      if (/iPhone|iPad|iPod/i.test(userAgent)) {
        window.open('https://apps.apple.com/app/metamask/id1438144202', '_blank');
      } else if (/Android/i.test(userAgent)) {
        window.open('https://play.google.com/store/apps/details?id=io.metamask', '_blank');
      } else {
        window.open('https://metamask.io/download/', '_blank');
      }
    } else {
      window.open('https://metamask.io/download/', '_blank');
    }
  };

  const handleClose = () => {
    setShowDialog(false);
    onClose?.();
  };

  // Don't show on desktop or if MetaMask is already installed
  if (!isMobile || isMetaMaskInstalled) {
    return null;
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            MetaMask Mobile Setup
          </DialogTitle>
          <DialogDescription>
            To connect your wallet on mobile, you need the MetaMask mobile app
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Mobile Wallet Connection</h4>
                <p className="text-sm text-muted-foreground">
                  MetaMask browser extension is not available on mobile devices. 
                  You need to use the MetaMask mobile app.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Option 1: Use MetaMask Mobile App</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Open this site in the MetaMask mobile app's built-in browser
              </p>
              <Button onClick={handleOpenMetaMaskApp} className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in MetaMask App
              </Button>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Option 2: Install MetaMask</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Download and install the MetaMask mobile app
              </p>
              <Button onClick={handleDownloadMetaMask} variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download MetaMask
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleConnect} variant="outline" className="flex-1" disabled={isConnecting}>
              {isConnecting ? 'Connecting...' : 'Try Connect Again'}
            </Button>
            <Button onClick={handleClose} className="flex-1">
              Close
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p><strong>After installing MetaMask:</strong></p>
            <p>1. Open the MetaMask app</p>
            <p>2. Use the browser inside MetaMask</p>
            <p>3. Visit this website again</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
