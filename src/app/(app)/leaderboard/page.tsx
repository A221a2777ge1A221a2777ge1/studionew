import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { leaderboardData } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Crown, Trophy } from "lucide-react";

export default function LeaderboardPage() {
  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-6">
        <Trophy className="h-8 w-8 text-accent" />
        <h1 className="text-3xl font-bold font-headline">Leaderboard</h1>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Top Tycoons</CardTitle>
            <CardDescription>The richest players in the African Tycoon ecosystem. Your rank is highlighted.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Holdings (USD)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData.map((user) => (
                <TableRow key={user.id} className={cn(user.name === 'You' && 'bg-primary/10')}>
                  <TableCell className="font-bold text-lg">
                    <div className="flex items-center gap-2">
                        {user.rank}
                        {user.rank === 1 && <Crown className="h-5 w-5 text-accent" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-base">
                    ${user.holdings.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
