package com.mathgame.dto;

import java.util.Map;

public record UserDto(
        String id,
        String username,
        String email,
        String role,
        int level,
        String avatar,
        String createdAt
) {
}
