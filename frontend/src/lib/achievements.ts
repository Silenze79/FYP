import { Achievement } from '../types';

export const achievements: Achievement[] = [
  {
    id: 'first_quiz',
    name: 'First Steps',
    description: 'Complete your first quiz',
    icon: '🎯',
    requirement: 1,
    category: 'quiz',
  },
  {
    id: 'quiz_master',
    name: 'Quiz Master',
    description: 'Complete 10 quizzes',
    icon: '📚',
    requirement: 10,
    category: 'quiz',
  },
  {
    id: 'quiz_legend',
    name: 'Quiz Legend',
    description: 'Complete 50 quizzes',
    icon: '🏆',
    requirement: 50,
    category: 'quiz',
  },
  {
    id: 'perfect_score',
    name: 'Perfect Score',
    description: 'Get 100% on a quiz',
    icon: '⭐',
    requirement: 1,
    category: 'quiz',
  },
  {
    id: 'streak_starter',
    name: 'Streak Starter',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    requirement: 3,
    category: 'streak',
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '💪',
    requirement: 7,
    category: 'streak',
  },
  {
    id: 'month_champion',
    name: 'Month Champion',
    description: 'Maintain a 30-day streak',
    icon: '👑',
    requirement: 30,
    category: 'streak',
  },
  {
    id: 'point_collector',
    name: 'Point Collector',
    description: 'Earn 1,000 points',
    icon: '💰',
    requirement: 1000,
    category: 'points',
  },
  {
    id: 'point_master',
    name: 'Point Master',
    description: 'Earn 5,000 points',
    icon: '💎',
    requirement: 5000,
    category: 'points',
  },
  {
    id: 'arithmetic_expert',
    name: 'Arithmetic Expert',
    description: 'Reach 90% mastery in Arithmetic',
    icon: '🔢',
    requirement: 90,
    category: 'mastery',
  },
  {
    id: 'algebra_expert',
    name: 'Algebra Expert',
    description: 'Reach 90% mastery in Algebra',
    icon: '📐',
    requirement: 90,
    category: 'mastery',
  },
  {
    id: 'geometry_expert',
    name: 'Geometry Expert',
    description: 'Reach 90% mastery in Geometry',
    icon: '📏',
    requirement: 90,
    category: 'mastery',
  },
  {
    id: 'statistics_expert',
    name: 'Statistics Expert',
    description: 'Reach 90% mastery in Statistics',
    icon: '📊',
    requirement: 90,
    category: 'mastery',
  },
  {
    id: 'genius',
    name: 'Math Genius',
    description: 'Reach 90% mastery in all topics',
    icon: '🧠',
    requirement: 90,
    category: 'mastery',
  },
];

export function checkNewAchievements(
  currentAchievements: string[],
  quizzesTaken: number,
  currentStreak: number,
  totalPoints: number,
  skillLevels: { [key: string]: number }
): Achievement[] {
  const newAchievements: Achievement[] = [];
  
  achievements.forEach(achievement => {
    // Skip if already earned
    if (currentAchievements.includes(achievement.id)) {
      return;
    }
    
    let earned = false;
    
    switch (achievement.category) {
      case 'quiz':
        earned = quizzesTaken >= achievement.requirement;
        break;
      case 'streak':
        earned = currentStreak >= achievement.requirement;
        break;
      case 'points':
        earned = totalPoints >= achievement.requirement;
        break;
      case 'mastery':
        if (achievement.id === 'genius') {
          earned = Object.values(skillLevels).every(level => level >= achievement.requirement);
        } else {
          const topic = achievement.id.replace('_expert', '');
          earned = skillLevels[topic] >= achievement.requirement;
        }
        break;
    }
    
    if (earned) {
      newAchievements.push(achievement);
    }
  });
  
  return newAchievements;
}

export function getAchievementById(id: string): Achievement | undefined {
  return achievements.find(a => a.id === id);
}
