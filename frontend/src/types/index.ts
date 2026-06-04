export interface User {
  id: string;
  username: string;
  email: string;
  role: 'student' | 'admin';
  level: number;
  avatar: string;
  createdAt: Date;
  rank?: string; // e.g., 'bronze', 'silver', 'gold', 'platinum', 'diamond', 'master'
  rankPoints?: number; // Points used for ranking
}

export interface UserProgress {
  userId: string;
  totalPoints: number;
  quizzesTaken: number;
  correctAnswers: number;
  totalQuestions: number;
  currentStreak: number;
  longestStreak: number;
  achievements: string[];
  claimedRewards?: string[]; // IDs of rewards that have been claimed
  skillLevels: {
    arithmetic: number;
    algebra: number;
    geometry: number;
    statistics: number;
  };
}

export interface Question {
  id: string;
  topic: 'arithmetic' | 'algebra' | 'geometry' | 'statistics';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
}

export interface QuizSession {
  id: string;
  userId: string;
  questions: Question[];
  answers: (number | null)[];
  score: number;
  startTime: Date;
  endTime?: Date;
  type: 'practice' | 'competitive';
}

export interface Match {
  id: string;
  player1: User;
  player2: User;
  player1Score: number;
  player2Score: number;
  status: 'waiting' | 'in-progress' | 'completed';
  questions: Question[];
  startTime: Date;
  endTime?: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  category: 'quiz' | 'streak' | 'points' | 'mastery';
}

export interface Reward {
  id: string;
  userId: string;
  achievementId: string;
  earnedAt: Date;
}