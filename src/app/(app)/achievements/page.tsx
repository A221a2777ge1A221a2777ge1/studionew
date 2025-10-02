import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { achievementsData } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Award, Lock, Diamond, TrendingUp, Trophy, Zap, ShieldCheck } from "lucide-react";
import React from "react";

const iconMap: { [key: string]: React.ComponentType<{className?: string}> } = {
    FirstTrade: Zap,
    DiamondHands: Diamond,
    PaperChaser: TrendingUp,
    PortfolioPro: TrendingUp,
    TopTycoon: Trophy,
};

export default function AchievementsPage() {
  return (
    <div className="container py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex items-center gap-4">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Quests</h1>
        </div>
        <p className="text-muted-foreground mt-2 sm:mt-0 text-lg">
            Complete quests to earn DREAM tokens and level up!
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {achievementsData.map((achievement) => {
            const Icon = iconMap[achievement.icon] || Award;
            const isLocked = achievement.status === 'locked';
            return (
          <Card key={achievement.id} className={cn("flex flex-col border-2 transition-all hover:border-primary/80", isLocked ? "border-muted/50 bg-muted/20 text-muted-foreground" : "border-secondary/80")}>
            <CardHeader className="flex-row gap-4 items-center">
              <div className={cn("p-3 rounded-lg bg-primary/10", isLocked && "bg-gray-500/10")}>
                <Icon className={cn("h-8 w-8 text-primary", isLocked && "text-gray-500")} />
              </div>
              <div>
                <CardTitle className={cn("text-lg font-semibold", isLocked && "text-muted-foreground")}>{achievement.title}</CardTitle>
                <CardDescription className={cn("text-base", isLocked ? "text-muted-foreground/70" : "text-accent")}>Reward: {achievement.reward} DREAM</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between gap-4">
              <p>{achievement.description}</p>
              <div className="h-10">
                {achievement.status === 'unlocked' && (
                  <div className="font-semibold text-primary">COMPLETED</div>
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
                  <div className="flex items-center gap-2 font-semibold">
                    <Lock className="h-5 w-5"/>
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
