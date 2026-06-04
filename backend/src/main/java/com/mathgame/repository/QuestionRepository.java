package com.mathgame.repository;

import com.mathgame.entity.QuestionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<QuestionEntity, String> {
    List<QuestionEntity> findByTopicAndDifficulty(String topic, String difficulty);
    long countByTopicAndDifficulty(String topic, String difficulty);
}
