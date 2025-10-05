"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Eye, EyeOff, Copy, Trash2 } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';

interface DebugInfo {
  timestamp: string;
  userAgent: string;
  isMobile: boolean;
  hasMetaMask: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  account: string | null;
  chainId: string | null;
  ethereum: any;
  localStorage: any;
  sessionStorage: any;
}

export function DebugDashboard() {
  const { isConnected, account, chainId, isConnecting, connect, disconnect, clearWaitingState } = useWeb3();
  const [isVisible, setIsVisible] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const captureDebugInfo = () => {
    const info: DebugInfo = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      hasMetaMask: !!(window as any).ethereum,
      isConnected,
      isConnecting,
      account,
      chainId,
      ethereum: {
        exists: !!(window as any).ethereum,
        isMetaMask: (window as any).ethereum?.isMetaMask,
        selectedAddress: (window as any).ethereum?.selectedAddress,
        chainId: (window as any).ethereum?.chainId,
        networkVersion: (window as any).ethereum?.networkVersion,
        isConnected: (window as any).ethereum?.isConnected?.(),
        providers: (window as any).ethereum?.providers
      },
      localStorage: {
        waiting_for_metamask: localStorage.getItem('waiting_for_metamask'),
        metamask_redirect_time: localStorage.getItem('metamask_redirect_time'),
        theme: localStorage.getItem('theme'),
        allKeys: Object.keys(localStorage)
      },
      sessionStorage: {
        allKeys: Object.keys(sessionStorage)
      }
    };
    
    setDebugInfo(info);
    setLogs(prev => [...prev, `Debug info captured at ${info.timestamp}`]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const copyDebugInfo = () => {
    if (debugInfo) {
      navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
      setLogs(prev => [...prev, 'Debug info copied to clipboard']);
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('waiting_for_metamask');
    localStorage.removeItem('metamask_redirect_time');
    setLogs(prev => [...prev, 'LocalStorage cleared']);
    captureDebugInfo();
  };

  useEffect(() => {
    if (isVisible) {
      captureDebugInfo();
    }
  }, [isVisible, isConnected, account, chainId, isConnecting]);

  // Capture console logs
  useEffect(() => {
    if (!isVisible) return;

    const originalLog = console.log;
    console.log = (...args) => {
      if (args[0]?.includes?.('🔍 [MOBILE DEBUG]')) {
        setLogs(prev => [...prev.slice(-49), `${new Date().toLocaleTimeString()}: ${args.join(' ')}`]);
      }
      originalLog.apply(console, args);
    };

    return () => {
      console.log = originalLog;
    };
  }, [isVisible]);

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
      >
        <Eye className="h-4 w-4 mr-2" />
        Debug
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mobile Wallet Debug Dashboard</CardTitle>
              <CardDescription>Real-time debugging information for mobile wallet connection</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={captureDebugInfo} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={copyDebugInfo} variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button onClick={clearLocalStorage} variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Storage
              </Button>
              <Button onClick={() => setIsVisible(false)} variant="outline" size="sm">
                <EyeOff className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium">Connection Status</div>
                <Badge variant={isConnected ? "default" : "destructive"}>
                  {isConnected ? "Connected" : "Disconnected"}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium">Connecting</div>
                <Badge variant={isConnecting ? "default" : "secondary"}>
                  {isConnecting ? "Yes" : "No"}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium">Account</div>
                <div className="text-xs font-mono">
                  {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "None"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium">Chain ID</div>
                <div className="text-xs font-mono">{chainId || "None"}</div>
              </CardContent>
            </Card>
          </div>

          {/* Debug Info */}
          {debugInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Debug Information</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-60">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Debug Logs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Debug Logs</CardTitle>
                <Button onClick={clearLogs} variant="outline" size="sm">
                  Clear Logs
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded max-h-60 overflow-auto">
                {logs.length === 0 ? (
                  <div className="text-muted-foreground text-sm">No logs yet...</div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="text-xs font-mono mb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button onClick={connect} disabled={isConnecting}>
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
            <Button onClick={disconnect} variant="outline" disabled={!isConnected}>
              Disconnect
            </Button>
            <Button onClick={clearWaitingState} variant="outline">
              Clear Waiting State
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
