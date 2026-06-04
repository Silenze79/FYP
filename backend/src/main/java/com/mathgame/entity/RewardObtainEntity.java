package com.mathgame.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;

@Entity
@Table(
        name = "reward_obtain",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "reward_id"})
)
public class RewardObtainEntity {

    @Id
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "reward_id", nullable = false)
    private String rewardId;

    @Column(name = "obtained_at", nullable = false)
    private Instant obtainedAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getRewardId() {
        return rewardId;
    }

    public void setRewardId(String rewardId) {
        this.rewardId = rewardId;
    }

    public Instant getObtainedAt() {
        return obtainedAt;
    }

    public void setObtainedAt(Instant obtainedAt) {
        this.obtainedAt = obtainedAt;
    }
}
