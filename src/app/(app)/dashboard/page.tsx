import {
  ArrowRightLeft,
  Banknote,
  DollarSign,
  TrendingUp,
  Trophy,
  User,
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

const TokenIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 5 L95 40 L80 95 L20 95 L5 40 Z" fill="hsl(var(--primary))" />
        <text x="50" y="68" fontFamily='"Press Start 2P"' fontWeight="bold" fontSize="50" fill="hsl(var(--primary-foreground))" textAnchor="middle">D</text>
    </svg>
);


export default function DashboardPage() {
    const topUsers = leaderboardData.slice(0, 3);
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold font-headline mb-6">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-primary shadow-lg shadow-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-headline">Wallet</CardTitle>
            <Wallet className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold font-headline text-accent">$95,000.25</div>
            <p className="text-sm text-green-400 font-body">
              +5.2% from last month
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <Banknote className="h-8 w-8 text-green-500" />
                    <div>
                        <p className="text-sm text-muted-foreground font-body">BNB Balance</p>
                        <p className="font-semibold font-body text-lg">12.5 BNB</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <TokenIcon className="h-8 w-8" />
                    <div>
                        <p className="text-sm text-muted-foreground font-body">DREAM Balance</p>
                        <p className="font-semibold font-body text-lg">50,000 DREAM</p>
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-headline">Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button asChild size="lg" className="font-body text-base">
                <Link href="/trade">
                    <ArrowRightLeft className="mr-2 h-4 w-4" /> Buy / Sell Tokens
                </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="font-body text-base">
                 <Link href="/invest">
                    <TrendingUp className="mr-2 h-4 w-4" /> AI Oracle
                 </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2 text-lg"><Trophy className="text-accent"/> Leaderboard</CardTitle>
            <CardDescription className="font-body text-base">See how you stack up against other players.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topUsers.map((user, index) => (
                <div key={user.id} className="flex items-center gap-4">
                    <div className="text-xl font-bold font-headline text-muted-foreground w-6 text-center">{user.rank}</div>
                  <Avatar className="h-12 w-12 border-2 border-secondary">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold font-body text-lg">{user.name}</p>
                    <p className="text-sm text-muted-foreground font-body">Total Holdings</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold font-body text-lg text-accent">${user.holdings.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                    {index === 0 && <p className="text-xs text-accent font-headline">Top Player</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
