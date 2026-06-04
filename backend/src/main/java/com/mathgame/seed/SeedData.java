package com.mathgame.seed;

import com.mathgame.entity.QuestionEntity;

import java.util.ArrayList;
import java.util.List;

public final class SeedData {

    private SeedData() {
    }

    public static List<QuestionEntity> questions() {
        List<QuestionEntity> list = new ArrayList<>();
        add(list, "ar_e_1", "arithmetic", "easy", "What is 15 + 23?",
                List.of("36", "37", "38", "39"), 2,
                "15 + 23 = 38. Add the ones place: 5 + 3 = 8, then add the tens place: 10 + 20 = 30. Total: 38.", 10);
        add(list, "ar_e_2", "arithmetic", "easy", "What is 7 × 8?",
                List.of("54", "56", "58", "60"), 1, "7 × 8 = 56. This is a basic multiplication fact.", 10);
        add(list, "ar_e_3", "arithmetic", "easy", "What is 100 - 47?",
                List.of("53", "52", "54", "51"), 0, "100 - 47 = 53. Subtract 47 from 100.", 10);
        add(list, "ar_m_1", "arithmetic", "medium", "What is 156 ÷ 12?",
                List.of("11", "12", "13", "14"), 2, "156 ÷ 12 = 13. You can verify: 12 × 13 = 156.", 20);
        add(list, "ar_m_2", "arithmetic", "medium", "What is 25% of 80?",
                List.of("15", "20", "25", "30"), 1, "25% of 80 = 0.25 × 80 = 20. Or think of it as 1/4 of 80.", 20);
        add(list, "ar_h_1", "arithmetic", "hard", "What is the value of 2³ + 3² × 4?",
                List.of("44", "52", "100", "80"), 0,
                "Following order of operations: 2³ = 8, 3² = 9, 9 × 4 = 36, then 8 + 36 = 44.", 30);
        add(list, "al_e_1", "algebra", "easy", "Solve for x: x + 5 = 12",
                List.of("5", "6", "7", "8"), 2, "x + 5 = 12. Subtract 5 from both sides: x = 12 - 5 = 7.", 10);
        add(list, "al_e_2", "algebra", "easy", "Solve for x: 3x = 15",
                List.of("3", "4", "5", "6"), 2, "3x = 15. Divide both sides by 3: x = 15 ÷ 3 = 5.", 10);
        add(list, "al_m_1", "algebra", "medium", "Solve for x: 2x + 7 = 19",
                List.of("5", "6", "7", "8"), 1, "2x + 7 = 19. Subtract 7: 2x = 12. Divide by 2: x = 6.", 20);
        add(list, "al_m_2", "algebra", "medium", "If y = 2x + 3 and x = 4, what is y?",
                List.of("9", "10", "11", "12"), 2, "y = 2(4) + 3 = 8 + 3 = 11.", 20);
        add(list, "al_h_1", "algebra", "hard", "Solve for x: x² - 5x + 6 = 0",
                List.of("x = 1 or x = 6", "x = 2 or x = 3", "x = -2 or x = -3", "x = 1 or x = 5"), 1,
                "Factor: (x - 2)(x - 3) = 0. Therefore x = 2 or x = 3.", 30);
        add(list, "ge_e_1", "geometry", "easy", "What is the area of a rectangle with length 8 and width 5?",
                List.of("35", "40", "45", "50"), 1, "Area = length × width = 8 × 5 = 40.", 10);
        add(list, "ge_e_2", "geometry", "easy", "How many degrees are in a right angle?",
                List.of("45°", "60°", "90°", "180°"), 2, "A right angle is exactly 90 degrees.", 10);
        add(list, "ge_m_1", "geometry", "medium", "What is the circumference of a circle with radius 7? (Use π ≈ 3.14)",
                List.of("21.98", "43.96", "153.86", "87.92"), 1, "Circumference = 2πr = 2 × 3.14 × 7 = 43.96.", 20);
        add(list, "ge_h_1", "geometry", "hard", "What is the volume of a cylinder with radius 3 and height 10? (Use π ≈ 3.14)",
                List.of("94.2", "188.4", "282.6", "376.8"), 2,
                "Volume = πr²h = 3.14 × 3² × 10 = 3.14 × 9 × 10 = 282.6.", 30);
        add(list, "st_e_1", "statistics", "easy", "What is the mean of 2, 4, 6, 8, 10?",
                List.of("5", "6", "7", "8"), 1, "Mean = (2 + 4 + 6 + 8 + 10) ÷ 5 = 30 ÷ 5 = 6.", 10);
        add(list, "st_e_2", "statistics", "easy", "What is the median of 3, 7, 5, 9, 1?",
                List.of("3", "5", "7", "9"), 1, "First sort: 1, 3, 5, 7, 9. The middle value is 5.", 10);
        add(list, "st_m_1", "statistics", "medium", "What is the mode of 2, 3, 3, 4, 5, 5, 5, 6?",
                List.of("3", "4", "5", "6"), 2, "The mode is the most frequent value. 5 appears 3 times.", 20);
        add(list, "st_h_1", "statistics", "hard", "What is the range of 12, 8, 15, 22, 9, 18?",
                List.of("10", "12", "14", "16"), 2, "Range = Maximum - Minimum = 22 - 8 = 14.", 30);
        return list;
    }

    private static void add(
            List<QuestionEntity> list,
            String id,
            String topic,
            String difficulty,
            String question,
            List<String> options,
            int correctAnswer,
            String explanation,
            int points) {
        QuestionEntity entity = new QuestionEntity();
        entity.setId(id);
        entity.setTopic(topic);
        entity.setDifficulty(difficulty);
        entity.setQuestion(question);
        entity.setOptions(options);
        entity.setCorrectAnswer(correctAnswer);
        entity.setExplanation(explanation);
        entity.setPoints(points);
        list.add(entity);
    }
}
