import {
  ArrowRightLeft,
  Banknote,
  TrendingUp,
  Trophy,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { leaderboardData } from "@/lib/data";
import { Logo } from "@/components/logo";

export default function DashboardPage() {
    const topUsers = leaderboardData.slice(0, 5);
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-primary/50 shadow-lg shadow-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Wallet</CardTitle>
            <Wallet className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-accent">$95,000.25</div>
            <p className="text-sm text-green-400">
              +5.2% from last month
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <Banknote className="h-8 w-8 text-green-500" />
                    <div>
                        <p className="text-sm text-muted-foreground">BNB Balance</p>
                        <p className="font-semibold text-lg">12.5 BNB</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <Logo className="h-8 w-8" />
                    <div>
                        <p className="text-sm text-muted-foreground">DREAM Balance</p>
                        <p className="font-semibold text-lg">50,000</p>
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button asChild size="lg" className="text-base">
                <Link href="/trade">
                    <ArrowRightLeft className="mr-2 h-4 w-4" /> Buy / Sell
                </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="text-base">
                 <Link href="/invest">
                    <TrendingUp className="mr-2 h-4 w-4" /> AI Oracle
                 </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><Trophy className="text-accent"/> Leaderboard</CardTitle>
            <CardDescription>See how you stack up against other players.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-4">
                    <div className="text-xl font-bold text-muted-foreground w-8 text-center">{user.rank}</div>
                  <Avatar className="h-12 w-12 border-2 border-secondary">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{user.name}</p>
                    <p className="text-sm text-muted-foreground">Total Holdings</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg text-accent">${user.holdings.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                    {user.rank === 1 && <p className="text-xs text-accent font-bold">Top Player</p>}
                  </div>
                </div>
              ))}
            </div>
             <Button variant="outline" asChild className="mt-4 w-full sm:w-auto">
                <Link href="/leaderboard">View full leaderboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
