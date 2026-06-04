import { Question } from '../types';

export const questionBank: Question[] = [
  // Arithmetic - Easy
  {
    id: 'ar_e_1',
    topic: 'arithmetic',
    difficulty: 'easy',
    question: 'What is 15 + 23?',
    options: ['36', '37', '38', '39'],
    correctAnswer: 2,
    explanation: '15 + 23 = 38. Add the ones place: 5 + 3 = 8, then add the tens place: 10 + 20 = 30. Total: 38.',
    points: 10,
  },
  {
    id: 'ar_e_2',
    topic: 'arithmetic',
    difficulty: 'easy',
    question: 'What is 7 × 8?',
    options: ['54', '56', '58', '60'],
    correctAnswer: 1,
    explanation: '7 × 8 = 56. This is a basic multiplication fact.',
    points: 10,
  },
  {
    id: 'ar_e_3',
    topic: 'arithmetic',
    difficulty: 'easy',
    question: 'What is 100 - 47?',
    options: ['53', '52', '54', '51'],
    correctAnswer: 0,
    explanation: '100 - 47 = 53. Subtract 47 from 100.',
    points: 10,
  },
  // Arithmetic - Medium
  {
    id: 'ar_m_1',
    topic: 'arithmetic',
    difficulty: 'medium',
    question: 'What is 156 ÷ 12?',
    options: ['11', '12', '13', '14'],
    correctAnswer: 2,
    explanation: '156 ÷ 12 = 13. You can verify: 12 × 13 = 156.',
    points: 20,
  },
  {
    id: 'ar_m_2',
    topic: 'arithmetic',
    difficulty: 'medium',
    question: 'What is 25% of 80?',
    options: ['15', '20', '25', '30'],
    correctAnswer: 1,
    explanation: '25% of 80 = 0.25 × 80 = 20. Or think of it as 1/4 of 80.',
    points: 20,
  },
  // Arithmetic - Hard
  {
    id: 'ar_h_1',
    topic: 'arithmetic',
    difficulty: 'hard',
    question: 'What is the value of 2³ + 3² × 4?',
    options: ['44', '52', '100', '80'],
    correctAnswer: 0,
    explanation: 'Following order of operations: 2³ = 8, 3² = 9, 9 × 4 = 36, then 8 + 36 = 44.',
    points: 30,
  },
  
  // Algebra - Easy
  {
    id: 'al_e_1',
    topic: 'algebra',
    difficulty: 'easy',
    question: 'Solve for x: x + 5 = 12',
    options: ['5', '6', '7', '8'],
    correctAnswer: 2,
    explanation: 'x + 5 = 12. Subtract 5 from both sides: x = 12 - 5 = 7.',
    points: 10,
  },
  {
    id: 'al_e_2',
    topic: 'algebra',
    difficulty: 'easy',
    question: 'Solve for x: 3x = 15',
    options: ['3', '4', '5', '6'],
    correctAnswer: 2,
    explanation: '3x = 15. Divide both sides by 3: x = 15 ÷ 3 = 5.',
    points: 10,
  },
  // Algebra - Medium
  {
    id: 'al_m_1',
    topic: 'algebra',
    difficulty: 'medium',
    question: 'Solve for x: 2x + 7 = 19',
    options: ['5', '6', '7', '8'],
    correctAnswer: 1,
    explanation: '2x + 7 = 19. Subtract 7: 2x = 12. Divide by 2: x = 6.',
    points: 20,
  },
  {
    id: 'al_m_2',
    topic: 'algebra',
    difficulty: 'medium',
    question: 'If y = 2x + 3 and x = 4, what is y?',
    options: ['9', '10', '11', '12'],
    correctAnswer: 2,
    explanation: 'y = 2(4) + 3 = 8 + 3 = 11.',
    points: 20,
  },
  // Algebra - Hard
  {
    id: 'al_h_1',
    topic: 'algebra',
    difficulty: 'hard',
    question: 'Solve for x: x² - 5x + 6 = 0',
    options: ['x = 1 or x = 6', 'x = 2 or x = 3', 'x = -2 or x = -3', 'x = 1 or x = 5'],
    correctAnswer: 1,
    explanation: 'Factor: (x - 2)(x - 3) = 0. Therefore x = 2 or x = 3.',
    points: 30,
  },
  
  // Geometry - Easy
  {
    id: 'ge_e_1',
    topic: 'geometry',
    difficulty: 'easy',
    question: 'What is the area of a rectangle with length 8 and width 5?',
    options: ['35', '40', '45', '50'],
    correctAnswer: 1,
    explanation: 'Area = length × width = 8 × 5 = 40.',
    points: 10,
  },
  {
    id: 'ge_e_2',
    topic: 'geometry',
    difficulty: 'easy',
    question: 'How many degrees are in a right angle?',
    options: ['45°', '60°', '90°', '180°'],
    correctAnswer: 2,
    explanation: 'A right angle is exactly 90 degrees.',
    points: 10,
  },
  // Geometry - Medium
  {
    id: 'ge_m_1',
    topic: 'geometry',
    difficulty: 'medium',
    question: 'What is the circumference of a circle with radius 7? (Use π ≈ 3.14)',
    options: ['21.98', '43.96', '153.86', '87.92'],
    correctAnswer: 1,
    explanation: 'Circumference = 2πr = 2 × 3.14 × 7 = 43.96.',
    points: 20,
  },
  // Geometry - Hard
  {
    id: 'ge_h_1',
    topic: 'geometry',
    difficulty: 'hard',
    question: 'What is the volume of a cylinder with radius 3 and height 10? (Use π ≈ 3.14)',
    options: ['94.2', '188.4', '282.6', '376.8'],
    correctAnswer: 2,
    explanation: 'Volume = πr²h = 3.14 × 3² × 10 = 3.14 × 9 × 10 = 282.6.',
    points: 30,
  },
  
  // Statistics - Easy
  {
    id: 'st_e_1',
    topic: 'statistics',
    difficulty: 'easy',
    question: 'What is the mean of 2, 4, 6, 8, 10?',
    options: ['5', '6', '7', '8'],
    correctAnswer: 1,
    explanation: 'Mean = (2 + 4 + 6 + 8 + 10) ÷ 5 = 30 ÷ 5 = 6.',
    points: 10,
  },
  {
    id: 'st_e_2',
    topic: 'statistics',
    difficulty: 'easy',
    question: 'What is the median of 3, 7, 5, 9, 1?',
    options: ['3', '5', '7', '9'],
    correctAnswer: 1,
    explanation: 'First sort: 1, 3, 5, 7, 9. The middle value is 5.',
    points: 10,
  },
  // Statistics - Medium
  {
    id: 'st_m_1',
    topic: 'statistics',
    difficulty: 'medium',
    question: 'What is the mode of 2, 3, 3, 4, 5, 5, 5, 6?',
    options: ['3', '4', '5', '6'],
    correctAnswer: 2,
    explanation: 'The mode is the most frequent value. 5 appears 3 times, more than any other number.',
    points: 20,
  },
  // Statistics - Hard
  {
    id: 'st_h_1',
    topic: 'statistics',
    difficulty: 'hard',
    question: 'What is the range of 12, 8, 15, 22, 9, 18?',
    options: ['10', '12', '14', '16'],
    correctAnswer: 2,
    explanation: 'Range = Maximum - Minimum = 22 - 8 = 14.',
    points: 30,
  },
  
  // Scenario-Based Questions - Hard
  {
    id: 'sc_h_1',
    topic: 'arithmetic',
    difficulty: 'hard',
    question: 'Sarah is planning a birthday party. She needs to buy 8 gift bags at $3.75 each and 12 balloons at $0.85 each. If she has $50, how much money will she have left?',
    options: ['$9.80', '$10.20', '$19.80', '$20.20'],
    correctAnswer: 0,
    explanation: 'Gift bags: 8 × $3.75 = $30.00. Balloons: 12 × $0.85 = $10.20. Total spent: $30.00 + $10.20 = $40.20. Money left: $50.00 - $40.20 = $9.80.',
    points: 30,
  },
  {
    id: 'sc_h_2',
    topic: 'algebra',
    difficulty: 'hard',
    question: 'A train travels at 80 km/h for the first 2 hours, then increases its speed to 100 km/h for the next 3 hours. What is the total distance traveled?',
    options: ['360 km', '420 km', '460 km', '500 km'],
    correctAnswer: 2,
    explanation: 'Distance = Speed × Time. First part: 80 × 2 = 160 km. Second part: 100 × 3 = 300 km. Total: 160 + 300 = 460 km.',
    points: 30,
  },
  {
    id: 'sc_h_3',
    topic: 'geometry',
    difficulty: 'hard',
    question: 'A rectangular garden is 15 meters long and 8 meters wide. A path 1 meter wide is built around the outside. What is the total area including the path?',
    options: ['150 m²', '170 m²', '187 m²', '204 m²'],
    correctAnswer: 1,
    explanation: 'With 1m path around all sides, new dimensions: Length = 15 + 2(1) = 17m, Width = 8 + 2(1) = 10m. Total area = 17 × 10 = 170 m².',
    points: 30,
  },
  {
    id: 'sc_h_4',
    topic: 'arithmetic',
    difficulty: 'hard',
    question: 'A store is having a sale: 25% off all items, then an additional 10% off the discounted price. If a jacket originally costs $120, what is the final price?',
    options: ['$72', '$78', '$81', '$85.50'],
    correctAnswer: 2,
    explanation: 'First discount: $120 × 0.25 = $30 off. Price after first discount: $120 - $30 = $90. Second discount: $90 × 0.10 = $9 off. Final price: $90 - $9 = $81.',
    points: 30,
  },
  {
    id: 'sc_h_5',
    topic: 'algebra',
    difficulty: 'hard',
    question: 'Marcus has twice as many video games as his brother. Together they have 45 games. How many games does Marcus have?',
    options: ['15', '20', '25', '30'],
    correctAnswer: 3,
    explanation: 'Let x = brother\'s games. Marcus has 2x games. Together: x + 2x = 45, so 3x = 45. Therefore x = 15. Marcus has 2x = 2(15) = 30 games.',
    points: 30,
  },
  {
    id: 'sc_h_6',
    topic: 'statistics',
    difficulty: 'hard',
    question: 'In a class of 30 students, the average test score is 75. If 5 students who scored 60 are removed, what is the new average for the remaining students?',
    options: ['78', '80', '82', '85'],
    correctAnswer: 0,
    explanation: 'Total points for 30 students: 30 × 75 = 2,250. Points from 5 students: 5 × 60 = 300. Remaining points: 2,250 - 300 = 1,950. Remaining students: 30 - 5 = 25. New average: 1,950 ÷ 25 = 78.',
    points: 30,
  },
  {
    id: 'sc_h_7',
    topic: 'geometry',
    difficulty: 'hard',
    question: 'A pizza has a diameter of 14 inches. If you cut it into 8 equal slices, what is the approximate area of one slice? (Use π ≈ 3.14)',
    options: ['15.4 in²', '19.2 in²', '23.1 in²', '38.5 in²'],
    correctAnswer: 1,
    explanation: 'Radius = 14 ÷ 2 = 7 inches. Total area = πr² = 3.14 × 7² = 3.14 × 49 = 153.86 in². Area per slice: 153.86 ÷ 8 = 19.2 in².',
    points: 30,
  },
  {
    id: 'sc_h_8',
    topic: 'arithmetic',
    difficulty: 'hard',
    question: 'A water tank is being filled at 15 liters per minute and drained at 8 liters per minute simultaneously. If the tank is empty, how long will it take to fill 140 liters?',
    options: ['15 minutes', '18 minutes', '20 minutes', '24 minutes'],
    correctAnswer: 2,
    explanation: 'Net fill rate = 15 - 8 = 7 liters per minute. Time to fill 140 liters: 140 ÷ 7 = 20 minutes.',
    points: 30,
  },
  {
    id: 'sc_h_9',
    topic: 'algebra',
    difficulty: 'hard',
    question: 'A car rental costs $35 per day plus $0.25 per kilometer driven. If the total bill was $147.50, and the car was rented for 3 days, how many kilometers were driven?',
    options: ['170 km', '200 km', '250 km', '290 km'],
    correctAnswer: 1,
    explanation: 'Daily cost: 3 × $35 = $105. Remaining for km: $147.50 - $105 = $42.50. Kilometers driven: $42.50 ÷ $0.25 = 170 km.',
    points: 30,
  },
  {
    id: 'sc_h_10',
    topic: 'statistics',
    difficulty: 'hard',
    question: 'A basketball player made 18 out of 24 free throw attempts in the first half and 12 out of 16 in the second half. What is their overall free throw percentage for the game?',
    options: ['72%', '75%', '78%', '80%'],
    correctAnswer: 1,
    explanation: 'Total made: 18 + 12 = 30. Total attempts: 24 + 16 = 40. Percentage: (30 ÷ 40) × 100 = 75%.',
    points: 30,
  },
];

export function addQuestion(questionData: Omit<Question, 'id'>): Question {
  const topics = { arithmetic: 'ar', algebra: 'al', geometry: 'ge', statistics: 'st' };
  const difficulties = { easy: 'e', medium: 'm', hard: 'h' };
  
  const topicPrefix = topics[questionData.topic as keyof typeof topics] || 'q';
  const diffPrefix = difficulties[questionData.difficulty as keyof typeof difficulties] || 'x';
  
  // Generate unique ID
  const existingCount = questionBank.filter(q => q.topic === questionData.topic && q.difficulty === questionData.difficulty).length;
  const id = `${topicPrefix}_${diffPrefix}_${existingCount + 1}`;
  
  const newQuestion: Question = {
    id,
    ...questionData,
  };
  
  questionBank.push(newQuestion);
  return newQuestion;
}

export function updateQuestion(id: string, questionData: Partial<Omit<Question, 'id'>>): Question | null {
  const index = questionBank.findIndex(q => q.id === id);
  if (index === -1) return null;
  
  questionBank[index] = {
    ...questionBank[index],
    ...questionData,
  };
  
  return questionBank[index];
}

export function deleteQuestion(id: string): boolean {
  const index = questionBank.findIndex(q => q.id === id);
  if (index === -1) return false;
  
  questionBank.splice(index, 1);
  return true;
}

export function getQuestionsByTopic(topic: string): Question[] {
  return questionBank.filter(q => q.topic === topic);
}

export function getQuestionsByDifficulty(difficulty: string): Question[] {
  return questionBank.filter(q => q.difficulty === difficulty);
}

export function getRandomQuestions(count: number, difficulty?: string, topic?: string): Question[] {
  let filtered = [...questionBank];
  
  if (difficulty) {
    filtered = filtered.filter(q => q.difficulty === difficulty);
  }
  
  if (topic) {
    filtered = filtered.filter(q => q.topic === topic);
  }
  
  // Shuffle and take the first 'count' questions
  const shuffled = filtered.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function getAdaptiveQuestions(skillLevels: { [topic: string]: number }, count: number): Question[] {
  const questions: Question[] = [];
  const topics = Object.keys(skillLevels) as Array<'arithmetic' | 'algebra' | 'geometry' | 'statistics'>;
  
  // Distribute questions across topics based on skill level (focus on weaker areas)
  const questionsPerTopic = Math.ceil(count / topics.length);
  
  topics.forEach(topic => {
    const skillLevel = skillLevels[topic];
    let difficulty: 'easy' | 'medium' | 'hard';
    
    if (skillLevel < 50) {
      difficulty = 'easy';
    } else if (skillLevel < 75) {
      difficulty = 'medium';
    } else {
      difficulty = 'hard';
    }
    
    const topicQuestions = getRandomQuestions(questionsPerTopic, difficulty, topic);
    questions.push(...topicQuestions);
  });
  
  return questions.slice(0, count);
}