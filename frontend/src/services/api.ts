import { projectId, publicAnonKey } from '../lib/supabase/info';
import { User, UserProgress, Question } from '../types';  

/** Java backend (local): http://localhost:8081/make-server-769bc21d */
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  `https://${projectId}.supabase.co/functions/v1/make-server-769bc21d`;

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Store access token in memory
let accessToken: string | null = null;
let useLocalFallback = false; // Flag to use local data when API is unavailable

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // If we're in fallback mode and it's not a critical endpoint, skip API call
  if (useLocalFallback && shouldUseFallback(endpoint)) {
    return { error: 'Using local data' };
  }

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    // Use access token if available, otherwise use anon key
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    } else {
      headers['Authorization'] = `Bearer ${publicAnonKey}`;
    }

    console.log(`Making API request to: ${endpoint}`);

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    console.log(`Response status for ${endpoint}:`, response.status);

    // Try to parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      return { error: 'Invalid server response' };
    }

    console.log(`Response data for ${endpoint}:`, data);

    if (!response.ok) {
      // Don't log session check, signout, user profile, progress, or questions failures as errors
      if (endpoint !== '/auth/session' && 
          endpoint !== '/auth/signout' && 
          !endpoint.startsWith('/user/') && 
          !endpoint.startsWith('/progress/') &&
          !endpoint.startsWith('/questions')) {
        console.error(`API error for ${endpoint}:`, data.error);
      }
      return { error: data.error || 'Request failed' };
    }

    return { data };
  } catch (error) {
    // Network error - enable fallback mode for non-critical operations
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.log('⚠️ API unavailable, using local fallback mode');
      useLocalFallback = true;
    }
    
    // Don't log session check, progress, or questions failures as errors - they're expected
    if (endpoint !== '/auth/session' && 
        !endpoint.startsWith('/progress/') &&
        !endpoint.startsWith('/questions')) {
      console.error(`API error for ${endpoint}:`, error);
    }
    return { error: error instanceof Error ? error.message : 'Network error' };
  }
}

// Helper to determine if endpoint should use fallback
function shouldUseFallback(endpoint: string): boolean {
  // Don't use fallback for these critical operations
  const criticalEndpoints = ['/auth/signup', '/auth/signin'];
  return !criticalEndpoints.some(critical => endpoint.startsWith(critical));
}

// AUTH API
export const authAPI = {
  async signUp(username: string, email: string, password: string) {
    const response = await fetchAPI<{
      user: User;
      progress: UserProgress;
      accessToken: string;
    }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });

    if (response.data?.accessToken) {
      setAccessToken(response.data.accessToken);
    }

    return response;
  },

  async signIn(email: string, password: string) {
    const response = await fetchAPI<{
      user: User;
      progress: UserProgress;
      accessToken: string;
    }>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data?.accessToken) {
      setAccessToken(response.data.accessToken);
    }

    return response;
  },

  async getSession() {
    return fetchAPI<{
      user: User;
      progress: UserProgress;
    }>('/auth/session');
  },

  async signOut() {
    try {
      const response = await fetchAPI<{ success: boolean }>('/auth/signout', {
        method: 'POST',
      });
      setAccessToken(null);
      // Always return success for signout, even if server call fails
      return { data: { success: true } };
    } catch (error) {
      // Always succeed on signout - just clear the token
      setAccessToken(null);
      return { data: { success: true } };
    }
  },
};

// USER API
export const userAPI = {
  async getUser(userId: string) {
    return fetchAPI<{
      user: User;
      progress: UserProgress;
    }>(`/user/${userId}`);
  },

  async updateUser(userId: string, updates: Partial<User>) {
    return fetchAPI<{ user: User }>(`/user/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteUser(userId: string) {
    return fetchAPI<{ success: boolean }>(`/user/${userId}`, {
      method: 'DELETE',
    });
  },

  async updateProgress(userId: string, progress: Partial<UserProgress>) {
    return fetchAPI<{ progress: UserProgress }>(`/progress/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(progress),
    });
  },

  async getLeaderboard() {
    return fetchAPI<{
      leaderboard: Array<{ user: User; progress: UserProgress }>;
    }>('/leaderboard');
  },
};

// QUESTION API
export const questionAPI = {
  async getQuestions() {
    return fetchAPI<{ questions: Question[] }>('/questions');
  },

  async addQuestion(question: Omit<Question, 'id'>) {
    return fetchAPI<{ question: Question }>('/questions', {
      method: 'POST',
      body: JSON.stringify(question),
    });
  },

  async updateQuestion(questionId: string, updates: Partial<Question>) {
    return fetchAPI<{ question: Question }>(`/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteQuestion(questionId: string) {
    return fetchAPI<{ success: boolean }>(`/questions/${questionId}`, {
      method: 'DELETE',
    });
  },
};

// ADMIN API
export const adminAPI = {
  async getAllUsers() {
    return fetchAPI<{
      users: Array<{ user: User; progress: UserProgress | null }>;
    }>('/admin/users');
  },
};

// REWARD API
export const rewardAPI = {
  async getRewards() {
    return fetchAPI<{
      rewards: Array<{
        id: string;
        name: string;
        description: string;
        icon: string;
        pointsRequired: number;
        category: string;
      }>;
    }>('/rewards');
  },

  async addReward(reward: any) {
    return fetchAPI<{ reward: any }>('/rewards', {
      method: 'POST',
      body: JSON.stringify(reward),
    });
  },

  async updateReward(rewardId: string, updates: any) {
    return fetchAPI<{ reward: any }>(`/rewards/${rewardId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteReward(rewardId: string) {
    return fetchAPI<{ success: boolean }>(`/rewards/${rewardId}`, {
      method: 'DELETE',
    });
  },
};