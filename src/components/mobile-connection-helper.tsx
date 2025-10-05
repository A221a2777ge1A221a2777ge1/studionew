"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, ArrowLeft, RefreshCw } from 'lucide-react';

interface MobileConnectionHelperProps {
  isVisible: boolean;
  onRetry: () => void;
  onClose: () => void;
}

export function MobileConnectionHelper({ isVisible, onRetry, onClose }: MobileConnectionHelperProps) {
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = localStorage.getItem('metamask_redirect_time');
    if (startTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - parseInt(startTime)) / 1000);
        setTimeElapsed(elapsed);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Connecting to MetaMask
          </CardTitle>
          <CardDescription>
            {timeElapsed > 0 && `Waiting for ${timeElapsed} seconds...`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>Current Status:</strong>
              <div className="mt-2 text-sm">
                <div>• MetaMask not detected in current browser</div>
                <div>• You need to use MetaMask's built-in browser</div>
              </div>
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertDescription>
              <strong>Solution - Use MetaMask Browser:</strong>
              <ol className="mt-2 space-y-1 text-sm">
                <li>1. Open MetaMask mobile app</li>
                <li>2. Tap the "Browser" tab at the bottom</li>
                <li>3. Type this website URL in the address bar</li>
                <li>4. The connection will work automatically</li>
              </ol>
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertDescription>
              <strong>Alternative - Install MetaMask:</strong>
              <ol className="mt-2 space-y-1 text-sm">
                <li>1. Download MetaMask from Play Store/App Store</li>
                <li>2. Create or import your wallet</li>
                <li>3. Use the browser inside MetaMask</li>
                <li>4. Visit this website again</li>
              </ol>
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button onClick={onRetry} variant="outline" className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button onClick={onClose} className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => window.open('https://metamask.io/download/', '_blank')}
              className="text-sm"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Download MetaMask
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
