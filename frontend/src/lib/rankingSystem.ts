export interface RankTier {
  name: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  gradient: string;
  icon: string;
  opponentAccuracy: number; // Percentage of correct answers for AI opponent
  description: string;
}

export const RANK_TIERS: RankTier[] = [
  {
    name: 'Bronze',
    minPoints: 0,
    maxPoints: 99,
    color: '#CD7F32',
    gradient: 'from-amber-700 to-amber-900',
    icon: '🥉',
    opponentAccuracy: 0.4,
    description: 'Beginner level - Learning the basics'
  },
  {
    name: 'Silver',
    minPoints: 100,
    maxPoints: 299,
    color: '#C0C0C0',
    gradient: 'from-gray-400 to-gray-600',
    icon: '🥈',
    opponentAccuracy: 0.5,
    description: 'Intermediate level - Building confidence'
  },
  {
    name: 'Gold',
    minPoints: 300,
    maxPoints: 599,
    color: '#FFD700',
    gradient: 'from-yellow-400 to-yellow-600',
    icon: '🥇',
    opponentAccuracy: 0.6,
    description: 'Advanced level - Mastering concepts'
  },
  {
    name: 'Platinum',
    minPoints: 600,
    maxPoints: 999,
    color: '#E5E4E2',
    gradient: 'from-cyan-400 to-cyan-600',
    icon: '💎',
    opponentAccuracy: 0.7,
    description: 'Expert level - Exceptional skills'
  },
  {
    name: 'Diamond',
    minPoints: 1000,
    maxPoints: 1999,
    color: '#B9F2FF',
    gradient: 'from-blue-400 to-blue-600',
    icon: '💠',
    opponentAccuracy: 0.8,
    description: 'Elite level - Among the best'
  },
  {
    name: 'Master',
    minPoints: 2000,
    maxPoints: 999999,
    color: '#9370DB',
    gradient: 'from-purple-500 to-purple-700',
    icon: '👑',
    opponentAccuracy: 0.9,
    description: 'Master level - The ultimate achievement'
  }
];

export function getRankByPoints(points: number): RankTier {
  for (const rank of RANK_TIERS) {
    if (points >= rank.minPoints && points <= rank.maxPoints) {
      return rank;
    }
  }
  return RANK_TIERS[0]; // Default to Bronze
}

export function getProgressInRank(points: number): number {
  const rank = getRankByPoints(points);
  const rangeSize = rank.maxPoints - rank.minPoints;
  const progressInRange = points - rank.minPoints;
  return Math.min(100, Math.round((progressInRange / rangeSize) * 100));
}

export function getPointsToNextRank(points: number): number {
  const rank = getRankByPoints(points);
  const rankIndex = RANK_TIERS.findIndex(r => r.name === rank.name);
  
  if (rankIndex === RANK_TIERS.length - 1) {
    return 0; // Already at max rank
  }
  
  const nextRank = RANK_TIERS[rankIndex + 1];
  return nextRank.minPoints - points;
}

export function getNextRank(points: number): RankTier | null {
  const rank = getRankByPoints(points);
  const rankIndex = RANK_TIERS.findIndex(r => r.name === rank.name);
  
  if (rankIndex === RANK_TIERS.length - 1) {
    return null; // Already at max rank
  }
  
  return RANK_TIERS[rankIndex + 1];
}

export function calculateRankPointsGained(won: boolean, opponentRankPoints: number, playerRankPoints: number, tied: boolean = false): number {
  // Draw: 0 points (no change)
  if (tied) {
    return 0;
  }
  
  // Loss: -25 points, but don't go below 0
  if (!won) {
    // If player has less than 25 points, only deduct what they have
    if (playerRankPoints < 25) {
      return -playerRankPoints; // This will bring them to exactly 0
    }
    return -25;
  }
  
  // Win: +50 points
  return 50;
}