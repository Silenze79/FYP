import type { Question } from '../types';
import { getRandomQuestions } from '../data/questionBank';
import { questionAPI } from './api';

export async function fetchQuizQuestions(count: number): Promise<Question[]> {
  try {
    const response = await questionAPI.getQuestions();

    if (!response.error && response.data?.questions?.length) {
      const shuffled = [...response.data.questions].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(count, shuffled.length));
    }
  } catch {
    // Use local question bank when API is unavailable
  }

  return getRandomQuestions(count);
}
