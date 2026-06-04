package com.mathgame.entity;

import com.mathgame.util.JsonConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "user_progress")
public class UserProgressEntity {

    @Id
    private String userId;

    private int totalPoints;
    private int quizzesTaken;
    private int correctAnswers;
    private int totalQuestions;
    private int currentStreak;
    private int longestStreak;

    @Convert(converter = JsonConverter.StringListConverter.class)
    @Column(columnDefinition = "CLOB")
    private List<String> achievements;

    @Convert(converter = JsonConverter.StringListConverter.class)
    @Column(columnDefinition = "CLOB")
    private List<String> claimedRewards;

    @Convert(converter = JsonConverter.SkillLevelsConverter.class)
    @Column(columnDefinition = "CLOB")
    private Map<String, Integer> skillLevels;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public int getTotalPoints() {
        return totalPoints;
    }

    public void setTotalPoints(int totalPoints) {
        this.totalPoints = totalPoints;
    }

    public int getQuizzesTaken() {
        return quizzesTaken;
    }

    public void setQuizzesTaken(int quizzesTaken) {
        this.quizzesTaken = quizzesTaken;
    }

    public int getCorrectAnswers() {
        return correctAnswers;
    }

    public void setCorrectAnswers(int correctAnswers) {
        this.correctAnswers = correctAnswers;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(int totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public int getCurrentStreak() {
        return currentStreak;
    }

    public void setCurrentStreak(int currentStreak) {
        this.currentStreak = currentStreak;
    }

    public int getLongestStreak() {
        return longestStreak;
    }

    public void setLongestStreak(int longestStreak) {
        this.longestStreak = longestStreak;
    }

    public List<String> getAchievements() {
        return achievements;
    }

    public void setAchievements(List<String> achievements) {
        this.achievements = achievements;
    }

    public List<String> getClaimedRewards() {
        return claimedRewards;
    }

    public void setClaimedRewards(List<String> claimedRewards) {
        this.claimedRewards = claimedRewards;
    }

    public Map<String, Integer> getSkillLevels() {
        return skillLevels;
    }

    public void setSkillLevels(Map<String, Integer> skillLevels) {
        this.skillLevels = skillLevels;
    }

    public static Map<String, Integer> defaultSkillLevels() {
        Map<String, Integer> levels = new HashMap<>();
        levels.put("arithmetic", 0);
        levels.put("algebra", 0);
        levels.put("geometry", 0);
        levels.put("statistics", 0);
        return levels;
    }
}
