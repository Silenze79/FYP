package com.mathgame.seed;

import com.mathgame.entity.UserEntity;
import com.mathgame.entity.UserProgressEntity;
import com.mathgame.repository.QuestionRepository;
import com.mathgame.repository.UserProgressRepository;
import com.mathgame.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class DataSeeder implements CommandLineRunner {

    public static final String ADMIN_EMAIL = "admin@example.com";
    public static final String ADMIN_PASSWORD = "admin123";

    private final UserRepository userRepository;
    private final UserProgressRepository progressRepository;
    private final QuestionRepository questionRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(
            UserRepository userRepository,
            UserProgressRepository progressRepository,
            QuestionRepository questionRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.progressRepository = progressRepository;
        this.questionRepository = questionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (questionRepository.count() == 0) {
            questionRepository.saveAll(SeedData.questions());
        }
        if (!userRepository.existsByEmail(ADMIN_EMAIL)) {
            createAdmin();
        }
    }

    public Map<String, Object> seed() {
        int questionsAdded = 0;
        for (var question : SeedData.questions()) {
            if (!questionRepository.existsById(question.getId())) {
                questionRepository.save(question);
                questionsAdded++;
            }
        }

        Map<String, Object> adminInfo = new HashMap<>();
        if (!userRepository.existsByEmail(ADMIN_EMAIL)) {
            createAdmin();
            adminInfo.put("email", ADMIN_EMAIL);
            adminInfo.put("password", ADMIN_PASSWORD);
            adminInfo.put("message", "Admin user created successfully");
        } else {
            adminInfo.put("email", ADMIN_EMAIL);
            adminInfo.put("password", ADMIN_PASSWORD);
            adminInfo.put("message", "Admin user already exists");
        }

        return Map.of(
                "message", "Database seeded",
                "questionsAdded", questionsAdded,
                "admin", adminInfo
        );
    }

    private void createAdmin() {
        String userId = UUID.randomUUID().toString();

        UserEntity admin = new UserEntity();
        admin.setId(userId);
        admin.setUsername("Admin");
        admin.setEmail(ADMIN_EMAIL);
        admin.setPasswordHash(passwordEncoder.encode(ADMIN_PASSWORD));
        admin.setRole("admin");
        admin.setLevel(99);
        admin.setRankPoints(5000);
        admin.setRank("master");
        admin.setAvatar("👨‍💼");
        admin.setCreatedAt(Instant.parse("2023-12-01T00:00:00Z"));

        UserProgressEntity progress = new UserProgressEntity();
        progress.setUserId(userId);
        progress.setTotalPoints(9999);
        progress.setQuizzesTaken(100);
        progress.setCorrectAnswers(980);
        progress.setTotalQuestions(1000);
        progress.setCurrentStreak(50);
        progress.setLongestStreak(50);
        progress.setAchievements(new ArrayList<>());
        progress.setClaimedRewards(new ArrayList<>());

        Map<String, Integer> skills = UserProgressEntity.defaultSkillLevels();
        skills.put("arithmetic", 100);
        skills.put("algebra", 100);
        skills.put("geometry", 100);
        skills.put("statistics", 100);
        progress.setSkillLevels(skills);

        userRepository.save(admin);
        progressRepository.save(progress);
    }
}
