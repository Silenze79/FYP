import { useState, useEffect, useCallback } from 'react';
import type { Question } from '../types';
import {
  type QuizSessionData,
  type QuizResult,
  createInitialSession,
  calculateResult,
  isAnswerCorrect,
  formatQuizTime,
} from '../lib/quiz';
import { fetchQuizQuestions } from '../services/quizService';

interface UseQuizOptions {
  questionCount: number;
  timeLimit: number;
  onComplete: (
    score: number,
    totalQuestions: number,
    topicStats?: { [topic: string]: { correct: number; total: number } }
  ) => void;
}

export function useQuiz({ questionCount, timeLimit, onComplete }: UseQuizOptions) {
  const [sessionData, setSessionData] = useState<QuizSessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeQuiz = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const questions = await fetchQuizQuestions(questionCount);
      if (questions.length === 0) {
        throw new Error('No questions available for the quiz');
      }

      const initialSession = createInitialSession(questions, timeLimit);
      setSessionData(initialSession);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize quiz';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [questionCount, timeLimit]);

  useEffect(() => {
    initializeQuiz();
  }, [initializeQuiz]);

  const finishQuiz = useCallback(() => {
    if (!sessionData) return;

    setSessionData((prev) => (prev ? { ...prev, isComplete: true } : null));

    const topicStats: { [topic: string]: { correct: number; total: number } } = {};

    sessionData.questions.forEach((question, index) => {
      const topic = question.topic;
      if (!topicStats[topic]) {
        topicStats[topic] = { correct: 0, total: 0 };
      }
      topicStats[topic].total++;

      const userAnswer = sessionData.answers[index];
      if (userAnswer !== null && userAnswer === question.correctAnswer) {
        topicStats[topic].correct++;
      }
    });

    onComplete(sessionData.score, sessionData.questions.length, topicStats);
  }, [sessionData, onComplete]);

  useEffect(() => {
    if (!sessionData || sessionData.isComplete) return;

    if (sessionData.timeLeft > 0) {
      const timer = setTimeout(() => {
        setSessionData((prev) => (prev ? { ...prev, timeLeft: prev.timeLeft - 1 } : null));
      }, 1000);
      return () => clearTimeout(timer);
    }

    finishQuiz();
  }, [sessionData?.timeLeft, sessionData?.isComplete, finishQuiz]);

  const selectAnswer = useCallback(
    (answerIndex: number) => {
      if (!sessionData || sessionData.showExplanation) return;
      setSessionData((prev) => (prev ? { ...prev, selectedAnswer: answerIndex } : null));
    },
    [sessionData]
  );

  const submitAnswer = useCallback(() => {
    if (!sessionData || sessionData.selectedAnswer === null) return;

    const currentQuestion = sessionData.questions[sessionData.currentQuestionIndex];
    const correct = isAnswerCorrect(currentQuestion, sessionData.selectedAnswer);
    const newAnswers = [...sessionData.answers];
    newAnswers[sessionData.currentQuestionIndex] = sessionData.selectedAnswer;

    setSessionData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        answers: newAnswers,
        score: correct ? prev.score + 1 : prev.score,
        showExplanation: true,
      };
    });
  }, [sessionData]);

  const nextQuestion = useCallback(() => {
    if (!sessionData) return;

    if (sessionData.currentQuestionIndex >= sessionData.questions.length - 1) {
      finishQuiz();
      return;
    }

    setSessionData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        selectedAnswer: null,
        showExplanation: false,
      };
    });
  }, [sessionData, finishQuiz]);

  const getCurrentQuestion = useCallback((): Question | null => {
    if (!sessionData) return null;
    return sessionData.questions[sessionData.currentQuestionIndex];
  }, [sessionData]);

  const getResult = useCallback((): QuizResult | null => {
    if (!sessionData || !sessionData.isComplete) return null;
    return calculateResult(sessionData);
  }, [sessionData]);

  const getProgressPercentage = useCallback((): number => {
    if (!sessionData) return 0;
    return ((sessionData.currentQuestionIndex + 1) / sessionData.questions.length) * 100;
  }, [sessionData]);

  const canSubmitAnswer = useCallback(
    (): boolean =>
      Boolean(sessionData && sessionData.selectedAnswer !== null && !sessionData.showExplanation),
    [sessionData]
  );

  const getFormattedTime = useCallback(
    (): string => (sessionData ? formatQuizTime(sessionData.timeLeft) : '0:00'),
    [sessionData]
  );

  return {
    sessionData,
    isLoading,
    error,
    selectAnswer,
    submitAnswer,
    nextQuestion,
    finishQuiz,
    getCurrentQuestion,
    getResult,
    getProgressPercentage,
    canSubmitAnswer,
    getFormattedTime,
  };
}
