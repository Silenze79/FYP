import type { Question } from '../types';

export interface QuizSessionData {
  questions: Question[];
  answers: (number | null)[];
  score: number;
  currentQuestionIndex: number;
  selectedAnswer: number | null;
  showExplanation: boolean;
  isComplete: boolean;
  timeLeft: number;
  startTime: Date;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  pointsEarned: number;
  timeSpent: number;
  answers: (number | null)[];
}

export function createInitialSession(questions: Question[], timeLimit = 300): QuizSessionData {
  return {
    questions,
    answers: new Array(questions.length).fill(null),
    score: 0,
    currentQuestionIndex: 0,
    selectedAnswer: null,
    showExplanation: false,
    isComplete: false,
    timeLeft: timeLimit,
    startTime: new Date(),
  };
}

export function calculateResult(sessionData: QuizSessionData): QuizResult {
  const { score, questions, answers, startTime } = sessionData;
  const totalQuestions = questions.length;
  const percentage = Math.round((score / totalQuestions) * 100);
  const pointsEarned = score * 10;
  const timeSpent = Math.floor((Date.now() - startTime.getTime()) / 1000);

  return {
    score,
    totalQuestions,
    percentage,
    pointsEarned,
    timeSpent,
    answers,
  };
}

export function isAnswerCorrect(question: Question, answerIndex: number): boolean {
  return answerIndex === question.correctAnswer;
}

export function formatQuizTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getPerformanceEmoji(percentage: number): string {
  if (percentage >= 90) return '🏆';
  if (percentage >= 70) return '🎉';
  if (percentage >= 50) return '👍';
  return '📚';
}
