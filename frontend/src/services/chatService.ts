import type { UserProgress } from '../types';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const CHATBOT_BASE = import.meta.env.VITE_CHATBOT_API_URL ?? 'http://localhost:8000';

export async function sendChatMessage(
  message: string,
  conversationHistory: ChatMessage[],
  userProgress?: UserProgress
): Promise<string> {
  const response = await fetch(`${CHATBOT_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      conversation_history: conversationHistory,
      user_progress: userProgress,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail ?? data.error ?? `Chatbot error (${response.status})`);
  }

  if (!data.response) {
    throw new Error('No response from chatbot');
  }

  return data.response;
}
