package com.mathgame.dto;

import java.util.List;
import java.util.Map;

public record UserProgressDto(
        String userId,
        int totalPoints,
        int quizzesTaken,
        int correctAnswers,
        int totalQuestions,
        int currentStreak,
        int longestStreak,
        List<String> achievements,
        List<String> claimedRewards,
        List<String> rewardsObtained,
        Map<String, Integer> skillLevels,
        int rankPoints,
        String currentRank
) {
}
