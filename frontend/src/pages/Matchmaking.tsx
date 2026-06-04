import { useState, useEffect } from 'react';
import { User, Question } from '../types';
import { getRandomQuestions } from '../data/questionBank';
import { getAllUsers } from '../services/userService';
import { ArrowLeft, Users, Zap, Trophy, Clock, TrendingUp } from 'lucide-react';
import { getRankByPoints, getProgressInRank, getPointsToNextRank, getNextRank, calculateRankPointsGained } from '../lib/rankingSystem';
import { RankBadge } from '../components/RankBadge';

interface MatchmakingProps {
  user: User;
  onBack: () => void;
  onComplete: (score: number, totalQuestions: number, rankPointsGained: number) => void;
}

type MatchStatus = 'searching' | 'found' | 'playing' | 'finished';

export function Matchmaking({ user, onBack, onComplete }: MatchmakingProps) {
  const [status, setStatus] = useState<MatchStatus>('searching');
  const [opponent, setOpponent] = useState<User | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes for competitive mode
  const [rankPointsGained, setRankPointsGained] = useState(0);
  const [showRankUp, setShowRankUp] = useState(false);
  const [opponentAnsweredCorrect, setOpponentAnsweredCorrect] = useState<boolean | null>(null);

  // Get current rank info
  const playerRankPoints = user.rankPoints || 0;
  const playerRank = getRankByPoints(playerRankPoints);
  const playerRankProgress = getProgressInRank(playerRankPoints);
  const pointsToNext = getPointsToNextRank(playerRankPoints);
  const nextRank = getNextRank(playerRankPoints);

  useEffect(() => {
    // Simulate matchmaking - match with opponents based on player's rank
    if (status === 'searching') {
      const timer = setTimeout(() => {
        const allUsers = getAllUsers().filter(u => u.id !== user.id && u.role === 'student');
        const playerRankPoints = user.rankPoints || 0;
        const playerRank = getRankByPoints(playerRankPoints);
        
        // Define opponent range based on player's rank
        let eligibleOpponents = [];
        
        if (playerRank.name === 'Bronze') {
          // Bronze faces low-level opponents only (Bronze and Silver)
          eligibleOpponents = allUsers.filter(u => {
            const opponentRankPoints = u.rankPoints || 0;
            const opponentRank = getRankByPoints(opponentRankPoints);
            return opponentRank.name === 'Bronze' || opponentRank.name === 'Silver';
          });
        } else if (playerRank.name === 'Silver') {
          // Silver faces slightly higher level opponents (Silver, Gold, and some Bronze)
          eligibleOpponents = allUsers.filter(u => {
            const opponentRankPoints = u.rankPoints || 0;
            const opponentRank = getRankByPoints(opponentRankPoints);
            return opponentRank.name === 'Bronze' || opponentRank.name === 'Silver' || opponentRank.name === 'Gold';
          });
        } else if (playerRank.name === 'Gold') {
          // Gold faces the highest level opponents (Gold, Platinum, Diamond)
          eligibleOpponents = allUsers.filter(u => {
            const opponentRankPoints = u.rankPoints || 0;
            const opponentRank = getRankByPoints(opponentRankPoints);
            return opponentRank.name === 'Gold' || opponentRank.name === 'Platinum' || opponentRank.name === 'Diamond';
          });
        } else {
          // Platinum, Diamond, Master - face same rank or higher
          eligibleOpponents = allUsers.filter(u => {
            const opponentRankPoints = u.rankPoints || 0;
            return opponentRankPoints >= playerRankPoints - 100; // Within 100 points below or any above
          });
        }
        
        // If no eligible opponents found, use any opponent as fallback
        if (eligibleOpponents.length === 0) {
          eligibleOpponents = allUsers;
        }
        
        const randomOpponent = eligibleOpponents[Math.floor(Math.random() * eligibleOpponents.length)];
        setOpponent(randomOpponent);
        setStatus('found');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, user.id, user.rankPoints]);

  useEffect(() => {
    if (status === 'found') {
      const timer = setTimeout(() => {
        const matchQuestions = getRandomQuestions(5);
        setQuestions(matchQuestions);
        setStatus('playing');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  useEffect(() => {
    // Timer countdown during play
    if (status === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && status === 'playing') {
      finishMatch();
    }
  }, [timeLeft, status]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (!showExplanation) {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isPlayerCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    if (isPlayerCorrect) {
      setPlayerScore(playerScore + 1);
    }

    // Simulate opponent answer based on their rank (tougher opponents at higher ranks)
    const opponentRank = opponent ? getRankByPoints(opponent.rankPoints || 0) : playerRank;
    const opponentCorrect = Math.random() < opponentRank.opponentAccuracy;
    
    if (opponentCorrect) {
      setOpponentScore(opponentScore + 1);
    }

    setOpponentAnsweredCorrect(opponentCorrect);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      finishMatch();
    }
  };

  const finishMatch = () => {
    setStatus('finished');
    
    // Calculate rank points gained based on win/loss/tie
    const won = playerScore > opponentScore;
    const tied = playerScore === opponentScore;
    const opponentRankPoints = opponent?.rankPoints || 0;
    const gainedPoints = calculateRankPointsGained(won, opponentRankPoints, playerRankPoints, tied);
    
    setRankPointsGained(gainedPoints);
    onComplete(playerScore, questions.length, gainedPoints);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (status === 'searching') {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 active:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Cancel
          </button>

          {/* Player Rank Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <RankBadge rank={playerRank} size="medium" showLabel={false} />
                <div>
                  <h3 className="text-gray-900 text-lg">Your Rank</h3>
                  <p className="text-gray-600 text-sm">{playerRank.name} - {playerRank.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-900 text-lg">{playerRankPoints}</p>
                <p className="text-gray-500 text-xs">Rank Points</p>
              </div>
            </div>
            
            {/* Progress to next rank */}
            {nextRank && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{playerRank.name}</span>
                  <span>{pointsToNext} pts to {nextRank.name}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-gradient-to-r ${playerRank.gradient} h-2 rounded-full transition-all`}
                    style={{ width: `${playerRankProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-gray-900 mb-4">Finding Opponent...</h2>
            <p className="text-gray-600 text-sm">Matching you with a player of similar rank</p>
            <p className="text-gray-500 text-xs mt-2">Higher ranks face tougher opponents!</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'found' && opponent) {
    const opponentRank = getRankByPoints(opponent.rankPoints || 0);
    
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h2 className="text-gray-900 mb-8">Match Found!</h2>
            
            <div className="flex items-start justify-center gap-8 mb-8">
              {/* Player */}
              <div className="text-center flex-1">
                <RankBadge rank={playerRank} size="large" showLabel={true} showProgress={false} />
                <div className="text-4xl my-3">{user.avatar}</div>
                <p className="text-gray-900">{user.username}</p>
                <p className="text-gray-600 text-xs mt-1">Level {user.level}</p>
                <div className="mt-2">
                  <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs inline-block">
                    Rank: {playerRankPoints} pts
                  </div>
                  <div className="mt-1 text-2xl text-gray-900">0</div>
                  <p className="text-gray-500 text-xs">Match Score</p>
                </div>
              </div>

              {/* VS */}
              <div className="flex items-center justify-center pt-8">
                <div className="text-4xl text-orange-500">
                  <Zap className="w-12 h-12" />
                </div>
              </div>

              {/* Opponent */}
              <div className="text-center flex-1">
                <RankBadge rank={opponentRank} size="large" showLabel={true} showProgress={false} />
                <div className="text-4xl my-3">{opponent.avatar}</div>
                <p className="text-gray-900">{opponent.username}</p>
                <p className="text-gray-600 text-xs mt-1">Level {opponent.level}</p>
                <div className="mt-2">
                  <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs inline-block">
                    Rank: {opponent.rankPoints || 0} pts
                  </div>
                  <div className="mt-1 text-2xl text-gray-900">0</div>
                  <p className="text-gray-500 text-xs">Match Score</p>
                </div>
              </div>
            </div>

            {/* Difficulty Warning */}
            <div className={`mb-4 p-3 rounded-lg ${
              opponentRank.opponentAccuracy >= 0.7 
                ? 'bg-red-50 border-2 border-red-200' 
                : 'bg-yellow-50 border-2 border-yellow-200'
            }`}>
              <p className={`text-sm ${
                opponentRank.opponentAccuracy >= 0.7 ? 'text-red-800' : 'text-yellow-800'
              }`}>
                {opponentRank.opponentAccuracy >= 0.7 ? '⚠️ Tough Opponent!' : '💪 Moderate Challenge!'}
                {' '}Opponent accuracy: {Math.round(opponentRank.opponentAccuracy * 100)}%
              </p>
            </div>

            <p className="text-gray-600 mb-4 text-sm">Starting match...</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'finished' && opponent) {
    const won = playerScore > opponentScore;
    const tied = playerScore === opponentScore;
    const opponentRank = getRankByPoints(opponent.rankPoints || 0);
    
    // Calculate new rank points after the match
    const rankPointsGainedInMatch = calculateRankPointsGained(won, opponent.rankPoints || 0, playerRankPoints, tied);
    const newRankPoints = playerRankPoints + rankPointsGainedInMatch;
    const newPointsToNext = getPointsToNextRank(newRankPoints);
    const newNextRank = getNextRank(newRankPoints);

    return (
      <div className="min-h-screen p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">
              {won ? '🏆' : tied ? '🤝' : '😊'}
            </div>
            <h2 className="text-gray-900 mb-6">
              {won ? 'Victory!' : tied ? "It's a Tie!" : 'Good Game!'}
            </h2>

            <div className="flex items-start justify-center gap-8 mb-6">
              {/* Player */}
              <div className="text-center">
                <RankBadge rank={playerRank} size="medium" showLabel={false} />
                <div className="text-4xl my-2">{user.avatar}</div>
                <p className="text-gray-900 text-sm">{user.username}</p>
                <div className={`text-3xl mt-2 ${won ? 'text-green-600' : 'text-gray-600'}`}>
                  {playerScore}
                </div>
              </div>

              {/* VS */}
              <div className="flex items-center justify-center pt-12">
                <div className="text-xl text-gray-400">VS</div>
              </div>

              {/* Opponent */}
              <div className="text-center">
                <RankBadge rank={opponentRank} size="medium" showLabel={false} />
                <div className="text-4xl my-2">{opponent.avatar}</div>
                <p className="text-gray-900 text-sm">{opponent.username}</p>
                <div className={`text-3xl mt-2 ${!won && !tied ? 'text-green-600' : 'text-gray-600'}`}>
                  {opponentScore}
                </div>
              </div>
            </div>

            {/* Rank Points Display - Show for wins, losses, and ties */}
            <div className={`mb-6 p-4 rounded-lg border-2 ${
              won 
                ? 'bg-green-50 border-green-200' 
                : tied
                ? 'bg-gray-50 border-gray-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <p className={
                won 
                  ? 'text-green-800' 
                  : tied
                  ? 'text-gray-800'
                  : 'text-red-800'
              }>
                <TrendingUp className={`w-4 h-4 inline-block mr-1 ${!won && !tied ? 'rotate-180' : ''}`} />
                <strong>{rankPointsGainedInMatch > 0 ? '+' : ''}{rankPointsGainedInMatch} Rank Points{rankPointsGainedInMatch === 0 ? ' (Draw)' : '!'}</strong>
              </p>
              <p className={`text-xs mt-1 ${
                won 
                  ? 'text-green-700' 
                  : tied
                  ? 'text-gray-700'
                  : 'text-red-700'
              }`}>
                {tied 
                  ? 'No points gained or lost in a draw'
                  : newPointsToNext > 0 
                  ? `${newPointsToNext} more points to reach ${newNextRank?.name}` 
                  : 'Maximum rank achieved!'}
              </p>
            </div>

            <button
              onClick={onBack}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg active:scale-95 transition-transform"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'playing' && questions.length > 0 && opponent) {
    const currentQuestion = questions[currentQuestionIndex];

    return (
      <div className="min-h-screen p-4 pb-20">
        <div className="max-w-2xl mx-auto">
          {/* Match Header */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 flex-1">
                <div className="text-xl">{user.avatar}</div>
                <div className="min-w-0">
                  <p className="text-gray-900 text-sm truncate">{user.username}</p>
                  <p className="text-green-600 text-xs">Score: {playerScore}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-lg">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{formatTime(timeLeft)}</span>
              </div>

              <div className="flex items-center gap-2 flex-1 justify-end">
                <div className="min-w-0 text-right">
                  <p className="text-gray-900 text-sm truncate">{opponent.username}</p>
                  <p className="text-green-600 text-xs">Score: {opponentScore}</p>
                </div>
                <div className="text-xl">{opponent.avatar}</div>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-2xl shadow-xl p-5">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                Q {currentQuestionIndex + 1}/{questions.length}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs capitalize">
                {currentQuestion.difficulty}
              </span>
            </div>

            <h3 className="text-gray-900 mb-5">{currentQuestion.question}</h3>

            <div className="space-y-3 mb-5">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correctAnswer;
                const showCorrect = showExplanation && isCorrect;
                const showIncorrect = showExplanation && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showExplanation}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left min-h-[60px] active:scale-95 ${
                      showCorrect
                        ? 'border-green-500 bg-green-50'
                        : showIncorrect
                        ? 'border-red-500 bg-red-50'
                        : isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <span className="text-sm">{option}</span>
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <>
                <div className="p-4 bg-blue-50 rounded-lg mb-4">
                  <p className="text-blue-900 text-sm">
                    <strong>Explanation:</strong> {currentQuestion.explanation}
                  </p>
                </div>

                {/* Opponent Result */}
                {opponentAnsweredCorrect !== null && (
                  <div className={`p-3 rounded-lg mb-4 ${opponentAnsweredCorrect ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                    <p className={`text-sm ${opponentAnsweredCorrect ? 'text-red-800' : 'text-green-800'}`}>
                      {opponent?.avatar} <strong>{opponent?.username}</strong>: {opponentAnsweredCorrect ? '✓ Correct!' : '✗ Incorrect'}
                    </p>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-end">
              {!showExplanation ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg active:scale-95 transition-transform"
                >
                  {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Match'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}