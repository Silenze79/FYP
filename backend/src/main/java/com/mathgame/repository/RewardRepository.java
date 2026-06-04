package com.mathgame.repository;

import com.mathgame.entity.RewardEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RewardRepository extends JpaRepository<RewardEntity, String> {
}
