import { User, UserProgress } from '../types';

// Mock user data - in a real app, this would come from a database
const mockUsers: User[] = [
  {
    id: '1',
    username: 'MathWhiz',
    email: 'mathwhiz@example.com',
    role: 'student',
    level: 15,
    avatar: '🎓',
    createdAt: new Date('2024-01-15'),
    rankPoints: 2450,
  },
  {
    id: '2',
    username: 'NumberNinja',
    email: 'numberninja@example.com',
    role: 'student',
    level: 12,
    avatar: '🥷',
    createdAt: new Date('2024-02-01'),
    rankPoints: 1850,
  },
  {
    id: '3',
    username: 'AlgebraAce',
    email: 'algebraace@example.com',
    role: 'student',
    level: 18,
    avatar: '🏆',
    createdAt: new Date('2024-01-20'),
    rankPoints: 3200,
  },
  // Bronze level opponents (0-99 points)
  {
    id: '4',
    username: 'MathBeginner',
    email: 'beginner1@example.com',
    role: 'student',
    level: 2,
    avatar: '🌱',
    createdAt: new Date('2024-03-10'),
    rankPoints: 25,
  },
  {
    id: '5',
    username: 'NumberNewbie',
    email: 'newbie1@example.com',
    role: 'student',
    level: 3,
    avatar: '🐣',
    createdAt: new Date('2024-03-15'),
    rankPoints: 45,
  },
  {
    id: '6',
    username: 'CalcStarter',
    email: 'starter1@example.com',
    role: 'student',
    level: 4,
    avatar: '🔰',
    createdAt: new Date('2024-03-20'),
    rankPoints: 70,
  },
  // Silver level opponents (100-299 points)
  {
    id: '7',
    username: 'MathLearner',
    email: 'learner1@example.com',
    role: 'student',
    level: 6,
    avatar: '📚',
    createdAt: new Date('2024-02-25'),
    rankPoints: 150,
  },
  {
    id: '8',
    username: 'QuizSeeker',
    email: 'seeker1@example.com',
    role: 'student',
    level: 7,
    avatar: '🔍',
    createdAt: new Date('2024-02-28'),
    rankPoints: 220,
  },
  {
    id: '9',
    username: 'NumberPro',
    email: 'pro1@example.com',
    role: 'student',
    level: 8,
    avatar: '⚡',
    createdAt: new Date('2024-03-05'),
    rankPoints: 280,
  },
  // Gold level opponents (300-599 points)
  {
    id: '10',
    username: 'MathChamp',
    email: 'champ1@example.com',
    role: 'student',
    level: 10,
    avatar: '🎯',
    createdAt: new Date('2024-02-10'),
    rankPoints: 350,
  },
  {
    id: '11',
    username: 'QuizMaster',
    email: 'master1@example.com',
    role: 'student',
    level: 11,
    avatar: '🎮',
    createdAt: new Date('2024-02-15'),
    rankPoints: 480,
  },
  {
    id: '12',
    username: 'CalcExpert',
    email: 'expert1@example.com',
    role: 'student',
    level: 12,
    avatar: '🧠',
    createdAt: new Date('2024-02-18'),
    rankPoints: 550,
  },
  // Platinum level opponents (600-999 points)
  {
    id: '13',
    username: 'MathGuru',
    email: 'guru1@example.com',
    role: 'student',
    level: 14,
    avatar: '🧙',
    createdAt: new Date('2024-01-25'),
    rankPoints: 750,
  },
  {
    id: '14',
    username: 'NumberLegend',
    email: 'legend1@example.com',
    role: 'student',
    level: 15,
    avatar: '🦸',
    createdAt: new Date('2024-01-28'),
    rankPoints: 920,
  },
  {
    id: 'admin1',
    username: 'Admin',
    email: 'admin@example.com',
    role: 'admin',
    level: 99,
    avatar: '👨‍💼',
    createdAt: new Date('2023-12-01'),
    rankPoints: 5000,
  },
];

// Mock passwords (in a real app, these would be hashed)
const mockPasswords: { [email: string]: string } = {
  'mathwhiz@example.com': 'password123',
  'numberninja@example.com': 'password123',
  'algebraace@example.com': 'password123',
  'admin@example.com': 'admin123',
};

const mockProgress: { [userId: string]: UserProgress } = {
  '1': {
    userId: '1',
    totalPoints: 2450,
    quizzesTaken: 28,
    correctAnswers: 215,
    totalQuestions: 280,
    currentStreak: 7,
    longestStreak: 12,
    achievements: ['first_quiz', 'quiz_master', 'perfect_score', 'week_warrior'],
    skillLevels: {
      arithmetic: 85,
      algebra: 72,
      geometry: 68,
      statistics: 55,
    },
  },
  '2': {
    userId: '2',
    totalPoints: 1850,
    quizzesTaken: 21,
    correctAnswers: 165,
    totalQuestions: 210,
    currentStreak: 4,
    longestStreak: 8,
    achievements: ['first_quiz', 'streak_starter'],
    skillLevels: {
      arithmetic: 78,
      algebra: 65,
      geometry: 70,
      statistics: 60,
    },
  },
  '3': {
    userId: '3',
    totalPoints: 3200,
    quizzesTaken: 35,
    correctAnswers: 295,
    totalQuestions: 350,
    currentStreak: 15,
    longestStreak: 15,
    achievements: ['first_quiz', 'quiz_master', 'perfect_score', 'week_warrior', 'month_champion', 'genius'],
    skillLevels: {
      arithmetic: 92,
      algebra: 88,
      geometry: 85,
      statistics: 80,
    },
  },
  'admin1': {
    userId: 'admin1',
    totalPoints: 9999,
    quizzesTaken: 100,
    correctAnswers: 980,
    totalQuestions: 1000,
    currentStreak: 50,
    longestStreak: 50,
    achievements: [],
    skillLevels: {
      arithmetic: 100,
      algebra: 100,
      geometry: 100,
      statistics: 100,
    },
  },
};

export function authenticateUser(email: string, password: string): User | null {
  const user = mockUsers.find(u => u.email === email);
  if (user && mockPasswords[email] === password) {
    return user;
  }
  return null;
}

export function registerUser(username: string, email: string, password: string): User {
  // Check if email already exists
  const existingUser = mockUsers.find(u => u.email === email);
  if (existingUser) {
    throw new Error('Email already exists');
  }

  // Create new user
  const newUser: User = {
    id: `user_${Date.now()}`,
    username,
    email,
    role: 'student',
    level: 1,
    avatar: getRandomAvatar(),
    createdAt: new Date(),
    rankPoints: 0,
  };

  // Add to mock database
  mockUsers.push(newUser);
  mockPasswords[email] = password;

  // Initialize progress
  mockProgress[newUser.id] = {
    userId: newUser.id,
    totalPoints: 0,
    quizzesTaken: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    currentStreak: 0,
    longestStreak: 0,
    achievements: [],
    skillLevels: {
      arithmetic: 0,
      algebra: 0,
      geometry: 0,
      statistics: 0,
    },
  };

  return newUser;
}

function getRandomAvatar(): string {
  const avatars = ['🎓', '📚', '✏️', '🧮', '🎯', '🚀', '⭐', '🏆', '💡', '🔢'];
  return avatars[Math.floor(Math.random() * avatars.length)];
}

export function getCurrentUser(): User {
  // In a real app, this would get the authenticated user
  return mockUsers[0];
}

export function getUserProgress(userId: string): UserProgress {
  return mockProgress[userId] || {
    userId,
    totalPoints: 0,
    quizzesTaken: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    currentStreak: 0,
    longestStreak: 0,
    achievements: [],
    skillLevels: {
      arithmetic: 0,
      algebra: 0,
      geometry: 0,
      statistics: 0,
    },
  };
}

export function getAllUsers(): User[] {
  return mockUsers;
}

export function getAllProgress(): { [userId: string]: UserProgress } {
  return mockProgress;
}

export function updateUser(userId: string, updates: Partial<User>): User | null {
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  if (userIndex === -1) return null;
  
  // Update the user with new data
  mockUsers[userIndex] = {
    ...mockUsers[userIndex],
    ...updates,
  };
  
  return mockUsers[userIndex];
}

export function deleteUser(userId: string): boolean {
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  if (userIndex === -1) return false;
  
  // Get user email before removing
  const userEmail = mockUsers[userIndex].email;
  
  // Remove user from array
  mockUsers.splice(userIndex, 1);
  
  // Remove user's progress
  delete mockProgress[userId];
  
  // Remove user's password
  if (userEmail) {
    delete mockPasswords[userEmail];
  }
  
  return true;
}