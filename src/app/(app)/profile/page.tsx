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
            <Card>
                <CardHeader>
                    <CardTitle>Public Profile</CardTitle>
                    <CardDescription>This is how other players see you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center flex-wrap gap-4">
                        <Avatar className="h-20 w-20 border-4 border-primary">
                            <AvatarImage src="https://picsum.photos/seed/myavatar/200/200" />
                            <AvatarFallback>DC</AvatarFallback>
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
                <Button size="lg">Save Changes</Button>
            </div>
        </div>
       </div>
    </div>
  );
}
