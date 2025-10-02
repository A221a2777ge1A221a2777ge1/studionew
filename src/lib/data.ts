export type User = {
  id: string;
  rank: number;
  name: string;
  avatarUrl: string;
  holdings: number;
};

export const leaderboardData: User[] = [
  { id: '1', rank: 1, name: 'Kofi.eth', avatarUrl: 'https://picsum.photos/seed/avatar1/48/48', holdings: 150000.75 },
  { id: '2', rank: 2, name: 'Abebe_B', avatarUrl: 'https://picsum.photos/seed/avatar2/48/48', holdings: 125000.50 },
  { id: '3', rank: 3, name: 'Chike.bnb', avatarUrl: 'https://picsum.photos/seed/avatar3/48/48', holdings: 110000.00 },
  { id: '4', rank: 4, name: 'You', avatarUrl: 'https://picsum.photos/seed/myavatar/48/48', holdings: 95000.25 },
  { id: '5', rank: 5, name: 'Zola_T', avatarUrl: 'https://picsum.photos/seed/avatar4/48/48', holdings: 80000.00 },
  { id: '6', rank: 6, name: 'Musa.sol', avatarUrl: 'https://picsum.photos/seed/avatar5/48/48', holdings: 65000.00 },
  { id: '7', rank: 7, name: 'Femi_Crypto', avatarUrl: 'https://picsum.photos/seed/avatar6/48/48', holdings: 62000.00 },
  { id: '8', rank: 8, name: 'SadeCoin', avatarUrl: 'https://picsum.photos/seed/avatar7/48/48', holdings: 58000.00 },
];

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string; // Will map to a component later
  status: 'locked' | 'unlocked' | 'in_progress';
  progress?: number;
  reward: number;
};

export const achievementsData: Achievement[] = [
    { id: '1', title: 'First Trade', description: 'Make your first token trade.', icon: 'FirstTrade', status: 'unlocked', reward: 50 },
    { id: '2', title: 'Diamond Hands', description: 'Hold a token for 7 days straight.', icon: 'DiamondHands', status: 'in_progress', progress: 66, reward: 100 },
    { id: '3', title: 'Paper Chaser', description: 'Execute 10 trades in a single day.', icon: 'PaperChaser', status: 'locked', reward: 150 },
    { id: '4', title: 'Portfolio Pro', description: 'Grow your portfolio by 25%.', icon: 'PortfolioPro', status: 'in_progress', progress: 80, reward: 200 },
    { id: '5', title: 'Top Tycoon', description: 'Reach the top 10 on the leaderboard.', icon: 'TopTycoon', status: 'locked', reward: 500 },
    { id: '6', title: 'Market Guru', description: 'Use the AI investment tool 5 times.', icon: 'MarketGuru', status: 'unlocked', reward: 75 },
];
