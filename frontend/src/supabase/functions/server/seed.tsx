import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use("/*", cors({ origin: "*" }));

const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
};

// Seed initial data
app.post("/make-server-769bc21d/seed", async (c) => {
  try {
    console.log('Starting database seed...');
    
    const supabase = getSupabaseAdmin();

    // Create admin user
    console.log('Creating admin user...');
    const { data: adminAuth, error: adminError } = await supabase.auth.admin.createUser({
      email: 'admin@example.com',
      password: 'admin123',
      user_metadata: { username: 'Admin' },
      email_confirm: true,
    });

    if (adminError) {
      console.log(`Admin creation error: ${adminError.message}`);
      // If admin exists, try to get it
      const existingAdmin = await kv.get('user:email:admin@example.com');
      if (!existingAdmin) {
        return c.json({ error: `Failed to create admin: ${adminError.message}` }, 400);
      }
    } else if (adminAuth.user) {
      const adminUser = {
        id: adminAuth.user.id,
        username: 'Admin',
        email: 'admin@example.com',
        role: 'admin',
        level: 99,
        avatar: '👨‍💼',
        createdAt: new Date('2023-12-01').toISOString(),
      };

      const adminProgress = {
        userId: adminAuth.user.id,
        totalPoints: 9999,
        quizzesTaken: 100,
        correctAnswers: 980,
        totalQuestions: 1000,
        currentStreak: 50,
        longestStreak: 50,
        achievements: [],
        skillLevels: {
          arithmetic: 100,
          algebra: 100,
          geometry: 100,
          statistics: 100,
        },
      };

      await kv.mset([
        { key: `user:${adminAuth.user.id}`, value: adminUser },
        { key: `user:email:admin@example.com`, value: adminUser },
        { key: `progress:${adminAuth.user.id}`, value: adminProgress },
      ]);
      console.log('Admin user created successfully');
    }

    // Create sample questions
    console.log('Creating sample questions...');
    const questions = [
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
    ];

    const questionPromises = questions.map(q => 
      kv.set(`question:${q.id}`, q)
    );
    await Promise.all(questionPromises);
    console.log(`Created ${questions.length} questions`);

    return c.json({
      success: true,
      message: `Database seeded successfully with admin user and ${questions.length} questions`,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return c.json({ error: `Seed failed: ${error}` }, 500);
  }
});

Deno.serve(app.fetch);
