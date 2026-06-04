package com.mathgame.service;

import com.mathgame.dto.RewardDto;
import com.mathgame.entity.RewardEntity;
import com.mathgame.mapper.EntityMapper;
import com.mathgame.repository.RewardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class RewardService {

    private final RewardRepository rewardRepository;

    public RewardService(RewardRepository rewardRepository) {
        this.rewardRepository = rewardRepository;
    }

    public List<RewardDto> getAllRewards() {
        return rewardRepository.findAll().stream()
                .map(EntityMapper::toRewardDto)
                .toList();
    }

    @Transactional
    public RewardDto addReward(Map<String, Object> data) {
        String id = "reward_" + System.currentTimeMillis();
        RewardEntity entity = new RewardEntity();
        entity.setId(id);
        entity.setName((String) data.get("name"));
        entity.setDescription((String) data.get("description"));
        entity.setIcon((String) data.get("icon"));
        entity.setPointsRequired(data.containsKey("pointsRequired")
                ? ((Number) data.get("pointsRequired")).intValue() : 0);
        entity.setCategory((String) data.getOrDefault("category", "general"));
        return EntityMapper.toRewardDto(rewardRepository.save(entity));
    }

    @Transactional
    public RewardDto updateReward(String rewardId, Map<String, Object> updates) {
        RewardEntity entity = rewardRepository.findById(rewardId)
                .orElseThrow(() -> new IllegalArgumentException("Reward not found"));

        if (updates.containsKey("name")) {
            entity.setName((String) updates.get("name"));
        }
        if (updates.containsKey("description")) {
            entity.setDescription((String) updates.get("description"));
        }
        if (updates.containsKey("icon")) {
            entity.setIcon((String) updates.get("icon"));
        }
        if (updates.containsKey("pointsRequired")) {
            entity.setPointsRequired(((Number) updates.get("pointsRequired")).intValue());
        }
        if (updates.containsKey("category")) {
            entity.setCategory((String) updates.get("category"));
        }

        return EntityMapper.toRewardDto(rewardRepository.save(entity));
    }

    @Transactional
    public void deleteReward(String rewardId) {
        if (!rewardRepository.existsById(rewardId)) {
            throw new IllegalArgumentException("Reward not found");
        }
        rewardRepository.deleteById(rewardId);
    }
}
