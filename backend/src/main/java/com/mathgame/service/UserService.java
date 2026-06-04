package com.mathgame.service;

import com.mathgame.dto.UserDto;
import com.mathgame.dto.UserProgressDto;
import com.mathgame.entity.UserEntity;
import com.mathgame.entity.UserProgressEntity;
import com.mathgame.mapper.EntityMapper;
import com.mathgame.repository.UserProgressRepository;
import com.mathgame.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserProgressRepository progressRepository;

    public UserService(UserRepository userRepository, UserProgressRepository progressRepository) {
        this.userRepository = userRepository;
        this.progressRepository = progressRepository;
    }

    public Map<String, Object> getUserProfile(String userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        UserProgressEntity progress = progressRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return Map.of(
                "user", EntityMapper.toUserDto(user),
                "progress", EntityMapper.toProgressDto(progress)
        );
    }

    @Transactional
    public UserDto updateUser(String userId, Map<String, Object> updates) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

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

        return EntityMapper.toUserDto(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found");
        }
        progressRepository.deleteById(userId);
        userRepository.deleteById(userId);
    }

    @Transactional
    @SuppressWarnings("unchecked")
    public UserProgressDto updateProgress(String userId, Map<String, Object> updates) {
        UserProgressEntity progress = progressRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Progress not found"));

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
        if (updates.containsKey("claimedRewards")) {
            progress.setClaimedRewards((List<String>) updates.get("claimedRewards"));
        }
        if (updates.containsKey("skillLevels")) {
            Map<String, Integer> skills = new HashMap<>();
            Map<String, Object> raw = (Map<String, Object>) updates.get("skillLevels");
            raw.forEach((k, v) -> skills.put(k, ((Number) v).intValue()));
            progress.setSkillLevels(skills);
        }

        return EntityMapper.toProgressDto(progressRepository.save(progress));
    }

    public List<Map<String, Object>> getLeaderboard() {
        return progressRepository.findAll().stream()
                .map(progress -> {
                    UserEntity user = userRepository.findById(progress.getUserId()).orElse(null);
                    if (user == null) {
                        return null;
                    }
                    Map<String, Object> entry = new HashMap<>();
                    entry.put("user", EntityMapper.toUserDto(user));
                    entry.put("progress", EntityMapper.toProgressDto(progress));
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
                    Map<String, Object> entry = new HashMap<>();
                    entry.put("user", EntityMapper.toUserDto(user));
                    entry.put("progress", progress != null ? EntityMapper.toProgressDto(progress) : null);
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
}
