import { useState, useEffect } from 'react';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Home } from '../pages/Home';
import { Quiz } from '../pages/Quiz';
import { AITeaching } from '../pages/AITeaching';
import { Matchmaking } from '../pages/Matchmaking';
import { Leaderboard } from '../pages/Leaderboard';
import { Profile } from '../pages/Profile';
import { AdminPanel } from '../pages/AdminPanel';
import { Rewards } from '../pages/Rewards';
import { Settings } from '../pages/Settings';
import { authAPI, userAPI } from '../services/api';
import { authenticateUser, registerUser as localRegisterUser, getUserProgress } from '../services/userService';
import {
  normalizeUser,
  normalizeProgress,
  saveToLocalStorage,
  saveUserProgress,
  claimReward,
} from '../services/progressService';
import { User, UserProgress } from '../types';
import { toast, Toaster } from 'sonner@2.0.3';
import { checkNewAchievements } from '../lib/achievements';
import { getRankByPoints } from '../lib/rankingSystem';

type View = 'home' | 'quiz' | 'ai-teaching' | 'matchmaking' | 'leaderboard' | 'profile' | 'admin' | 'rewards' | 'settings';
type AuthView = 'login' | 'register';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [currentView, setCurrentView] = useState<View>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data, error } = await authAPI.getSession();
      if (data && !error) {
        const user = normalizeUser(data.user, data.progress);
        const progress = normalizeProgress(data.progress, user);
        saveToLocalStorage(user, progress);
        setCurrentUser(user);
        setUserProgress(progress);
        setIsAuthenticated(true);
      }
    } catch (error) {
      // No active session - this is normal for logged out users
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    const { data, error } = await authAPI.signIn(email, password);
    if (data && !error) {
      const user = normalizeUser(data.user, data.progress);
      const progress = normalizeProgress(data.progress, user);
      saveToLocalStorage(user, progress);
      setCurrentUser(user);
      setUserProgress(progress);
      setIsAuthenticated(true);
      toast.success(`Welcome back, ${user.username}!`);
    } else if (error && error.includes('Failed to fetch')) {
      // Fallback to local authentication if API is unavailable
      console.log('🔄 Using local authentication (offline mode)');
      const user = authenticateUser(email, password);
      if (user) {
        const progress = normalizeProgress(getUserProgress(user.id), user);
        const normalized = normalizeUser(user, progress);
        saveToLocalStorage(normalized, progress);
        setCurrentUser(normalized);
        setUserProgress(progress);
        setIsAuthenticated(true);
        toast.success(`Welcome back, ${normalized.username}! (Offline Mode)`);
      } else {
        toast.error('Invalid email or password');
      }
    } else {
      toast.error(error || 'Invalid email or password');
    }
  };

  const handleRegister = async (username: string, email: string, password: string) => {
    const { data, error } = await authAPI.signUp(username, email, password);
    if (data && !error) {
      const user = normalizeUser(data.user, data.progress);
      const progress = normalizeProgress(data.progress, user);
      saveToLocalStorage(user, progress);
      setCurrentUser(user);
      setUserProgress(progress);
      setIsAuthenticated(true);
      toast.success(`Welcome, ${user.username}! Your account has been created.`);
    } else if (error && error.includes('Failed to fetch')) {
      // Fallback to local registration if API is unavailable
      console.log('🔄 Using local registration (offline mode)');
      try {
        const user = localRegisterUser(username, email, password);
        const progress = normalizeProgress(getUserProgress(user.id), user);
        const normalized = normalizeUser(user, progress);
        saveToLocalStorage(normalized, progress);
        setCurrentUser(normalized);
        setUserProgress(progress);
        setIsAuthenticated(true);
        toast.success(`Welcome, ${normalized.username}! (Offline Mode)`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to create account');
      }
    } else {
      toast.error(error || 'Failed to create account');
    }
  };

  const handleLogout = async () => {
    await authAPI.signOut();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUserProgress(null);
    setCurrentView('home');
    toast.success('Logged out successfully');
  };

  const handleViewChange = (view: View) => {
    setCurrentView(view);
  };

  const handleQuizComplete = async (score: number, totalQuestions: number, topicStats?: { [topic: string]: { correct: number; total: number } }) => {
    if (currentUser && userProgress) {
      const newProgress = {
        ...userProgress,
        totalPoints: userProgress.totalPoints + score * 10,
        quizzesTaken: userProgress.quizzesTaken + 1,
        correctAnswers: userProgress.correctAnswers + score,
        totalQuestions: userProgress.totalQuestions + totalQuestions,
      };
      
      // Update skill levels based on topic performance
      if (topicStats) {
        // For each topic, increase skill based on correct answers
        Object.entries(topicStats).forEach(([topic, stats]) => {
          if (stats.total > 0) {
            const topicAccuracy = stats.correct / stats.total;
            // Each correct answer adds 3-5 points based on accuracy
            const skillIncrease = Math.floor(topicAccuracy * 5);
            const currentSkill = userProgress.skillLevels[topic as keyof typeof userProgress.skillLevels] || 0;
            newProgress.skillLevels[topic as keyof typeof newProgress.skillLevels] = Math.min(100, currentSkill + skillIncrease);
          }
        });
      } else {
        // Fallback: Update all skills equally if no topic stats available
        const performanceRate = score / totalQuestions;
        const skillIncrease = Math.floor(performanceRate * 5); // 0-5 points based on performance
        
        newProgress.skillLevels = {
          arithmetic: Math.min(100, userProgress.skillLevels.arithmetic + skillIncrease),
          algebra: Math.min(100, userProgress.skillLevels.algebra + skillIncrease),
          geometry: Math.min(100, userProgress.skillLevels.geometry + skillIncrease),
          statistics: Math.min(100, userProgress.skillLevels.statistics + skillIncrease),
        };
      }
      
      // Check for new achievements
      const newAchievements = checkNewAchievements(
        userProgress.achievements || [],
        newProgress.quizzesTaken,
        newProgress.currentStreak,
        newProgress.totalPoints,
        newProgress.skillLevels
      );
      
      // Add new achievements to progress
      if (newAchievements.length > 0) {
        const updatedAchievements = [...(userProgress.achievements || []), ...newAchievements.map(a => a.id)];
        newProgress.achievements = updatedAchievements;
        
        // Show achievement notifications
        newAchievements.forEach(achievement => {
          toast.success(
            `🎉 Achievement Unlocked: ${achievement.icon} ${achievement.name}!`,
            {
              description: achievement.description,
              duration: 5000,
            }
          );
        });
      }
      
      // Check for perfect score achievement
      const percentage = (score / totalQuestions) * 100;
      if (percentage === 100 && !newProgress.achievements.includes('perfect_score')) {
        if (!newProgress.achievements) {
          newProgress.achievements = [];
        }
        newProgress.achievements.push('perfect_score');
        toast.success(
          `🎉 Achievement Unlocked: ⭐ Perfect Score!`,
          {
            description: 'Get 100% on a quiz',
            duration: 5000,
          }
        );
      }
      
      const { user, progress } = await saveUserProgress(currentUser, newProgress);
      setCurrentUser(user);
      setUserProgress(progress);
    }
  };

  const handleMatchmakingComplete = async (score: number, totalQuestions: number, rankPointsGained: number) => {
    if (currentUser && userProgress) {
      // Update progress like regular quiz
      const newProgress = {
        ...userProgress,
        totalPoints: userProgress.totalPoints + score * 10,
        quizzesTaken: userProgress.quizzesTaken + 1,
        correctAnswers: userProgress.correctAnswers + score,
        totalQuestions: userProgress.totalQuestions + totalQuestions,
      };
      
      // Update user with new rank points
      const newRankPoints = (currentUser.rankPoints || 0) + rankPointsGained;
      const newRank = getRankByPoints(newRankPoints).name.toLowerCase();

      const { user, progress } = await saveUserProgress(currentUser, newProgress, {
        rankPoints: newRankPoints,
        rank: newRank,
      });
      setCurrentUser(user);
      setUserProgress(progress);
      toast.success(`+${rankPointsGained} Rank Points!`);
    }
  };

  // Refresh user data
  const refreshUserData = async () => {
    if (currentUser) {
      const { data } = await userAPI.getUser(currentUser.id);
      if (data) {
        setCurrentUser(data.user);
        setUserProgress(data.progress);
      }
    }
  };

  // Update user progress (for rewards claiming, etc.)
  const handleUpdateProgress = async (progressUpdates: Partial<UserProgress>) => {
    if (currentUser && userProgress) {
      const updatedProgress = { ...userProgress, ...progressUpdates };
      const { user, progress } = await saveUserProgress(currentUser, updatedProgress);
      setCurrentUser(user);
      setUserProgress(progress);
    }
  };

  const handleClaimReward = async (rewardId: string) => {
    if (!currentUser || !userProgress) return;
    try {
      const progress = await claimReward(currentUser, userProgress, rewardId);
      setUserProgress(progress);
      toast.success('Reward saved to your profile!');
    } catch {
      await handleUpdateProgress({
        claimedRewards: [...(userProgress.claimedRewards ?? []), rewardId],
      });
      toast.success('Reward claimed (saved locally)');
    }
  };

  // Update user data (for profile edits, etc.)
  const handleUpdateUser = (updatedUser: User) => {
    console.log('handleUpdateUser called with:', updatedUser);
    setCurrentUser(updatedUser);
    console.log('User state updated successfully');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authView === 'login') {
      return (
        <>
          <Toaster position="top-center" richColors />
          <Login 
            onLogin={handleLogin}
            onSwitchToRegister={() => setAuthView('register')}
          />
        </>
      );
    } else {
      return (
        <>
          <Toaster position="top-center" richColors />
          <Register 
            onRegister={handleRegister}
            onSwitchToLogin={() => setAuthView('login')}
          />
        </>
      );
    }
  }

  if (!currentUser || !userProgress) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        {currentUser.role === 'admin' ? (
          // Admin users see admin panel as home
          <>
            {currentView === 'home' && (
              <AdminPanel 
                onNavigate={handleViewChange}
                onLogout={handleLogout}
              />
            )}
            {currentView === 'profile' && (
              <Profile 
                user={currentUser}
                userProgress={userProgress}
                onBack={() => handleViewChange('home')}
              />
            )}
            {currentView === 'leaderboard' && (
              <Leaderboard 
                currentUser={currentUser}
                onBack={() => handleViewChange('home')}
              />
            )}
            {currentView === 'settings' && (
              <Settings 
                user={currentUser}
                onBack={() => handleViewChange('home')}
                onLogout={handleLogout}
                onUpdateUser={handleUpdateUser}
              />
            )}
          </>
        ) : (
          // Regular users see normal home
          <>
            {currentView === 'home' && (
              <Home 
                user={currentUser} 
                userProgress={userProgress}
                onNavigate={handleViewChange} 
              />
            )}
            {currentView === 'quiz' && (
              <Quiz 
                user={currentUser}
                onBack={() => handleViewChange('home')}
                onComplete={handleQuizComplete}
              />
            )}
            {currentView === 'ai-teaching' && (
              <AITeaching 
                user={currentUser}
                userProgress={userProgress}
                onBack={() => handleViewChange('home')}
              />
            )}
            {currentView === 'matchmaking' && (
              <Matchmaking 
                user={currentUser}
                onBack={() => handleViewChange('home')}
                onComplete={handleMatchmakingComplete}
              />
            )}
            {currentView === 'leaderboard' && (
              <Leaderboard 
                currentUser={currentUser}
                onBack={() => handleViewChange('home')}
              />
            )}
            {currentView === 'profile' && (
              <Profile 
                user={currentUser}
                userProgress={userProgress}
                onBack={() => handleViewChange('home')}
              />
            )}
            {currentView === 'rewards' && (
              <Rewards 
                user={currentUser}
                userProgress={userProgress}
                onBack={() => handleViewChange('home')}
                onClaimReward={handleClaimReward}
              />
            )}
            {currentView === 'settings' && (
              <Settings 
                user={currentUser}
                onBack={() => handleViewChange('home')}
                onLogout={handleLogout}
                onUpdateUser={handleUpdateUser}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}