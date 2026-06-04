import { useState, useEffect } from 'react';
import { User, UserProgress, Achievement } from '../types';
import { achievements, checkNewAchievements } from '../lib/achievements';
import { ArrowLeft, Award, Lock, CheckCircle } from 'lucide-react';

interface RewardsProps {
  user: User;
  userProgress: UserProgress;
  onBack: () => void;
  onClaimReward?: (rewardId: string) => void | Promise<void>;
}

export function Rewards({ user, userProgress, onBack, onClaimReward }: RewardsProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'quiz' | 'streak' | 'points' | 'mastery'>('all');
  const [earnedAchievements, setEarnedAchievements] = useState<Achievement[]>([]);
  const [lockedAchievements, setLockedAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    categorizeAchievements();
  }, [selectedCategory, userProgress]);

  const categorizeAchievements = () => {
    let filteredAchievements = achievements;
    
    if (selectedCategory !== 'all') {
      filteredAchievements = achievements.filter(a => a.category === selectedCategory);
    }

    const earned = filteredAchievements.filter(a => 
      userProgress.achievements.includes(a.id)
    );
    
    const locked = filteredAchievements.filter(a => 
      !userProgress.achievements.includes(a.id)
    );

    setEarnedAchievements(earned);
    setLockedAchievements(locked);
  };

  const getProgressTowardsAchievement = (achievement: Achievement): number => {
    let current = 0;
    
    switch (achievement.category) {
      case 'quiz':
        current = userProgress.quizzesTaken;
        break;
      case 'streak':
        current = userProgress.currentStreak;
        break;
      case 'points':
        current = userProgress.totalPoints;
        break;
      case 'mastery':
        if (achievement.id === 'genius') {
          current = Math.min(...Object.values(userProgress.skillLevels));
        } else {
          const topic = achievement.id.replace('_expert', '');
          current = userProgress.skillLevels[topic] || 0;
        }
        break;
    }
    
    return Math.min(100, (current / achievement.requirement) * 100);
  };

  const handleClaimAchievement = (achievementId: string) => {
    if (userProgress.claimedRewards?.includes(achievementId)) return;
    if (onClaimReward) {
      void onClaimReward(achievementId);
    }
  };

  const categories = [
    { id: 'all', name: 'All', icon: '🎯' },
    { id: 'quiz', name: 'Quiz', icon: '📚' },
    { id: 'streak', name: 'Streak', icon: '🔥' },
    { id: 'points', name: 'Points', icon: '💰' },
    { id: 'mastery', name: 'Mastery', icon: '🧠' },
  ] as const;

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 active:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <Award className="w-10 h-10" />
            <h1 className="text-white">Achievements</h1>
          </div>
          <p className="text-purple-100 text-sm">Unlock achievements by completing quizzes</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-gray-600 mb-1 text-xs">Unlocked</p>
            <p className="text-green-600 text-sm">
              {userProgress.achievements.length}/{achievements.length}
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-gray-600 mb-1 text-xs">Progress</p>
            <p className="text-blue-600 text-sm">
              {Math.round((userProgress.achievements.length / achievements.length) * 100)}%
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <Lock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-gray-600 mb-1 text-xs">Remaining</p>
            <p className="text-orange-600 text-sm">
              {achievements.length - userProgress.achievements.length}
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Earned Achievements */}
        {earnedAchievements.length > 0 && (
          <div className="mb-6">
            <h2 className="text-gray-900 mb-3">Unlocked</h2>
            <div className="grid grid-cols-1 gap-3">
              {earnedAchievements.map(achievement => (
                <div
                  key={achievement.id}
                  className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl flex-shrink-0">{achievement.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-gray-900 text-sm">{achievement.name}</h3>
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      </div>
                      <p className="text-gray-600 text-xs mb-2">{achievement.description}</p>
                      <div className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs inline-block">
                        Completed ✓
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locked Achievements */}
        {lockedAchievements.length > 0 && (
          <div>
            <h2 className="text-gray-900 mb-3">Locked</h2>
            <div className="grid grid-cols-1 gap-3">
              {lockedAchievements.map(achievement => {
                const progress = getProgressTowardsAchievement(achievement);
                const isComplete = progress >= 100;
                const isClaimed = (userProgress.claimedRewards || []).includes(achievement.id);
                
                return (
                  <div
                    key={achievement.id}
                    className={`rounded-xl p-4 shadow-sm transition-all ${
                      isComplete && !isClaimed
                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 opacity-100 animate-pulse'
                        : isClaimed
                        ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 opacity-100'
                        : 'bg-white border-2 border-gray-200 opacity-75'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`text-3xl flex-shrink-0 ${!isComplete && !isClaimed ? 'grayscale' : ''}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-gray-900 text-sm">{achievement.name}</h3>
                          {!isClaimed && (
                            <Lock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          )}
                          {isClaimed && (
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-gray-600 text-xs mb-3">{achievement.description}</p>
                        
                        {!isClaimed && (
                          <>
                            <div className="mb-3">
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Progress</span>
                                <span className={isComplete ? 'text-green-600 font-bold' : ''}>
                                  {Math.round(progress)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full transition-all duration-500 ${
                                    isComplete
                                      ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                      : 'bg-gradient-to-r from-blue-500 to-purple-600'
                                  }`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                            
                            {isComplete ? (
                              <button
                                onClick={() => handleClaimAchievement(achievement.id)}
                                className="w-full py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg active:scale-95 transition-transform text-sm font-medium"
                              >
                                🎉 Claim Reward!
                              </button>
                            ) : (
                              <div className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs inline-block">
                                Goal: {achievement.requirement}
                              </div>
                            )}
                          </>
                        )}
                        
                        {isClaimed && (
                          <div className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs inline-block">
                            Claimed! ✓
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {earnedAchievements.length === 0 && lockedAchievements.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No achievements in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}