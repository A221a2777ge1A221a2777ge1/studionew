import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { User, Wallet, Bell, Shield, LogOut } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  return (
    <div className="container py-8">
       <h1 className="text-3xl font-bold font-headline mb-6">Profile & Settings</h1>
       <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Menu</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-1">
                    <Button variant="ghost" className="justify-start gap-2"><User className="h-4 w-4" /> Profile</Button>
                    <Button variant="ghost" className="justify-start gap-2"><Wallet className="h-4 w-4" /> Wallet</Button>
                    <Button variant="ghost" className="justify-start gap-2"><Bell className="h-4 w-4" /> Notifications</Button>
                    <Button variant="ghost" className="justify-start gap-2"><Shield className="h-4 w-4" /> Security</Button>
                    <Separator className="my-2"/>
                    <Link href="/" className="w-full">
                      <Button variant="ghost" className="justify-start gap-2 w-full text-destructive hover:text-destructive">
                        <LogOut className="h-4 w-4" /> Logout
                      </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Public Profile</CardTitle>
                    <CardDescription>This information will be displayed on the leaderboard.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src="https://picsum.photos/seed/myavatar/200/200" />
                            <AvatarFallback>AT</AvatarFallback>
                        </Avatar>
                        <Button variant="outline">Change Avatar</Button>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" defaultValue="You" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="wallet">Wallet Address</Label>
                        <Input id="wallet" defaultValue="0x1234...5678" readOnly />
                    </div>
                </CardContent>
            </Card>
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="font-headline">Display Settings</CardTitle>
                    <CardDescription>Customize the look and feel of the application.</CardDescription>
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
                <Button>Save Changes</Button>
            </div>
        </div>
       </div>
    </div>
  );
}
