export type User = {
  id: string;
  rank: number;
  name: string;
  avatarUrl: string;
  holdings: number;
};

export const leaderboardData: User[] = [
  { id: '1', rank: 1, name: 'Kofi.eth', avatarUrl: 'https://picsum.photos/seed/avatar1/48/48', holdings: 15000000.75 },
  { id: '2', rank: 2, name: 'Abebe_B', avatarUrl: 'https://picsum.photos/seed/avatar2/48/48', holdings: 12500000.50 },
  { id: '3', rank: 3, name: 'Chike.bnb', avatarUrl: 'https://picsum.photos/seed/avatar3/48/48', holdings: 11000000.00 },
  { id: '4', rank: 4, name: 'You', avatarUrl: 'https://picsum.photos/seed/myavatar/48/48', holdings: 9500000.25 },
  { id: '5', rank: 5, name: 'Zola_T', avatarUrl: 'https://picsum.photos/seed/avatar4/48/48', holdings: 8000000.00 },
  { id: '6', rank: 6, name: 'Musa.sol', avatarUrl: 'https://picsum.photos/seed/avatar5/48/48', holdings: 6500000.00 },
  { id: '7', rank: 7, name: 'Femi_Crypto', avatarUrl: 'https://picsum.photos/seed/avatar6/48/48', holdings: 6200000.00 },
  { id: '8', rank: 8, name: 'SadeCoin', avatarUrl: 'https://picsum.photos/seed/avatar7/48/48', holdings: 5800000.00 },
];

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'locked' | 'unlocked' | 'in_progress';
  progress?: number;
  reward: number;
};

export const achievementsData: Achievement[] = [
    { id: '1', title: 'First Trade', description: 'Make your first token trade.', icon: 'FirstTrade', status: 'unlocked', reward: 50 },
    { id: '2', title: 'Iron Grip', description: 'Hold any amount of DREAM for 30 consecutive days.', icon: 'IronGrip', status: 'in_progress', progress: 45, reward: 1000 },
    { id: '3', title: 'Diamond Hands', description: 'Hold any amount of DREAM for 90 consecutive days.', icon: 'DiamondHands', status: 'locked', reward: 5000 },
    { id: '4', title: 'Unshakeable', description: 'Hold any amount of DREAM for a full year.', icon: 'Unshakeable', status: 'locked', reward: 25000 },
    { id: '5', title: 'Portfolio Pro', description: 'Grow your portfolio value to $100,000.', icon: 'PortfolioPro', status: 'in_progress', progress: 95, reward: 10000 },
    { id: '6', title: 'Millionaire\'s Club', description: 'Achieve a portfolio value of $1,000,000.', icon: 'Millionaire', status: 'locked', reward: 100000 },
    { id: '7', title: 'Coin Hoarder', description: 'Accumulate 1,000,000 DREAM tokens.', icon: 'CoinHoarder', status: 'locked', reward: 50000 },
    { id: '8', title: 'Top Player', description: 'Reach the top 10 on the leaderboard.', icon: 'TopTycoon', status: 'unlocked', reward: 1200 },
];
