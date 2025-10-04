'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, ExternalLink, Download } from 'lucide-react';

interface MobileMetaMaskHelperProps {
  onConnect: () => void;
  onClose: () => void;
}

export function MobileMetaMaskHelper({ onConnect, onClose }: MobileMetaMaskHelperProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [hasMetaMaskApp, setHasMetaMaskApp] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    setIsMobile(mobile);

    // Check if MetaMask app might be installed (this is not 100% reliable)
    if (mobile) {
      // Try to detect MetaMask app by checking for deep link support
      const testLink = document.createElement('a');
      testLink.href = 'metamask://';
      testLink.style.display = 'none';
      document.body.appendChild(testLink);
      
      // This is a basic check - in reality, we can't reliably detect if MetaMask app is installed
      setHasMetaMaskApp(false); // We'll assume it's not installed and show instructions
      
      document.body.removeChild(testLink);
    }
  }, []);

  const handleOpenMetaMaskApp = () => {
    if (isMobile) {
      // Try to open MetaMask app
      const currentUrl = encodeURIComponent(window.location.href);
      const metamaskUrl = `metamask://dapp/${currentUrl}`;
      
      console.log("🔍 [MOBILE DEBUG] Opening MetaMask app with URL:", metamaskUrl);
      
      // Try multiple methods to open MetaMask
      try {
        // Method 1: Direct window.location
        window.location.href = metamaskUrl;
        
        // Set flag to indicate we're waiting for MetaMask
        localStorage.setItem('waiting_for_metamask', 'true');
        
        // Method 2: Create a temporary link as fallback
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = metamaskUrl;
          link.target = '_blank';
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, 500);
        
        // No popup messages - let the background detection handle connection
        console.log("🔍 [MOBILE DEBUG] MetaMask app opening attempted, background detection will handle connection");
      } catch (error) {
        console.error('Error opening MetaMask app:', error);
        // No popup messages - let the background detection handle connection
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

  if (!isMobile) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            MetaMask Mobile Setup
          </CardTitle>
          <CardDescription>
            To use MetaMask on mobile, you need the MetaMask mobile app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Button onClick={onConnect} variant="outline" className="flex-1">
              Try Connect Again
            </Button>
            <Button onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            <p>After installing MetaMask:</p>
            <p>1. Open the MetaMask app</p>
            <p>2. Use the browser inside MetaMask</p>
            <p>3. Visit this website again</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
