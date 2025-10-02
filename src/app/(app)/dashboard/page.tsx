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
        <path d="M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z" fill="hsl(var(--primary))" />
        <text x="50" y="68" fontFamily="Poppins" fontWeight="bold" fontSize="50" fill="hsl(var(--primary-foreground))" textAnchor="middle">A</text>
    </svg>
);


export default function DashboardPage() {
    const topUsers = leaderboardData.slice(0, 3);
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold font-headline mb-6">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-headline">$95,000.25</div>
            <p className="text-xs text-muted-foreground">
              +5.2% from last month
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <Banknote className="h-8 w-8 text-green-500" />
                    <div>
                        <p className="text-sm text-muted-foreground">BNB Balance</p>
                        <p className="font-semibold">12.5 BNB</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <TokenIcon className="h-8 w-8" />
                    <div>
                        <p className="text-sm text-muted-foreground">ATKN Balance</p>
                        <p className="font-semibold">50,000 ATKN</p>
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button asChild size="lg">
                <Link href="/trade">
                    <ArrowRightLeft className="mr-2 h-4 w-4" /> Buy / Sell Tokens
                </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
                 <Link href="/invest">
                    <TrendingUp className="mr-2 h-4 w-4" /> AI Investment Tool
                 </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Trophy className="text-accent"/> Leaderboard Preview</CardTitle>
            <CardDescription>See how you stack up against other tycoons.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topUsers.map((user, index) => (
                <div key={user.id} className="flex items-center gap-4">
                    <div className="text-lg font-bold text-muted-foreground w-4">{user.rank}</div>
                  <Avatar>
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">Total Holdings</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold font-mono">${user.holdings.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                    {index === 0 && <p className="text-xs text-accent">Top Tycoon</p>}
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
