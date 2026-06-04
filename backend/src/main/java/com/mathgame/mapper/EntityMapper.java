package com.mathgame.mapper;

import com.mathgame.dto.QuestionDto;
import com.mathgame.dto.RewardDto;
import com.mathgame.dto.UserDto;
import com.mathgame.dto.UserProgressDto;
import com.mathgame.entity.QuestionEntity;
import com.mathgame.entity.RewardEntity;
import com.mathgame.entity.UserEntity;
import com.mathgame.entity.UserProgressEntity;

public final class EntityMapper {

    private EntityMapper() {
    }

    public static UserDto toUserDto(UserEntity entity) {
        return new UserDto(
                entity.getId(),
                entity.getUsername(),
                entity.getEmail(),
                entity.getRole(),
                entity.getLevel(),
                entity.getAvatar(),
                entity.getCreatedAt().toString()
        );
    }

    public static UserProgressDto toProgressDto(UserProgressEntity entity) {
        return new UserProgressDto(
                entity.getUserId(),
                entity.getTotalPoints(),
                entity.getQuizzesTaken(),
                entity.getCorrectAnswers(),
                entity.getTotalQuestions(),
                entity.getCurrentStreak(),
                entity.getLongestStreak(),
                entity.getAchievements(),
                entity.getClaimedRewards(),
                entity.getSkillLevels()
        );
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
