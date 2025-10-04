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
      router.push("/dashboard");
      toast({
        title: "Welcome to DreamCoin!",
        description: "Successfully signed in with Google. Let's build your empire!",
      });
    } catch (error) {
      toast({
        title: "Sign-in failed",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      });
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