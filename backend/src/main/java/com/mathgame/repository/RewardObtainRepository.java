package com.mathgame.repository;

import com.mathgame.entity.RewardObtainEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RewardObtainRepository extends JpaRepository<RewardObtainEntity, String> {

    List<RewardObtainEntity> findByUserIdOrderByObtainedAtDesc(String userId);

    boolean existsByUserIdAndRewardId(String userId, String rewardId);

    void deleteByUserId(String userId);
}
