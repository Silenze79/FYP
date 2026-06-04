package com.mathgame.mapper;

import com.mathgame.dto.QuestionDto;
import com.mathgame.dto.RewardDto;
import com.mathgame.dto.UserDto;
import com.mathgame.dto.UserProgressDto;
import com.mathgame.entity.QuestionEntity;
import com.mathgame.entity.RewardEntity;
import com.mathgame.entity.UserEntity;
import com.mathgame.entity.UserProgressEntity;
import com.mathgame.util.RankUtil;

import java.util.ArrayList;
import java.util.List;

public final class EntityMapper {

    private EntityMapper() {
    }

    public static UserDto toUserDto(UserEntity entity) {
        String rank = resolveRank(entity);
        return new UserDto(
                entity.getId(),
                entity.getUsername(),
                entity.getEmail(),
                entity.getRole(),
                entity.getLevel(),
                entity.getAvatar(),
                entity.getCreatedAt().toString(),
                entity.getRankPoints(),
                rank
        );
    }

    public static UserProgressDto toProgressDto(
            UserProgressEntity entity,
            UserEntity user,
            List<String> rewardsObtained) {
        int rankPoints = user != null ? user.getRankPoints() : 0;
        String currentRank = user != null ? resolveRank(user) : RankUtil.tierFromPoints(rankPoints);
        List<String> obtained = rewardsObtained != null && !rewardsObtained.isEmpty()
                ? rewardsObtained
                : safeList(entity.getClaimedRewards());

        return new UserProgressDto(
                entity.getUserId(),
                entity.getTotalPoints(),
                entity.getQuizzesTaken(),
                entity.getCorrectAnswers(),
                entity.getTotalQuestions(),
                entity.getCurrentStreak(),
                entity.getLongestStreak(),
                safeList(entity.getAchievements()),
                obtained,
                obtained,
                entity.getSkillLevels(),
                rankPoints,
                currentRank
        );
    }

    public static UserProgressDto toProgressDto(UserProgressEntity entity, UserEntity user) {
        return toProgressDto(entity, user, null);
    }

    public static UserProgressDto toProgressDto(UserProgressEntity entity) {
        return toProgressDto(entity, null, null);
    }

    private static String resolveRank(UserEntity entity) {
        if (entity.getRank() != null && !entity.getRank().isBlank()) {
            return entity.getRank();
        }
        return RankUtil.tierFromPoints(entity.getRankPoints());
    }

    private static List<String> safeList(List<String> list) {
        return list != null ? list : new ArrayList<>();
    }

    public static QuestionDto toQuestionDto(QuestionEntity entity) {
        return new QuestionDto(
                entity.getId(),
                entity.getTopic(),
                entity.getDifficulty(),
                entity.getQuestion(),
                entity.getOptions(),
                entity.getCorrectAnswer(),
                entity.getExplanation(),
                entity.getPoints()
        );
    }

    public static RewardDto toRewardDto(RewardEntity entity) {
        return new RewardDto(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getIcon(),
                entity.getPointsRequired(),
                entity.getCategory()
        );
    }
}
