"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <title>Google</title>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.86 2.25-5.02 2.25-4.42 0-8.03-3.6-8.03-8.03s3.6-8.03 8.03-8.03c2.5 0 4.13.93 5.38 2.18l2.5-2.5C18.16 1.9 15.66 0 12.48 0 5.6 0 0 5.6 0 12.5S5.6 25 12.48 25c3.45 0 6.06-1.18 8.03-3.18 2.05-2.1 2.6-5.05 2.6-7.85 0-.6-.05-1.18-.15-1.75Z" />
  </svg>
);

export function AuthForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { signInWithGoogle } = useAuth();
  
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      
      // Check if we're returning from a redirect
      const redirectUrl = localStorage.getItem('google_auth_redirect_url');
      if (redirectUrl) {
        // Clear the redirect URL and redirect to dashboard
        localStorage.removeItem('google_auth_redirect_url');
        router.push("/dashboard");
      } else {
        // Normal flow - redirect to dashboard
        router.push("/dashboard");
      }
      
      toast({
        title: "Welcome to DreamCoin!",
        description: "Successfully signed in with Google. Let's build your empire!",
      });
    } catch (error: any) {
      // Handle specific Firebase auth errors
      if (error.code === 'auth/popup-closed-by-user') {
        // Don't show error for popup closed - this is normal user behavior
        console.log('User closed the authentication popup - this is normal behavior');
        return;
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Don't show error for cancelled popup
        console.log('Authentication popup was cancelled - this is normal behavior');
        return;
      } else if (error.message === 'Redirect initiated') {
        // This is expected for MetaMask browser or mobile browser redirect flow
        console.log('Google sign-in redirect initiated - this is normal for MetaMask browser or mobile browsers');
        return;
      } else if (error.code === 'auth/popup-blocked') {
        console.error('Popup blocked error:', error);
        toast({
          title: "Popup Blocked",
          description: "Please allow popups for this site and try again.",
          variant: "destructive",
        });
      } else if (error.code === 'auth/network-request-failed') {
        console.error('Network error:', error);
        toast({
          title: "Network Error",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        });
      } else if (error.code === 'auth/operation-not-allowed' || 
                 error.message?.includes('Use secure browsers') ||
                 error.message?.includes('does not comply with Google') ||
                 error.message?.includes('Access blocked')) {
        console.error('Google policy error:', error);
        toast({
          title: "Authentication Method Changed",
          description: "Redirecting to Google sign-in for better compatibility...",
          variant: "default",
        });
        // Don't show error, the redirect method will handle it
        return;
      } else {
        // Generic error for other cases
        console.error('Unexpected Google sign-in error:', error);
        toast({
          title: "Sign-in failed",
          description: "Failed to sign in with Google. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm border-2 border-border shadow-2xl">
      <CardHeader className="space-y-4 text-center pb-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-400 to-yellow-500 bg-clip-text text-transparent">
          Begin Your Journey
        </CardTitle>
        <CardDescription className="text-muted-foreground text-base">
          Sign in to start building your crypto empire with the wisdom of African heritage
        </CardDescription>
        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
          💡 <strong>Tip:</strong> Complete the Google sign-in in the popup window to continue
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 pb-8">
        {/* Google Sign In Button */}
        <Button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          {loading ? (
            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
          ) : (
            <GoogleIcon className="mr-3 h-6 w-6" />
          )}
          Continue with Google
        </Button>

        {/* Decorative line with original colors */}
        <div className="flex items-center justify-center space-x-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-green-400 to-transparent"></div>
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-green-400 to-transparent"></div>
        </div>

        {/* Terms and Privacy */}
        <div className="text-center text-sm text-muted-foreground">
          By continuing, you agree to our{" "}
          <a href="#" className="text-green-400 hover:text-green-300 underline font-medium">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-green-400 hover:text-green-300 underline font-medium">
            Privacy Policy
          </a>
        </div>
      </CardContent>
    </Card>
  );
}