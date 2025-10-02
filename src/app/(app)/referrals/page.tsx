import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Gift, Users } from "lucide-react";

const referralData = [
    { id: '1', name: 'Zola_T', status: 'Completed', reward: 2500 },
    { id: '2', name: 'Musa.sol', status: 'Completed', reward: 2500 },
    { id: '3', name: 'SadeCoin', status: 'Pending', reward: 0 },
    { id: '4', name: 'Abebe_B', status: 'Completed', reward: 2500 },
    { id: '5', name: 'Kofi.eth', status: 'Completed', reward: 2500 },
    { id: '6', name: 'Femi_Crypto', status: 'Pending', reward: 0 },
];

const totalReferralRewards = referralData.reduce((acc, ref) => acc + ref.reward, 0);

export default function ReferralsPage() {
    const referralLink = "https://dreamcoin.game/join?ref=PlayerOne123";

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-6">
        <Users className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Referrals</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <Card className="border-secondary/80">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3"><Gift className="text-secondary"/> Invite Friends, Earn Rewards</CardTitle>
                    <CardDescription>
                        Share your unique link and earn 2,500 DREAM for every friend who joins and makes their first trade.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Input readOnly value={referralLink} className="text-base"/>
                        <Button size="lg" className="text-base w-full sm:w-auto">
                            <Copy className="mr-2 h-4 w-4"/> Copy Link
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Your Referrals</CardTitle>
                    <CardDescription>Track the status of your invites and rewards.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Friend</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Reward</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {referralData.map((referral) => (
                                <TableRow key={referral.id}>
                                    <TableCell className="font-medium">{referral.name}</TableCell>
                                    <TableCell>{referral.status}</TableCell>
                                    <TableCell className="text-right font-mono text-accent">
                                        {referral.reward > 0 ? `${referral.reward.toLocaleString()} DREAM` : '--'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1">
            <Card className="bg-muted/30">
                <CardHeader>
                    <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Invites</span>
                        <span className="font-bold text-lg">{referralData.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Completed</span>
                        <span className="font-bold text-lg text-green-400">{referralData.filter(r => r.status === 'Completed').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Pending</span>
                        <span className="font-bold text-lg text-yellow-400">{referralData.filter(r => r.status === 'Pending').length}</span>
                    </div>
                    <hr className="border-border"/>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Rewards Earned</span>
                        <span className="font-bold text-xl text-accent">{totalReferralRewards.toLocaleString()} DREAM</span>
                    </div>
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}
