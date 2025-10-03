"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { emitMCPEvent } from "@/lib/mcp-pattern";
import { 
  Trophy, 
  Star, 
  Coins, 
  Target, 
  Zap, 
  Crown,
  Medal,
  Award,
  Gift,
  Lock,
  CheckCircle,
  Clock
} from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'trading' | 'portfolio' | 'social' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  reward: {
    type: 'tokens' | 'xp' | 'badge';
    amount: number;
  };
  progress: {
    current: number;
    target: number;
  };
  unlocked: boolean;
  unlockedAt?: number;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_trade',
    title: 'First Steps',
    description: 'Complete your first trade',
    icon: 'Zap',
    category: 'trading',
    rarity: 'common',
    reward: { type: 'tokens', amount: 100 },
    progress: { current: 1, target: 1 },
    unlocked: true,
    unlockedAt: Date.now() - 86400000,
  },
  {
    id: 'trader_10',
    title: 'Active Trader',
    description: 'Complete 10 trades',
    icon: 'Target',
    category: 'trading',
    rarity: 'common',
    reward: { type: 'tokens', amount: 500 },
    progress: { current: 7, target: 10 },
    unlocked: false,
  },
  {
    id: 'trader_100',
    title: 'Trading Master',
    description: 'Complete 100 trades',
    icon: 'Trophy',
    category: 'trading',
    rarity: 'rare',
    reward: { type: 'tokens', amount: 2000 },
    progress: { current: 7, target: 100 },
    unlocked: false,
  },
  {
    id: 'portfolio_10k',
    title: 'Portfolio Builder',
    description: 'Reach $10,000 portfolio value',
    icon: 'Coins',
    category: 'portfolio',
    rarity: 'common',
    reward: { type: 'tokens', amount: 1000 },
    progress: { current: 6500, target: 10000 },
    unlocked: false,
  },
  {
    id: 'portfolio_100k',
    title: 'Crypto Tycoon',
    description: 'Reach $100,000 portfolio value',
    icon: 'Crown',
    category: 'portfolio',
    rarity: 'epic',
    reward: { type: 'tokens', amount: 10000 },
    progress: { current: 6500, target: 100000 },
    unlocked: false,
  },
  {
    id: 'level_10',
    title: 'Rising Star',
    description: 'Reach level 10',
    icon: 'Star',
    category: 'special',
    rarity: 'common',
    reward: { type: 'xp', amount: 500 },
    progress: { current: 5, target: 10 },
    unlocked: false,
  },
  {
    id: 'level_25',
    title: 'Elite Trader',
    description: 'Reach level 25',
    icon: 'Medal',
    category: 'special',
    rarity: 'rare',
    reward: { type: 'xp', amount: 2000 },
    progress: { current: 5, target: 25 },
    unlocked: false,
  },
  {
    id: 'ai_strategy',
    title: 'AI Strategist',
    description: 'Use AI investment strategy 5 times',
    icon: 'Award',
    category: 'special',
    rarity: 'rare',
    reward: { type: 'tokens', amount: 1500 },
    progress: { current: 2, target: 5 },
    unlocked: false,
  },
  {
    id: 'daily_trader',
    title: 'Daily Trader',
    description: 'Trade for 7 consecutive days',
    icon: 'Clock',
    category: 'trading',
    rarity: 'common',
    reward: { type: 'tokens', amount: 750 },
    progress: { current: 3, target: 7 },
    unlocked: false,
  },
  {
    id: 'legendary_trader',
    title: 'Legendary Trader',
    description: 'Complete 1000 trades',
    icon: 'Crown',
    category: 'trading',
    rarity: 'legendary',
    reward: { type: 'tokens', amount: 50000 },
    progress: { current: 7, target: 1000 },
    unlocked: false,
  },
];

const getIconComponent = (iconName: string) => {
  const icons: { [key: string]: any } = {
    Zap,
    Target,
    Trophy,
    Coins,
    Crown,
    Star,
    Medal,
    Award,
    Clock,
  };
  return icons[iconName] || Trophy;
};

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'text-gray-500';
    case 'rare': return 'text-blue-500';
    case 'epic': return 'text-purple-500';
    case 'legendary': return 'text-yellow-500';
    default: return 'text-gray-500';
  }
};

const getRarityBadgeVariant = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'secondary';
    case 'rare': return 'default';
    case 'epic': return 'default';
    case 'legendary': return 'default';
    default: return 'secondary';
  }
};

export default function AchievementsPage() {
  const { userProfile } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [totalRewards, setTotalRewards] = useState(0);
  const [unlockedCount, setUnlockedCount] = useState(0);

  useEffect(() => {
    calculateStats();
  }, [achievements]);

  const calculateStats = () => {
    const unlocked = achievements.filter(a => a.unlocked);
    const totalRewardAmount = unlocked.reduce((sum, a) => sum + a.reward.amount, 0);
    
    setUnlockedCount(unlocked.length);
    setTotalRewards(totalRewardAmount);
  };

  const claimReward = async (achievementId: string) => {
    try {
      // Mock reward claiming
      const achievement = achievements.find(a => a.id === achievementId);
      if (!achievement || !achievement.unlocked) return;

      await emitMCPEvent('achievement_reward_claimed', {
        userId: userProfile?.uid,
        achievementId,
        reward: achievement.reward,
      });

      // Show success message (in real app, this would be a toast)
      console.log(`Claimed ${achievement.reward.amount} ${achievement.reward.type} for ${achievement.title}`);
      
    } catch (error) {
      console.error('Error claiming reward:', error);
    }
  };

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const categories = [
    { id: 'all', label: 'All', count: achievements.length },
    { id: 'trading', label: 'Trading', count: achievements.filter(a => a.category === 'trading').length },
    { id: 'portfolio', label: 'Portfolio', count: achievements.filter(a => a.category === 'portfolio').length },
    { id: 'special', label: 'Special', count: achievements.filter(a => a.category === 'special').length },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gradient">
            Achievements
          </h2>
          <p className="text-muted-foreground">
            Unlock rewards and showcase your trading prowess
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="badge-glow">
            <Trophy className="w-4 h-4 mr-1" />
            {unlockedCount}/{achievements.length} Unlocked
          </Badge>
          <Badge variant="secondary" className="badge-glow">
            <Coins className="w-4 h-4 mr-1" />
            {totalRewards.toLocaleString()} Tokens Earned
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="tribal-pattern">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unlocked Achievements</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{unlockedCount}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((unlockedCount / achievements.length) * 100)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card className="tribal-pattern">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <Gift className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{totalRewards.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Tokens earned from achievements
            </p>
          </CardContent>
        </Card>

        <Card className="tribal-pattern">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Achievement</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {achievements.filter(a => !a.unlocked)[0]?.title || 'All Complete!'}
            </div>
            <p className="text-xs text-muted-foreground">
              {achievements.filter(a => !a.unlocked)[0]?.description || 'Congratulations!'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.label} ({category.count})
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAchievements.map((achievement) => {
                const IconComponent = getIconComponent(achievement.icon);
                const progressPercentage = (achievement.progress.current / achievement.progress.target) * 100;
                
                return (
                  <Card 
                    key={achievement.id} 
                    className={`tribal-pattern transition-all duration-300 ${
                      achievement.unlocked 
                        ? 'ring-2 ring-accent/50 shadow-lg shadow-accent/20' 
                        : 'opacity-75'
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-full ${
                          achievement.unlocked ? 'bg-accent/20' : 'bg-muted/50'
                        }`}>
                          <IconComponent className={`w-6 h-6 ${
                            achievement.unlocked ? 'text-accent' : 'text-muted-foreground'
                          }`} />
                        </div>
                        <Badge variant={getRarityBadgeVariant(achievement.rarity)}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{achievement.title}</CardTitle>
                      <CardDescription>{achievement.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">
                            {achievement.progress.current}/{achievement.progress.target}
                          </span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Coins className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">
                            {achievement.reward.amount} {achievement.reward.type}
                          </span>
                        </div>
                        {achievement.unlocked ? (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => claimReward(achievement.id)}
                            >
                              Claim
                            </Button>
                          </div>
                        ) : (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>

                      {achievement.unlockedAt && (
                        <p className="text-xs text-muted-foreground">
                          Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Card className="tribal-pattern">
        <CardHeader>
          <CardTitle>Achievement Tips</CardTitle>
          <CardDescription>
            How to unlock more achievements and earn rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center">
                <Target className="w-4 h-4 mr-2 text-primary" />
                Trading Achievements
              </h4>
              <p className="text-sm text-muted-foreground">
                Complete trades regularly to unlock trading-related achievements and earn token rewards.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center">
                <Coins className="w-4 h-4 mr-2 text-accent" />
                Portfolio Growth
              </h4>
              <p className="text-sm text-muted-foreground">
                Build your portfolio value to unlock portfolio achievements and showcase your success.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center">
                <Star className="w-4 h-4 mr-2 text-secondary" />
                Special Milestones
              </h4>
              <p className="text-sm text-muted-foreground">
                Use AI strategies, maintain streaks, and reach level milestones for special rewards.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}