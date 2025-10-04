'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useWeb3 } from '@/hooks/useWeb3';
import { useTheme } from '@/hooks/use-theme';

export function DebugDashboard() {
  const { user, userProfile, loading } = useAuth();
  const { isConnected, account, isMobile, isMetaMaskInstalled } = useWeb3();
  const { theme, resolvedTheme } = useTheme();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugInfo({
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        localStorage: {
          theme: localStorage.getItem('theme'),
          userPreferences: user ? localStorage.getItem(`user_preferences_${user.uid}`) : null,
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          isClient: typeof window !== 'undefined',
        }
      });
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 w-96 max-h-96 overflow-y-auto bg-background border rounded-lg shadow-lg z-50 p-4">
      <h3 className="font-bold mb-4 text-sm">🔍 DEBUG DASHBOARD</h3>
      
      <div className="space-y-3 text-xs">
        {/* Auth Status */}
        <Card className="p-2">
          <CardHeader className="p-2">
            <CardTitle className="text-xs">Authentication</CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-1">
            <div>User: {user ? '✅ Logged In' : '❌ Not Logged In'}</div>
            <div>Loading: {loading ? '⏳ Yes' : '✅ No'}</div>
            <div>Profile: {userProfile ? '✅ Loaded' : '❌ Not Loaded'}</div>
            {user && <div>UID: {user.uid.slice(0, 8)}...</div>}
          </CardContent>
        </Card>

        {/* Theme Status */}
        <Card className="p-2">
          <CardHeader className="p-2">
            <CardTitle className="text-xs">Theme</CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-1">
            <div>Current: <Badge variant="outline">{theme}</Badge></div>
            <div>Resolved: <Badge variant="outline">{resolvedTheme}</Badge></div>
            <div>HTML Class: {document.documentElement.className}</div>
          </CardContent>
        </Card>

        {/* Wallet Status */}
        <Card className="p-2">
          <CardHeader className="p-2">
            <CardTitle className="text-xs">Wallet</CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-1">
            <div>Connected: {isConnected ? '✅ Yes' : '❌ No'}</div>
            <div>MetaMask: {isMetaMaskInstalled ? '✅ Installed' : '❌ Not Installed'}</div>
            <div>Mobile: {isMobile ? '📱 Yes' : '💻 No'}</div>
            {account && <div>Account: {account.slice(0, 8)}...</div>}
          </CardContent>
        </Card>

        {/* Local Storage */}
        <Card className="p-2">
          <CardHeader className="p-2">
            <CardTitle className="text-xs">Local Storage</CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-1">
            <div>Theme: {debugInfo.localStorage?.theme || 'None'}</div>
            <div>User Prefs: {debugInfo.localStorage?.userPreferences ? '✅ Set' : '❌ Not Set'}</div>
          </CardContent>
        </Card>

        {/* Environment */}
        <Card className="p-2">
          <CardHeader className="p-2">
            <CardTitle className="text-xs">Environment</CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-1">
            <div>Mode: {debugInfo.environment?.nodeEnv}</div>
            <div>Client: {debugInfo.environment?.isClient ? '✅ Yes' : '❌ No'}</div>
            <div>Updated: {new Date(debugInfo.timestamp).toLocaleTimeString()}</div>
          </CardContent>
        </Card>
      </div>

      <Button 
        size="sm" 
        variant="outline" 
        className="w-full mt-2 text-xs"
        onClick={() => {
          console.log("🔍 [DEBUG] Full debug info:", {
            auth: { user, userProfile, loading },
            theme: { theme, resolvedTheme },
            wallet: { isConnected, account, isMobile, isMetaMaskInstalled },
            debugInfo
          });
        }}
      >
        Log Full Debug Info
      </Button>
    </div>
  );
}
