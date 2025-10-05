"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { User, Wallet, Bell, Shield, LogOut, Gift, Users, Trophy, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { FirebaseService } from "@/lib/firebaseService";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/logo";

export default function ProfilePage() {
  const { user, userProfile, loading, refreshUserProfile } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const totalRewards = 12500;

  // Debug: Log user profile data
  useEffect(() => {
    console.log("🔍 [PROFILE DEBUG] User profile loaded:", {
      user: user ? { uid: user.uid, email: user.email } : null,
      userProfile: userProfile ? {
        uid: userProfile.uid,
        displayName: userProfile.displayName,
        username: userProfile.username,
        walletAddress: userProfile.walletAddress
      } : null,
      loading
    });
  }, [user, userProfile, loading]);

  // Initialize username and avatar from user profile
  useEffect(() => {
    if (userProfile) {
      const currentUsername = userProfile.username || userProfile.displayName || "You";
      setUsername(currentUsername);
      setAvatarUrl(userProfile.photoURL || "");
      console.log("🔍 [PROFILE DEBUG] Username and avatar initialized:", {
        username: currentUsername,
        avatarUrl: userProfile.photoURL
      });
    }
  }, [userProfile]);

  const handleUsernameChange = (value: string) => {
    console.log("🔍 [PROFILE DEBUG] Username changed:", { from: username, to: value });
    setUsername(value);
    setHasChanges(value !== (userProfile?.username || userProfile?.displayName || "You"));
  };

  const handleSaveChanges = async () => {
    if (!user || !userProfile) {
      console.error("🔍 [PROFILE DEBUG] Cannot save: No user or userProfile");
      toast({
        title: "Error",
        description: "Please log in to save changes",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    console.log("🔍 [PROFILE DEBUG] Starting save process:", {
      uid: user.uid,
      newUsername: username,
      hasChanges
    });

    try {
      // Update username in Firebase
      await FirebaseService.updateUserProfile(user.uid, {
        displayName: username,
        username: username
      });

      console.log("🔍 [PROFILE DEBUG] Username saved successfully to Firebase");
      
      // Refresh the user profile to get updated data
      await refreshUserProfile();
      
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      
      setHasChanges(false);
    } catch (error) {
      console.error("🔍 [PROFILE DEBUG] Save failed:", error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingAvatar(true);

    try {
      // Create a preview URL for immediate display
      const previewUrl = URL.createObjectURL(file);
      setAvatarUrl(previewUrl);

      // For now, we'll use a placeholder service. In production, you'd upload to Firebase Storage
      // and get the download URL
      const placeholderUrl = `https://picsum.photos/seed/${user.uid}/200/200`;
      
      // Update the user profile with the new avatar URL
      await FirebaseService.updateUserProfile(user.uid, {
        photoURL: placeholderUrl
      });

      // Refresh the user profile
      await refreshUserProfile();

      toast({
        title: "Success",
        description: "Avatar updated successfully!",
      });

    } catch (error) {
      console.error("🔍 [PROFILE DEBUG] Avatar upload failed:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to update avatar. Please try again.",
        variant: "destructive",
      });
      // Reset to original avatar
      setAvatarUrl(userProfile?.photoURL || "");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
       <h1 className="text-3xl font-bold mb-6">Profile & Settings</h1>
       <div className="grid gap-8 lg:grid-cols-4">
        <div className="lg:col-span-1">
            <Card>
                <CardContent className="p-2">
                    <nav className="flex flex-col gap-1">
                        <Button variant="ghost" className="justify-start gap-3 px-3 text-left"><User className="h-5 w-5" /> Profile</Button>
                        <Button variant="ghost" className="justify-start gap-3 px-3 text-left"><Wallet className="h-5 w-5" /> Wallet</Button>
                        <Button variant="ghost" className="justify-start gap-3 px-3 text-left"><Bell className="h-5 w-5" /> Notifications</Button>
                        <Button variant="ghost" className="justify-start gap-3 px-3 text-left"><Shield className="h-5 w-5" /> Security</Button>
                        <Link href="/referrals" passHref>
                          <Button variant="ghost" className="justify-start gap-3 px-3 text-left w-full"><Users className="h-5 w-5" /> Referrals</Button>
                        </Link>
                        <Separator className="my-1"/>
                        <Link href="/" className="w-full">
                          <Button variant="ghost" className="justify-start gap-3 px-3 w-full text-destructive hover:text-destructive">
                            <LogOut className="h-5 w-5" /> Logout
                          </Button>
                        </Link>
                    </nav>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-3">
            <Card className="mb-8 border-accent/50 border-2 shadow-lg shadow-accent/10">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Gift className="h-6 w-6 text-accent"/>
                        <CardTitle>My Rewards</CardTitle>
                    </div>
                    <CardDescription>DREAM tokens earned from achievements and referrals.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4">
                   <div className="flex items-center gap-4">
                        <Logo className="h-12 w-12"/>
                        <div>
                            <p className="text-4xl font-bold text-accent">{totalRewards.toLocaleString()}</p>
                            <p className="text-muted-foreground">Total Claimable DREAM</p>
                        </div>
                   </div>
                   <Button size="lg" className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
                       <Sparkles className="mr-2 h-5 w-5"/> Claim Rewards
                   </Button>
                </CardContent>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
                        <Trophy className="h-5 w-5 text-primary"/>
                        <div>
                            <p className="font-semibold">From Achievements</p>
                            <p>1,250 DREAM</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
                        <Users className="h-5 w-5 text-primary"/>
                        <div>
                            <p className="font-semibold">From Referrals</p>
                            <p>11,250 DREAM</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Public Profile</CardTitle>
                    <CardDescription>This is how other players see you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center flex-wrap gap-4">
                        <Avatar className="h-20 w-20 border-4 border-primary">
                            <AvatarImage src={avatarUrl || userProfile?.photoURL || `https://picsum.photos/seed/${user?.uid}/200/200`} />
                            <AvatarFallback>
                              {username ? username.charAt(0).toUpperCase() : 'DC'}
                            </AvatarFallback>
                        </Avatar>
                        <Button 
                          variant="outline" 
                          onClick={handleAvatarChange}
                          disabled={isUploadingAvatar}
                        >
                          {isUploadingAvatar ? "Uploading..." : "Change Avatar"}
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input 
                            id="username" 
                            value={username}
                            onChange={(e) => handleUsernameChange(e.target.value)}
                            placeholder="Enter your username"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="wallet">Wallet Address</Label>
                        <Input id="wallet" defaultValue="0x1234...5678" readOnly />
                    </div>
                </CardContent>
            </Card>
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Display Settings</CardTitle>
                    <CardDescription>Customize the look and feel of the game.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                            <Label htmlFor="theme-toggle-label">Theme</Label>
                            <p id="theme-toggle-label" className="text-sm text-muted-foreground">Select a light or dark theme.</p>
                        </div>
                        <ThemeToggle />
                    </div>
                </CardContent>
            </Card>
             <div className="mt-8 flex justify-end">
                <Button 
                    size="lg" 
                    onClick={handleSaveChanges}
                    disabled={!hasChanges || isSaving}
                >
                    {isSaving ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </div>
       </div>
    </div>
  );
}
