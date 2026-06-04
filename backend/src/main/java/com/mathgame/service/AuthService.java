package com.mathgame.service;

import com.mathgame.dto.UserDto;
import com.mathgame.dto.UserProgressDto;
import com.mathgame.entity.UserEntity;
import com.mathgame.entity.UserProgressEntity;
import com.mathgame.mapper.EntityMapper;
import com.mathgame.repository.UserProgressRepository;
import com.mathgame.repository.UserRepository;
import com.mathgame.security.JwtService;
import com.mathgame.util.AvatarUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserProgressRepository progressRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            UserProgressRepository progressRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.progressRepository = progressRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public Map<String, Object> signUp(String username, String email, String password) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists");
        }

        String userId = UUID.randomUUID().toString();
        UserEntity user = new UserEntity();
        user.setId(userId);
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole("student");
        user.setLevel(1);
        user.setAvatar(AvatarUtil.randomAvatar());
        user.setCreatedAt(Instant.now());

        UserProgressEntity progress = new UserProgressEntity();
        progress.setUserId(userId);
        progress.setTotalPoints(0);
        progress.setQuizzesTaken(0);
        progress.setCorrectAnswers(0);
        progress.setTotalQuestions(0);
        progress.setCurrentStreak(0);
        progress.setLongestStreak(0);
        progress.setAchievements(new ArrayList<>());
        progress.setClaimedRewards(new ArrayList<>());
        progress.setSkillLevels(UserProgressEntity.defaultSkillLevels());

        userRepository.save(user);
        progressRepository.save(progress);

        String token = jwtService.generateToken(userId, email, user.getRole());
        return authResponse(user, progress, token);
    }

    public Map<String, Object> signIn(String email, String password) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        UserProgressEntity progress = progressRepository.findById(user.getId())
                .orElseGet(() -> createMissingProgress(user.getId()));

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());
        return authResponse(user, progress, token);
    }

    public Map<String, Object> getSession(String userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User data not found"));
        UserProgressEntity progress = progressRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User data not found"));

        return Map.of(
                "user", EntityMapper.toUserDto(user),
                "progress", EntityMapper.toProgressDto(progress)
        );
    }

    private UserProgressEntity createMissingProgress(String userId) {
        UserProgressEntity progress = new UserProgressEntity();
        progress.setUserId(userId);
        progress.setTotalPoints(0);
        progress.setQuizzesTaken(0);
        progress.setCorrectAnswers(0);
        progress.setTotalQuestions(0);
        progress.setCurrentStreak(0);
        progress.setLongestStreak(0);
        progress.setAchievements(new ArrayList<>());
        progress.setClaimedRewards(new ArrayList<>());
        progress.setSkillLevels(UserProgressEntity.defaultSkillLevels());
        return progressRepository.save(progress);
    }

    private Map<String, Object> authResponse(UserEntity user, UserProgressEntity progress, String token) {
        return Map.of(
                "user", EntityMapper.toUserDto(user),
                "progress", EntityMapper.toProgressDto(progress),
                "accessToken", token
        );
    }
}
