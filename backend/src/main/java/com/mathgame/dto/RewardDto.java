package com.mathgame.dto;

public record RewardDto(
        String id,
        String name,
        String description,
        String icon,
        int pointsRequired,
        String category
) {
}
