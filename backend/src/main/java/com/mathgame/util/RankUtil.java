package com.mathgame.util;

public final class RankUtil {

    private RankUtil() {
    }

    /** Tier id aligned with frontend {@code rankingSystem.ts}. */
    public static String tierFromPoints(int rankPoints) {
        if (rankPoints >= 2000) {
            return "master";
        }
        if (rankPoints >= 1000) {
            return "diamond";
        }
        if (rankPoints >= 600) {
            return "platinum";
        }
        if (rankPoints >= 300) {
            return "gold";
        }
        if (rankPoints >= 100) {
            return "silver";
        }
        return "bronze";
    }

    public static String displayName(String tier) {
        if (tier == null || tier.isBlank()) {
            return "Bronze";
        }
        return tier.substring(0, 1).toUpperCase() + tier.substring(1).toLowerCase();
    }
}
