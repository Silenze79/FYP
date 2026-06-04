import type { StoredUserState, User, UserProgress } from '../types';
import { getRankByPoints } from '../lib/rankingSystem';
import { userAPI } from './api';
import { getUserProgress, updateUserProgress as updateLocalProgress, updateUser as updateLocalUser } from './userService';

const STORAGE_PREFIX = 'mathgame_state_';

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

export function normalizeProgress(progress: UserProgress, user?: User): UserProgress {
  const rankPoints = progress.rankPoints ?? user?.rankPoints ?? 0;
  const tier = getRankByPoints(rankPoints);

  return {
    ...progress,
    userId: progress.userId,
    achievements: progress.achievements ?? [],
    claimedRewards:
      progress.claimedRewards ??
      progress.rewardsObtained ??
      [],
    rewardsObtained:
      progress.rewardsObtained ??
      progress.claimedRewards ??
      [],
    skillLevels: progress.skillLevels ?? {
      arithmetic: 0,
      algebra: 0,
      geometry: 0,
      statistics: 0,
    },
    rankPoints,
    currentRank: progress.currentRank ?? tier.name.toLowerCase(),
  };
}

export function normalizeUser(user: User, progress?: UserProgress): User {
  const rankPoints = user.rankPoints ?? progress?.rankPoints ?? 0;
  const tier = getRankByPoints(rankPoints);

  return {
    ...user,
    rankPoints,
    rank: user.rank ?? tier.name.toLowerCase(),
  };
}

export function saveToLocalStorage(user: User, progress: UserProgress): void {
  const state: StoredUserState = {
    user: normalizeUser(user, progress),
    progress: normalizeProgress(progress, user),
    savedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(storageKey(user.id), JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save progress to localStorage', e);
  }
}

export function loadFromLocalStorage(userId: string): StoredUserState | null {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredUserState;
    return {
      ...parsed,
      user: normalizeUser(parsed.user, parsed.progress),
      progress: normalizeProgress(parsed.progress, parsed.user),
    };
  } catch {
    return null;
  }
}

export function clearLocalStorage(userId: string): void {
  localStorage.removeItem(storageKey(userId));
}

/**
 * Persist progress (and optional user fields like rank) to API + localStorage.
 */
export async function saveUserProgress(
  user: User,
  progress: UserProgress,
  userUpdates?: Partial<User>
): Promise<{ user: User; progress: UserProgress }> {
  const mergedUser = normalizeUser({ ...user, ...userUpdates }, progress);
  const mergedProgress = normalizeProgress(
    {
      ...progress,
      userId: user.id,
      rankPoints: mergedUser.rankPoints,
      currentRank: getRankByPoints(mergedUser.rankPoints ?? 0).name.toLowerCase(),
    },
    mergedUser
  );

  saveToLocalStorage(mergedUser, mergedProgress);
  updateLocalProgress(user.id, mergedProgress);
  if (userUpdates && Object.keys(userUpdates).length > 0) {
    updateLocalUser(user.id, userUpdates);
  }

  const { data, error } = await userAPI.updateProgress(user.id, {
    ...mergedProgress,
    rankPoints: mergedUser.rankPoints,
    rewardsObtained: mergedProgress.rewardsObtained ?? mergedProgress.claimedRewards,
    claimedRewards: mergedProgress.claimedRewards,
  });

  if (!error && data?.progress) {
    const fromApi = normalizeProgress(data.progress as UserProgress, mergedUser);
    saveToLocalStorage(mergedUser, fromApi);
    return { user: mergedUser, progress: fromApi };
  }

  await userAPI.updateUser(user.id, {
    rankPoints: mergedUser.rankPoints,
    rank: mergedUser.rank,
  });

  return { user: mergedUser, progress: mergedProgress };
}

/**
 * Claim an earned achievement reward and persist claimedRewards.
 */
export async function claimReward(
  user: User,
  progress: UserProgress,
  rewardId: string
): Promise<UserProgress> {
  const claimedRewards = [...(progress.claimedRewards ?? [])];
  if (!claimedRewards.includes(rewardId)) {
    claimedRewards.push(rewardId);
  }

  const { data, error } = await userAPI.claimReward(user.id, rewardId);

  const nextProgress = normalizeProgress(
    error || !data?.progress
      ? { ...progress, claimedRewards }
      : (data.progress as UserProgress),
    user
  );

  await saveUserProgress(user, nextProgress);
  return nextProgress;
}

export function loadOfflineProgress(userId: string): UserProgress {
  const stored = loadFromLocalStorage(userId);
  if (stored) return stored.progress;
  return normalizeProgress(getUserProgress(userId));
}
