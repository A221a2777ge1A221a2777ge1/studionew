import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { achievementsData } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Award, Lock, Diamond, Bot, TrendingUp, Trophy, Zap } from "lucide-react";
import React from "react";

const iconMap: { [key: string]: React.ComponentType<{className?: string}> } = {
    FirstTrade: Zap,
    DiamondHands: Diamond,
    PaperChaser: TrendingUp,
    PortfolioPro: TrendingUp,
    TopTycoon: Trophy,
    MarketGuru: Bot,
};

export default function AchievementsPage() {
  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-6">
        <Award className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold font-headline">Achievements</h1>
      </div>
      <p className="text-muted-foreground mb-8">
        Earn rewards and prove your skills by completing challenges.
      </p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {achievementsData.map((achievement) => {
            const Icon = iconMap[achievement.icon] || Award;
            const isLocked = achievement.status === 'locked';
            return (
          <Card key={achievement.id} className={cn("flex flex-col", isLocked && "bg-muted/50 text-muted-foreground")}>
            <CardHeader className="flex-row gap-4 items-center">
              <div className={cn("p-3 rounded-lg bg-primary/10", isLocked && "bg-gray-500/10")}>
                <Icon className={cn("h-8 w-8 text-primary", isLocked && "text-gray-500")} />
              </div>
              <div>
                <CardTitle className={cn("font-headline", isLocked && "text-muted-foreground")}>{achievement.title}</CardTitle>
                <CardDescription className={cn(isLocked && "text-muted-foreground/70")}>Reward: {achievement.reward} ATKN</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between gap-4">
              <p className="text-sm">{achievement.description}</p>
              <div>
                {achievement.status === 'unlocked' && (
                  <div className="text-sm font-semibold text-primary">Completed</div>
                )}
                {achievement.status === 'in_progress' && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold">In Progress</span>
                        <span>{achievement.progress}%</span>
                    </div>
                    <Progress value={achievement.progress} className="h-2" />
                  </div>
                )}
                {achievement.status === 'locked' && (
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Lock className="h-4 w-4"/>
                    Locked
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )})}
      </div>
    </div>
  );
}
