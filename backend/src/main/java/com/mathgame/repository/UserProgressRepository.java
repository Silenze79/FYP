package com.mathgame.repository;

import com.mathgame.entity.UserProgressEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProgressRepository extends JpaRepository<UserProgressEntity, String> {
}
