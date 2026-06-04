import { User, UserProgress } from '../types';
import { ArrowLeft, Award, Zap, Trophy, Target, TrendingUp, Calendar } from 'lucide-react';

interface ProfileProps {
  user: User;
  userProgress: UserProgress;
  onBack: () => void;
}

export function Profile({ user, userProgress, onBack }: ProfileProps) {
  const accuracyRate = userProgress.totalQuestions > 0 
    ? Math.round((userProgress.correctAnswers / userProgress.totalQuestions) * 100) 
    : 0;

  const getNextLevelPoints = (level: number) => {
    return level * 100;
  };

  const pointsToNextLevel = getNextLevelPoints(user.level);
  const levelProgress = (userProgress.totalPoints % pointsToNextLevel) / pointsToNextLevel * 100;

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

        {/* Profile Header */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">{user.avatar}</div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white mb-1 truncate">{user.username}</h1>
              <p className="text-blue-100 text-sm truncate">{user.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="px-3 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <p className="text-blue-100 text-xs">Level</p>
              <p className="text-white">{user.level}</p>
            </div>
            <div className="px-3 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <p className="text-blue-100 text-xs">Points</p>
              <p className="text-white">{userProgress.totalPoints.toLocaleString()}</p>
            </div>
            <div className="px-3 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <p className="text-blue-100 text-xs">Since</p>
              <p className="text-white text-sm">
                {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short' })} '{new Date(user.createdAt).getFullYear().toString().slice(-2)}
              </p>
            </div>
          </div>
          
          {/* Level Progress */}
          <div className="mt-4">
            <div className="flex justify-between mb-2 text-blue-100 text-xs">
              <span>Progress to Level {user.level + 1}</span>
              <span>{Math.round(levelProgress)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 backdrop-blur-sm">
              <div
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Zap className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-gray-600 mb-1 text-xs">Streak</p>
            <p className="text-gray-900">{userProgress.currentStreak} days</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-gray-600 mb-1 text-xs">Best Streak</p>
            <p className="text-gray-900">{userProgress.longestStreak} days</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-gray-600 mb-1 text-xs">Accuracy</p>
            <p className="text-gray-900">{accuracyRate}%</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-gray-600 mb-1 text-xs">Quizzes</p>
            <p className="text-gray-900">{userProgress.quizzesTaken}</p>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
          <h2 className="text-gray-900 mb-4">Performance</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Questions Answered</span>
              <span className="text-gray-900">{userProgress.totalQuestions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Correct Answers</span>
              <span className="text-green-600">{userProgress.correctAnswers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Incorrect Answers</span>
              <span className="text-red-600">
                {userProgress.totalQuestions - userProgress.correctAnswers}
              </span>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Overall Accuracy</span>
                <span className="text-blue-600">{accuracyRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                  style={{ width: `${accuracyRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Skill Mastery */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
          <h2 className="text-gray-900 mb-4">Skill Mastery</h2>
          <div className="space-y-4">
            {Object.entries(userProgress.skillLevels).map(([topic, level]) => (
              <div key={topic}>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 capitalize text-sm">{topic}</span>
                  <span className="text-gray-600 text-sm">{level}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      level >= 80
                        ? 'bg-green-500'
                        : level >= 60
                        ? 'bg-blue-500'
                        : level >= 40
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-5 h-5 text-purple-600" />
            <h2 className="text-gray-900">Achievements</h2>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
              {userProgress.achievements.length}
            </span>
          </div>
          
          {userProgress.achievements.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {userProgress.achievements.map((achievementId) => (
                <div
                  key={achievementId}
                  className="p-3 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-lg text-center"
                >
                  <div className="text-2xl mb-1">🏆</div>
                  <p className="text-gray-700 text-xs capitalize leading-tight">{achievementId.replace(/_/g, ' ')}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Start taking quizzes to earn achievements!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}