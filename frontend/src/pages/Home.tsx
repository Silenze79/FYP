import { User, UserProgress } from '../types';
import { Brain, Trophy, Zap, Users, Award, Settings, ChevronDown, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { getRankByPoints } from '../lib/rankingSystem';
import { RankBadge } from '../components/RankBadge';

interface HomeProps {
  user: User;
  userProgress: UserProgress;
  onNavigate: (view: 'quiz' | 'ai-teaching' | 'matchmaking' | 'leaderboard' | 'profile' | 'admin' | 'rewards' | 'settings') => void;
}

export function Home({ user, userProgress, onNavigate }: HomeProps) {
  const [showMenu, setShowMenu] = useState(false);
  
  const accuracyRate = userProgress.totalQuestions > 0 
    ? Math.round((userProgress.correctAnswers / userProgress.totalQuestions) * 100) 
    : 0;

  const playerRank = getRankByPoints(user.rankPoints || 0);
  
  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-5xl">{user.avatar}</div>
            <div className="flex-1">
              <h1 className="text-gray-900">Hi, {user.username}!</h1>
              <p className="text-gray-600">Level {user.level} • {userProgress.totalPoints} pts</p>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-50 overflow-hidden">
                    <button
                      onClick={() => {
                        onNavigate('profile');
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                    >
                      <UserIcon className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-900">Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('settings');
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors border-t border-gray-100"
                    >
                      <Settings className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-900">Account Settings</span>
                    </button>
                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          onNavigate('admin');
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left flex items-center gap-3 bg-purple-50 hover:bg-purple-100 transition-colors border-t border-gray-100"
                      >
                        <Settings className="w-5 h-5 text-purple-600" />
                        <span className="text-purple-600">Admin Panel</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-gray-600 text-sm">Streak</span>
            </div>
            <div className="text-blue-600">{userProgress.currentStreak} days</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-gray-600 text-sm">Quizzes</span>
            </div>
            <div className="text-green-600">{userProgress.quizzesTaken}</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-gray-600 text-sm">Accuracy</span>
            </div>
            <div className="text-purple-600">{accuracyRate}%</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-gray-600 text-sm">Badges</span>
            </div>
            <div className="text-orange-600">{userProgress.achievements.length}</div>
          </div>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => onNavigate('ai-teaching')}
            className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl p-5 shadow-lg active:scale-95 transition-transform text-left"
          >
            <Brain className="w-8 h-8 mb-2" />
            <h2 className="text-white mb-1 text-lg">AI Teaching</h2>
            <p className="text-blue-100 text-xs">Learn with personalized lessons</p>
          </button>

          <button
            onClick={() => onNavigate('quiz')}
            className="bg-gradient-to-br from-green-500 to-teal-600 text-white rounded-2xl p-5 shadow-lg active:scale-95 transition-transform text-left"
          >
            <Zap className="w-8 h-8 mb-2" />
            <h2 className="text-white mb-1 text-lg">Practice Quiz</h2>
            <p className="text-green-100 text-xs">Test your skills</p>
          </button>

          <button
            onClick={() => onNavigate('matchmaking')}
            className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl p-5 shadow-lg active:scale-95 transition-transform text-left relative overflow-hidden"
          >
            <div className="absolute top-2 right-2">
              <div className="text-2xl">{playerRank.icon}</div>
            </div>
            <Users className="w-8 h-8 mb-2" />
            <h2 className="text-white mb-1 text-lg">Compete</h2>
            <p className="text-orange-100 text-xs">Challenge players • {playerRank.name}</p>
          </button>

          <button
            onClick={() => onNavigate('rewards')}
            className="bg-gradient-to-br from-yellow-500 to-amber-600 text-white rounded-2xl p-5 shadow-lg active:scale-95 transition-transform text-left"
          >
            <Award className="w-8 h-8 mb-2" />
            <h2 className="text-white mb-1 text-lg">Rewards</h2>
            <p className="text-yellow-100 text-xs">View achievements</p>
          </button>
        </div>

        {/* Skill Levels */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="text-gray-900 mb-4">Your Skills</h3>
          <div className="space-y-4">
            {Object.entries(userProgress.skillLevels).map(([topic, level]) => (
              <div key={topic}>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 capitalize text-sm">{topic}</span>
                  <span className="text-gray-600 text-sm">{level}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}