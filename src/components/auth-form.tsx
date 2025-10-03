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
import { Loader2, Smartphone } from "lucide-react";
import { MobileMetaMaskHelper } from "@/components/mobile-metamask-helper";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <title>Google</title>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.86 2.25-5.02 2.25-4.42 0-8.03-3.6-8.03-8.03s3.6-8.03 8.03-8.03c2.5 0 4.13.93 5.38 2.18l2.5-2.5C18.16 1.9 15.66 0 12.48 0 5.6 0 0 5.6 0 12.5S5.6 25 12.48 25c3.45 0 6.06-1.18 8.03-3.18 2.05-2.1 2.6-5.05 2.6-7.85 0-.6-.05-1.18-.15-1.75Z" />
  </svg>
);

const MetaMaskIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor">
    <path d="M255.15,64.28,148.36,3.4a23.46,23.46,0,0,0-21,0L20.67,64.28a23.45,23.45,0,0,0-12.82,21V192a23.45,23.45,0,0,0,12.82,21l106.69,60.88a23.46,23.46,0,0,0,21,0L255.15,213a23.45,23.45,0,0,0,12.82-21V85.25A23.45,23.45,0,0,0,255.15,64.28ZM231.51,91.8,172,125.75,128.09,91.8l21.56-12.7L181.6,98.34,204.41,85.25Zm-138.8,1.4,14.65-8.58,15.22,8.81L114,99.25l-21.29-12.5ZM24,192V105.1l43.52,25.4V147L36.32,162.7l30.9,17.43,15.22-9,12.18,7.16-27.4,15.8-30.9-17.43L63,161.46v-34.4l30.9-18,12.18,7.16L81.25,128.75,37.34,103.34,24,96.19Zm91.82,65.81L24,196.9V85.25l13.6-7.89,78.22,46.12ZM128.09,142.5,97.19,125,128.09,107.5l30.9,17.5Zm-.7,10.63-15.22,8.81-30.9-17.43,30.9-17.43,30.9,17.43-30.9,17.43Zm.7,11.33,43.76-25.26,27.16,15.68-44.46,25.5-26.46-15.24Zm65.12-36.56,12.18-7.16,15.22,9-30.9,17.43L163.6,154Zm16,42.42-26.22-15.11,12.18-7.16,32-18.47L232,189.34ZM141,84.12,128.79,76.5l12.18-7.16,13,7.52Zm8,4.71-30.15-17.57,30.15-17.57,12.18,7.16L149.06,71.4l12.18,7.16Zm68.49,103L149.06,128l24.83-14.33,12.18,7.16,30.9,18Zm0-34.4-26.46-15.24,12.18-7.16,30.9,18v34.4Z"/>
  </svg>
);

export function AuthForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { signInWithGoogle, signInWithMetaMask } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [loadingMethod, setLoadingMethod] = useState<string | null>(null);
  const [showMobileHelper, setShowMobileHelper] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setLoadingMethod('google');
      await signInWithGoogle();
      router.push("/dashboard");
      toast({
        title: "Welcome to African Tycoon!",
        description: "Successfully signed in with Google.",
      });
    } catch (error) {
      toast({
        title: "Sign-in failed",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMethod(null);
    }
  };

  const handleMetaMaskSignIn = async () => {
    try {
      setLoading(true);
      setLoadingMethod('metamask');
      await signInWithMetaMask();
      router.push("/dashboard");
      toast({
        title: "Welcome to African Tycoon!",
        description: "Successfully connected with MetaMask.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('MetaMask not detected')) {
        // Check if we're on mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
          setShowMobileHelper(true);
        } else {
          toast({
            title: "MetaMask Required",
            description: "Please install MetaMask browser extension.",
            variant: "destructive",
          });
        }
      } else if (errorMessage.includes('User rejected')) {
        toast({
          title: "Connection Cancelled",
          description: "MetaMask connection was cancelled. Please try again.",
          variant: "destructive",
        });
      } else if (errorMessage.includes('locked')) {
        toast({
          title: "MetaMask Locked",
          description: "Please unlock your MetaMask wallet and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "MetaMask Connection Failed",
          description: `Failed to connect with MetaMask: ${errorMessage}`,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      setLoadingMethod(null);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md tribal-pattern">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-gradient">
            Welcome to African Tycoon
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Choose your preferred sign-in method to start your crypto empire
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google Sign In */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-12 bg-white text-black hover:bg-gray-100 border border-gray-300"
            variant="outline"
          >
            {loadingMethod === 'google' ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <GoogleIcon className="mr-2 h-5 w-5" />
            )}
            Continue with Google
          </Button>

          {/* MetaMask Sign In */}
          <Button
            onClick={handleMetaMaskSignIn}
            disabled={loading}
            className="w-full h-12 bg-orange-500 text-white hover:bg-orange-600"
          >
            {loadingMethod === 'metamask' ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <MetaMaskIcon className="mr-2 h-5 w-5" />
            )}
            Connect with MetaMask
          </Button>

          {/* Mobile MetaMask Info */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-dashed">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Smartphone className="h-4 w-4" />
              <span className="font-medium">Mobile Users:</span>
            </div>
            <p className="text-xs text-muted-foreground">
              For MetaMask on mobile, make sure you have the MetaMask app installed and 
              use the "Connect with MetaMask" option in your mobile browser.
            </p>
          </div>

          {/* Terms and Privacy */}
          <div className="text-center text-xs text-muted-foreground mt-4">
            By continuing, you agree to our{" "}
            <a href="#" className="underline hover:text-primary">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-primary">
              Privacy Policy
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Mobile MetaMask Helper */}
      {showMobileHelper && (
        <MobileMetaMaskHelper
          onConnect={() => {
            setShowMobileHelper(false);
            handleMetaMaskSignIn();
          }}
          onClose={() => setShowMobileHelper(false)}
        />
      )}
    </div>
  );
}