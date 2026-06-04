package com.mathgame.service;

import com.mathgame.dto.QuestionDto;
import com.mathgame.entity.QuestionEntity;
import com.mathgame.mapper.EntityMapper;
import com.mathgame.repository.QuestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class QuestionService {

    private static final Map<String, String> TOPIC_PREFIX = Map.of(
            "arithmetic", "ar",
            "algebra", "al",
            "geometry", "ge",
            "statistics", "st"
    );

    private static final Map<String, String> DIFF_PREFIX = Map.of(
            "easy", "e",
            "medium", "m",
            "hard", "h"
    );

    private static final Map<String, Integer> POINTS_BY_DIFFICULTY = Map.of(
            "easy", 10,
            "medium", 20,
            "hard", 30
    );

    private final QuestionRepository questionRepository;

    public QuestionService(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    public List<QuestionDto> getAllQuestions() {
        return questionRepository.findAll().stream()
                .map(EntityMapper::toQuestionDto)
                .toList();
    }

    @Transactional
    @SuppressWarnings("unchecked")
    public QuestionDto addQuestion(Map<String, Object> data) {
        String topic = (String) data.get("topic");
        String difficulty = (String) data.get("difficulty");

        if (topic == null || difficulty == null || data.get("question") == null
                || data.get("options") == null || data.get("correctAnswer") == null
                || data.get("explanation") == null) {
            throw new IllegalArgumentException("Missing required fields");
        }

        String id = generateQuestionId(topic, difficulty);
        QuestionEntity entity = new QuestionEntity();
        entity.setId(id);
        entity.setTopic(topic);
        entity.setDifficulty(difficulty);
        entity.setQuestion((String) data.get("question"));
        entity.setOptions((List<String>) data.get("options"));
        entity.setCorrectAnswer(((Number) data.get("correctAnswer")).intValue());
        entity.setExplanation((String) data.get("explanation"));
        entity.setPoints(data.containsKey("points")
                ? ((Number) data.get("points")).intValue()
                : POINTS_BY_DIFFICULTY.getOrDefault(difficulty, 10));

        return EntityMapper.toQuestionDto(questionRepository.save(entity));
    }

    @Transactional
    @SuppressWarnings("unchecked")
    public QuestionDto updateQuestion(String questionId, Map<String, Object> updates) {
        QuestionEntity entity = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));

        if (updates.containsKey("topic")) {
            entity.setTopic((String) updates.get("topic"));
        }
        if (updates.containsKey("difficulty")) {
            entity.setDifficulty((String) updates.get("difficulty"));
        }
        if (updates.containsKey("question")) {
            entity.setQuestion((String) updates.get("question"));
        }
        if (updates.containsKey("options")) {
            entity.setOptions((List<String>) updates.get("options"));
        }
        if (updates.containsKey("correctAnswer")) {
            entity.setCorrectAnswer(((Number) updates.get("correctAnswer")).intValue());
        }
        if (updates.containsKey("explanation")) {
            entity.setExplanation((String) updates.get("explanation"));
        }
        if (updates.containsKey("points")) {
            entity.setPoints(((Number) updates.get("points")).intValue());
        }

        return EntityMapper.toQuestionDto(questionRepository.save(entity));
    }

    @Transactional
    public void deleteQuestion(String questionId) {
        if (!questionRepository.existsById(questionId)) {
            throw new IllegalArgumentException("Question not found");
        }
        questionRepository.deleteById(questionId);
    }

    private String generateQuestionId(String topic, String difficulty) {
        String topicPrefix = TOPIC_PREFIX.getOrDefault(topic, "q");
        String diffPrefix = DIFF_PREFIX.getOrDefault(difficulty, "x");
        long count = questionRepository.countByTopicAndDifficulty(topic, difficulty);
        return topicPrefix + "_" + diffPrefix + "_" + (count + 1);
    }
}
