"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

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
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, signInWithMetaMask } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
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
    }
  };

  const handleMetaMaskSignIn = async () => {
    try {
      setLoading(true);
      await signInWithMetaMask();
      router.push("/dashboard");
      toast({
        title: "Wallet Connected!",
        description: "Successfully connected your MetaMask wallet.",
      });
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect MetaMask. Please make sure MetaMask is installed.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    try {
      setLoading(true);
      await signInWithEmail(email, password);
      router.push("/dashboard");
      toast({
        title: "Welcome back!",
        description: "Successfully signed in.",
      });
    } catch (error) {
      toast({
        title: "Sign-in failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    try {
      setLoading(true);
      await signUpWithEmail(email, password, displayName);
      router.push("/dashboard");
      toast({
        title: "Welcome to African Tycoon!",
        description: "Account created successfully.",
      });
    } catch (error) {
      toast({
        title: "Sign-up failed",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-primary/50 border-2 shadow-lg shadow-primary/20 bg-card/80 backdrop-blur-sm tribal-pattern">
        <CardHeader className="text-center">
          <CardTitle className="font-bold text-2xl text-accent">START YOUR EMPIRE</CardTitle>
          <CardDescription>
            Choose your preferred way to connect and begin your crypto journey.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="wallet" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="wallet" className="space-y-4">
              <div className="space-y-3">
                <Button 
                  size="lg" 
                  className="w-full text-base bg-gradient-african hover:shadow-african transition-all duration-300" 
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <GoogleIcon className="mr-2 h-5 w-5 fill-current" />}
                  Continue with Google
                </Button>
                <Button 
                  size="lg" 
                  className="w-full text-base bg-secondary hover:shadow-gold transition-all duration-300" 
                  onClick={handleMetaMaskSignIn}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <MetaMaskIcon className="mr-2 h-5 w-5" />}
                  Connect MetaMask
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="email" className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-african hover:shadow-african transition-all duration-300" 
                  onClick={handleEmailSignIn}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  Sign In
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Display Name</Label>
                  <Input
                    id="reg-name"
                    type="text"
                    placeholder="Enter your display name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-african hover:shadow-african transition-all duration-300" 
                  onClick={handleEmailSignUp}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  Create Account
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
