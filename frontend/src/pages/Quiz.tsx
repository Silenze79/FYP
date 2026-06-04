import { User } from '../types';
import { useQuiz } from '../hooks/useQuiz';
import { getPerformanceEmoji } from '../lib/quiz';
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';

interface QuizProps {
  user: User;
  onBack: () => void;
  onComplete: (score: number, totalQuestions: number) => void;
}

export function Quiz({ user, onBack, onComplete }: QuizProps) {
  // Initialize quiz controller
  const {
    sessionData,
    isLoading,
    error,
    selectAnswer,
    submitAnswer,
    nextQuestion,
    getCurrentQuestion,
    getResult,
    getProgressPercentage,
    canSubmitAnswer,
    getFormattedTime,
  } = useQuiz({
    questionCount: 10,
    timeLimit: 300,
    onComplete,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-gray-900 mb-2">Unable to Load Quiz</h2>
          <p className="text-red-700 mb-6">{error}</p>
          <button
            onClick={onBack}
            className="w-full py-3 bg-red-600 text-white rounded-lg active:scale-95 transition-transform"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // No session data
  if (!sessionData) {
    return null;
  }

  const currentQuestion = getCurrentQuestion();
  const result = getResult();

  // Quiz completion view
  if (sessionData.isComplete && result) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            <div className="text-6xl mb-4">
              {getPerformanceEmoji(result.percentage)}
            </div>
            <h2 className="text-gray-900 mb-4">Quiz Complete!</h2>
            <div className="text-5xl mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {result.score}/{result.totalQuestions}
            </div>
            <p className="text-gray-600 mb-6">{result.percentage}% Correct</p>
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">+{result.pointsEarned} points earned!</p>
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

  // Quiz in progress view
  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 active:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg">
            <Clock className="w-4 h-4" />
            {getFormattedTime()}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-gray-600">
              Question {sessionData.currentQuestionIndex + 1}/{sessionData.questions.length}
            </span>
            <span className="text-gray-600">Score: {sessionData.score}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-5 mb-4">
          {/* Question Meta Info */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs capitalize">
              {currentQuestion.topic}
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs capitalize">
              {currentQuestion.difficulty}
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
              {currentQuestion.points} pts
            </span>
          </div>

          {/* Question Text */}
          <h3 className="text-gray-900 mb-5">{currentQuestion.question}</h3>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = sessionData.selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              const showCorrect = sessionData.showExplanation && isCorrect;
              const showIncorrect = sessionData.showExplanation && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => selectAnswer(index)}
                  disabled={sessionData.showExplanation}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-center justify-between min-h-[60px] active:scale-95 ${
                    showCorrect
                      ? 'border-green-500 bg-green-50'
                      : showIncorrect
                      ? 'border-red-500 bg-red-50'
                      : isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  } ${sessionData.showExplanation ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <span className={showCorrect ? 'text-green-700' : showIncorrect ? 'text-red-700' : 'text-gray-700'}>
                    {option}
                  </span>
                  {showCorrect && <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 ml-2" />}
                  {showIncorrect && <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {sessionData.showExplanation && (
            <div className="mt-5 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-900 text-sm">
                <strong>Explanation:</strong> {currentQuestion.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end">
          {!sessionData.showExplanation ? (
            <button
              onClick={submitAnswer}
              disabled={!canSubmitAnswer()}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg active:scale-95 transition-transform"
            >
              {sessionData.currentQuestionIndex < sessionData.questions.length - 1
                ? 'Next Question'
                : 'Finish Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
