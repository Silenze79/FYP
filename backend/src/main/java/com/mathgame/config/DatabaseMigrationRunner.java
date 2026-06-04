package com.mathgame.config;

import com.mathgame.entity.RewardObtainEntity;
import com.mathgame.entity.UserEntity;
import com.mathgame.entity.UserProgressEntity;
import com.mathgame.repository.RewardObtainRepository;
import com.mathgame.repository.UserProgressRepository;
import com.mathgame.repository.UserRepository;
import com.mathgame.util.RankUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StreamUtils;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Applies SQL migrations and backfills rank / reward_obtain for existing databases.
 */
@Component
public class DatabaseMigrationRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseMigrationRunner.class);

    private final JdbcTemplate jdbcTemplate;
    private final UserRepository userRepository;
    private final UserProgressRepository progressRepository;
    private final RewardObtainRepository rewardObtainRepository;

    public DatabaseMigrationRunner(
            JdbcTemplate jdbcTemplate,
            UserRepository userRepository,
            UserProgressRepository progressRepository,
            RewardObtainRepository rewardObtainRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.userRepository = userRepository;
        this.progressRepository = progressRepository;
        this.rewardObtainRepository = rewardObtainRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        runSqlMigration("db/migration/V2__user_rank_reward_obtain.sql");
        backfillUserRankAndRewards();
    }

    private void runSqlMigration(String classpathResource) {
        try {
            ClassPathResource resource = new ClassPathResource(classpathResource);
            if (!resource.exists()) {
                log.warn("Migration file not found: {}", classpathResource);
                return;
            }
            String sql = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
            for (String statement : splitStatements(sql)) {
                if (!statement.isBlank()) {
                    jdbcTemplate.execute(statement);
                }
            }
            log.info("Applied migration: {}", classpathResource);
        } catch (Exception e) {
            log.error("Migration failed ({}): {}", classpathResource, e.getMessage());
        }
    }

    private static List<String> splitStatements(String sql) {
        List<String> statements = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        for (String line : sql.split("\n")) {
            String trimmed = line.trim();
            if (trimmed.startsWith("--") || trimmed.isEmpty()) {
                continue;
            }
            current.append(line).append('\n');
            if (trimmed.endsWith(";")) {
                statements.add(current.toString().trim());
                current.setLength(0);
            }
        }
        if (!current.isEmpty()) {
            statements.add(current.toString().trim());
        }
        return statements;
    }

    @Transactional
    protected void backfillUserRankAndRewards() {
        for (UserEntity user : userRepository.findAll()) {
            String tier = RankUtil.tierFromPoints(user.getRankPoints());
            if (user.getRank() == null || user.getRank().isBlank() || !user.getRank().equals(tier)) {
                user.setRank(tier);
                userRepository.save(user);
            }
        }

        for (UserProgressEntity progress : progressRepository.findAll()) {
            List<String> claimed = progress.getClaimedRewards();
            if (claimed == null || claimed.isEmpty()) {
                continue;
            }
            for (String rewardId : claimed) {
                if (rewardId == null || rewardId.isBlank()) {
                    continue;
                }
                if (!rewardObtainRepository.existsByUserIdAndRewardId(progress.getUserId(), rewardId)) {
                    RewardObtainEntity row = new RewardObtainEntity();
                    row.setId(UUID.randomUUID().toString());
                    row.setUserId(progress.getUserId());
                    row.setRewardId(rewardId);
                    row.setObtainedAt(Instant.now());
                    rewardObtainRepository.save(row);
                }
            }
        }
        log.info("Rank and reward_obtain backfill complete");
    }
}
