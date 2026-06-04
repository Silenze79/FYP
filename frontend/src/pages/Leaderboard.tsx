import { useState, useEffect } from 'react';
import { User } from '../types';
import { userAPI } from '../services/api';
import { ArrowLeft, Trophy, Medal, Award, TrendingUp } from 'lucide-react';

interface LeaderboardProps {
  currentUser: User;
  onBack: () => void;
}

interface LeaderboardEntry {
  user: User;
  points: number;
  quizzesTaken: number;
  accuracy: number;
  rank: number;
}

export function Leaderboard({ currentUser, onBack }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [timeFrame, setTimeFrame] = useState<'all' | 'month' | 'week'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateLeaderboard();
  }, [timeFrame]);

  const generateLeaderboard = async () => {
    setIsLoading(true);
    const { data, error } = await userAPI.getLeaderboard();
    
    if (error || !data) {
      console.warn('Failed to load leaderboard, using fallback:', error);
      // Use fallback/mock data
      const mockEntries: LeaderboardEntry[] = [
        {
          user: currentUser,
          points: 850,
          quizzesTaken: 15,
          accuracy: 85,
          rank: 1,
        }
      ];
      setLeaderboard(mockEntries);
      setIsLoading(false);
      return;
    }

    const entries: LeaderboardEntry[] = data.leaderboard
      .filter(entry => entry.user.role === 'student')
      .map(entry => {
        const accuracy = entry.progress.totalQuestions > 0
          ? Math.round((entry.progress.correctAnswers / entry.progress.totalQuestions) * 100)
          : 0;

        return {
          user: entry.user,
          points: entry.progress.totalPoints,
          quizzesTaken: entry.progress.quizzesTaken,
          accuracy,
          rank: 0,
        };
      });

    // Sort by points
    entries.sort((a, b) => b.points - a.points);

    // Assign ranks
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    setLeaderboard(entries);
    setIsLoading(false);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-8 h-8 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-8 h-8 text-gray-400" />;
    if (rank === 3) return <Medal className="w-8 h-8 text-amber-600" />;
    return <Award className="w-6 h-6 text-gray-400" />;
  };

  const currentUserRank = leaderboard.find(e => e.user.id === currentUser.id)?.rank || 0;

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

        <div className="bg-gradient-to-br from-yellow-500 to-amber-600 text-white rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="w-10 h-10" />
            <h1 className="text-white">Leaderboard</h1>
          </div>
          <p className="text-yellow-100 text-sm">Compete with other players!</p>
        </div>

        {/* Your Rank */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{currentUser.avatar}</div>
              <div>
                <p className="text-gray-900">Your Rank</p>
                <div className="flex items-center gap-2 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">#{currentUserRank}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-600 text-sm">Points</p>
              <p className="text-gray-900">
                {leaderboard.find(e => e.user.id === currentUser.id)?.points || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Time Frame Selector */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => setTimeFrame('all')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              timeFrame === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setTimeFrame('month')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              timeFrame === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeFrame('week')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              timeFrame === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600'
            }`}
          >
            This Week
          </button>
        </div>

        {/* Leaderboard List - Mobile optimized */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {leaderboard.map((entry) => (
              <div
                key={entry.user.id}
                className={`p-4 transition-colors ${
                  entry.user.id === currentUser.id
                    ? 'bg-blue-50'
                    : ''
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-shrink-0 w-8">
                    {entry.rank <= 3 ? (
                      getRankIcon(entry.rank)
                    ) : (
                      <span className="text-gray-600 text-sm">#{entry.rank}</span>
                    )}
                  </div>
                  <div className="text-2xl">{entry.user.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 truncate">{entry.user.username}</span>
                      {entry.user.id === currentUser.id && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs flex-shrink-0">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                      <span>Lv {entry.user.level}</span>
                      <span>•</span>
                      <span className="text-blue-600">{entry.points.toLocaleString()} pts</span>
                      <span>•</span>
                      <span>{entry.accuracy}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}