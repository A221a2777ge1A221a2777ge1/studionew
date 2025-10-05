"use client";

import { AuthForm } from "@/components/auth-form";
import { WalletConnector } from "@/components/wallet-connector";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [showWalletConnector, setShowWalletConnector] = useState(false);

  // Check if user has wallet connected
  useEffect(() => {
    if (user && userProfile && userProfile.walletAddress) {
      // User is fully set up, redirect to dashboard
      router.push("/dashboard");
    } else if (user && !showWalletConnector) {
      // User is signed in but no wallet, show wallet connector
      setShowWalletConnector(true);
    }
  }, [user, userProfile, showWalletConnector, router]);

  const handleWalletLinked = (address: string) => {
    toast({
      title: "Setup Complete!",
      description: "Your wallet is connected. Redirecting to dashboard...",
    });
    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
  };

  return (
    <main className="min-h-screen w-full bg-background relative overflow-hidden">
      {/* Tribal Pattern Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full tribal-pattern"></div>
      </div>
      
      {/* Decorative Elements with original color scheme */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-32 right-16 w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 left-20 w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-full opacity-20 animate-pulse delay-2000"></div>
      <div className="absolute bottom-32 right-32 w-24 h-24 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-full opacity-20 animate-pulse delay-500"></div>

      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8">
        <div className="flex flex-col items-center gap-8 text-center max-w-2xl">
          {/* Title with original color scheme */}
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-r from-green-400 via-green-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg">
              DreamCoin
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-green-500 to-yellow-500 mx-auto rounded-full"></div>
          </div>
          
        </div>
        
        <div className="mt-12 w-full max-w-md">
          {!user ? (
            <AuthForm />
          ) : showWalletConnector ? (
            <div className="space-y-6">
              {/* Welcome Message */}
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-green-500">Welcome back!</h2>
                    <p className="text-muted-foreground">
                      Signed in as {user.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Now connect your wallet to complete setup
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Wallet Connector */}
              <WalletConnector 
                onWalletLinked={handleWalletLinked}
              />
            </div>
          ) : (
            <AuthForm />
          )}
        </div>
      </div>
    </main>
  );
}
