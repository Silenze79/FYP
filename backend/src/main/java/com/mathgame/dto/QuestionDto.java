package com.mathgame.dto;

import java.util.List;

public record QuestionDto(
        String id,
        String topic,
        String difficulty,
        String question,
        List<String> options,
        int correctAnswer,
        String explanation,
        int points
) {
}
