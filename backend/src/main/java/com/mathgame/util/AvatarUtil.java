package com.mathgame.util;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

public final class AvatarUtil {

    private static final List<String> AVATARS = List.of(
            "🎓", "📚", "✏️", "🧮", "🎯", "🚀", "⭐", "🏆", "💡", "🔢"
    );

    private AvatarUtil() {
    }

    public static String randomAvatar() {
        return AVATARS.get(ThreadLocalRandom.current().nextInt(AVATARS.size()));
    }
}
