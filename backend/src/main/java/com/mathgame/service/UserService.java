package com.mathgame.service;

import com.mathgame.dto.UserDto;
import com.mathgame.dto.UserProgressDto;
import com.mathgame.entity.RewardObtainEntity;
import com.mathgame.entity.UserEntity;
import com.mathgame.entity.UserProgressEntity;
import com.mathgame.mapper.EntityMapper;
import com.mathgame.repository.RewardObtainRepository;
import com.mathgame.repository.UserProgressRepository;
import com.mathgame.repository.UserRepository;
import com.mathgame.util.RankUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserProgressRepository progressRepository;
    private final RewardObtainRepository rewardObtainRepository;

    public UserService(
            UserRepository userRepository,
            UserProgressRepository progressRepository,
            RewardObtainRepository rewardObtainRepository) {
        this.userRepository = userRepository;
        this.progressRepository = progressRepository;
        this.rewardObtainRepository = rewardObtainRepository;
    }

    public Map<String, Object> getUserProfile(String userId) {
        UserEntity user = requireUser(userId);
        UserProgressEntity progress = requireProgress(userId);
        List<String> rewardsObtained = loadRewardsObtained(userId);

        return Map.of(
                "user", EntityMapper.toUserDto(user),
                "progress", EntityMapper.toProgressDto(progress, user, rewardsObtained)
        );
    }

    public Map<String, Object> getProgress(String userId) {
        UserEntity user = requireUser(userId);
        UserProgressEntity progress = requireProgress(userId);
        List<String> rewardsObtained = loadRewardsObtained(userId);
        return Map.of("progress", EntityMapper.toProgressDto(progress, user, rewardsObtained));
    }

    public List<String> loadRewardsObtained(String userId) {
        return rewardObtainRepository.findByUserIdOrderByObtainedAtDesc(userId).stream()
                .map(RewardObtainEntity::getRewardId)
                .toList();
    }

    @Transactional
    public UserDto updateUser(String userId, Map<String, Object> updates) {
        UserEntity user = requireUser(userId);

        if (updates.containsKey("username")) {
            user.setUsername((String) updates.get("username"));
        }
        if (updates.containsKey("email")) {
            user.setEmail((String) updates.get("email"));
        }
        if (updates.containsKey("avatar")) {
            user.setAvatar((String) updates.get("avatar"));
        }
        if (updates.containsKey("level")) {
            user.setLevel(((Number) updates.get("level")).intValue());
        }
        if (updates.containsKey("rankPoints")) {
            user.setRankPoints(((Number) updates.get("rankPoints")).intValue());
            syncRankTier(user);
        }
        if (updates.containsKey("rank")) {
            user.setRank((String) updates.get("rank"));
        }

        return EntityMapper.toUserDto(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found");
        }
        rewardObtainRepository.deleteByUserId(userId);
        progressRepository.deleteById(userId);
        userRepository.deleteById(userId);
    }

    @Transactional
    @SuppressWarnings("unchecked")
    public UserProgressDto updateProgress(String userId, Map<String, Object> updates) {
        UserEntity user = requireUser(userId);
        UserProgressEntity progress = requireProgress(userId);

        if (updates.containsKey("totalPoints")) {
            progress.setTotalPoints(((Number) updates.get("totalPoints")).intValue());
        }
        if (updates.containsKey("quizzesTaken")) {
            progress.setQuizzesTaken(((Number) updates.get("quizzesTaken")).intValue());
        }
        if (updates.containsKey("correctAnswers")) {
            progress.setCorrectAnswers(((Number) updates.get("correctAnswers")).intValue());
        }
        if (updates.containsKey("totalQuestions")) {
            progress.setTotalQuestions(((Number) updates.get("totalQuestions")).intValue());
        }
        if (updates.containsKey("currentStreak")) {
            progress.setCurrentStreak(((Number) updates.get("currentStreak")).intValue());
        }
        if (updates.containsKey("longestStreak")) {
            progress.setLongestStreak(((Number) updates.get("longestStreak")).intValue());
        }
        if (updates.containsKey("achievements")) {
            progress.setAchievements((List<String>) updates.get("achievements"));
        }
        if (updates.containsKey("claimedRewards") || updates.containsKey("rewardsObtained")) {
            List<String> rewardIds = updates.containsKey("rewardsObtained")
                    ? (List<String>) updates.get("rewardsObtained")
                    : (List<String>) updates.get("claimedRewards");
            syncRewardObtain(userId, rewardIds);
            progress.setClaimedRewards(new ArrayList<>(rewardIds));
        }
        if (updates.containsKey("skillLevels")) {
            Map<String, Integer> skills = new HashMap<>();
            Map<String, Object> raw = (Map<String, Object>) updates.get("skillLevels");
            raw.forEach((k, v) -> skills.put(k, ((Number) v).intValue()));
            progress.setSkillLevels(skills);
        }
        if (updates.containsKey("rankPoints")) {
            user.setRankPoints(((Number) updates.get("rankPoints")).intValue());
            syncRankTier(user);
            userRepository.save(user);
        }
        if (updates.containsKey("rank")) {
            user.setRank((String) updates.get("rank"));
            userRepository.save(user);
        }

        UserProgressEntity saved = progressRepository.save(progress);
        List<String> rewardsObtained = loadRewardsObtained(userId);
        return EntityMapper.toProgressDto(saved, user, rewardsObtained);
    }

    @Transactional
    public UserProgressDto claimReward(String userId, String rewardId) {
        if (rewardId == null || rewardId.isBlank()) {
            throw new IllegalArgumentException("Reward id is required");
        }

        UserEntity user = requireUser(userId);
        UserProgressEntity progress = requireProgress(userId);

        List<String> achievements = progress.getAchievements() != null
                ? new ArrayList<>(progress.getAchievements())
                : new ArrayList<>();
        if (!achievements.contains(rewardId)) {
            throw new IllegalArgumentException("Achievement not earned yet");
        }

        recordRewardObtain(userId, rewardId);

        List<String> obtained = loadRewardsObtained(userId);
        progress.setClaimedRewards(new ArrayList<>(obtained));
        UserProgressEntity saved = progressRepository.save(progress);
        return EntityMapper.toProgressDto(saved, user, obtained);
    }

    public List<Map<String, Object>> getLeaderboard() {
        return progressRepository.findAll().stream()
                .map(progress -> {
                    UserEntity user = userRepository.findById(progress.getUserId()).orElse(null);
                    if (user == null) {
                        return null;
                    }
                    List<String> rewardsObtained = loadRewardsObtained(progress.getUserId());
                    Map<String, Object> entry = new HashMap<>();
                    entry.put("user", EntityMapper.toUserDto(user));
                    entry.put("progress", EntityMapper.toProgressDto(progress, user, rewardsObtained));
                    return entry;
                })
                .filter(entry -> entry != null)
                .sorted(Comparator.<Map<String, Object>>comparingInt(
                        e -> ((UserProgressDto) e.get("progress")).totalPoints()).reversed())
                .toList();
    }

    public List<Map<String, Object>> getAllUsersWithProgress() {
        return userRepository.findAll().stream()
                .map(user -> {
                    UserProgressEntity progress = progressRepository.findById(user.getId()).orElse(null);
                    List<String> rewardsObtained = loadRewardsObtained(user.getId());
                    Map<String, Object> entry = new HashMap<>();
                    entry.put("user", EntityMapper.toUserDto(user));
                    entry.put("progress", progress != null
                            ? EntityMapper.toProgressDto(progress, user, rewardsObtained)
                            : null);
                    return entry;
                })
                .toList();
    }

    public UserEntity requireUser(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public boolean isAdmin(String userId) {
        return userRepository.findById(userId)
                .map(u -> "admin".equals(u.getRole()))
                .orElse(false);
    }

    private UserProgressEntity requireProgress(String userId) {
        return progressRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Progress not found"));
    }

    private void syncRankTier(UserEntity user) {
        user.setRank(RankUtil.tierFromPoints(user.getRankPoints()));
    }

    private void recordRewardObtain(String userId, String rewardId) {
        if (rewardObtainRepository.existsByUserIdAndRewardId(userId, rewardId)) {
            return;
        }
        RewardObtainEntity row = new RewardObtainEntity();
        row.setId(UUID.randomUUID().toString());
        row.setUserId(userId);
        row.setRewardId(rewardId);
        row.setObtainedAt(Instant.now());
        rewardObtainRepository.save(row);
    }

    private void syncRewardObtain(String userId, List<String> rewardIds) {
        if (rewardIds == null) {
            return;
        }
        for (String rewardId : rewardIds) {
            recordRewardObtain(userId, rewardId);
        }
    }
}
