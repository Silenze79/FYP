# Mathematics Learning Game - Database Setup

Your mathematics learning game has been successfully connected to Supabase database! All data is now persisted in a real database with full authentication.

## 🎯 Getting Started

### 1. Initialize the Database

**IMPORTANT:** Before using the application, you must seed the database with initial data.

Run the seed endpoint once:

```bash
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-769bc21d/seed
```

This will create:
- **Admin account** with credentials:
  - Email: `admin@example.com`
  - Password: `admin123`
- **20+ math questions** across 4 topics and 3 difficulty levels

### 2. Login

After seeding, you can:

- **Login as Admin**:
  - Email: `admin@example.com`
  - Password: `admin123`
  - Access: Full admin panel with question management, user management, rewards system, and system reports

- **Register as Student**: Create a new account to test the student experience

## 🗄️ Database Architecture

### Data Storage

The application uses Supabase's Key-Value store for data persistence:

- **Users**: `user:{userId}` and `user:email:{email}`
- **User Progress**: `progress:{userId}`
- **Questions**: `question:{questionId}`
- **Rewards**: `reward:{rewardId}`

### Authentication

- Full Supabase Auth integration
- JWT token-based authentication
- Secure password hashing (handled by Supabase)
- Session management with automatic token refresh

## 📊 Features Connected to Database

### ✅ Authentication System
- User registration with email confirmation
- Secure login/logout
- Session persistence
- Password encryption

### ✅ User Management
- Profile updates (username, email, avatar)
- Account deletion
- Progress tracking
- Achievement system

### ✅ Quiz System
- All quiz results saved to database
- Real-time progress updates
- Skill level tracking per topic
- Streak tracking

### ✅ Leaderboard
- Real-time rankings based on points
- Accurate statistics from database
- Filtered by student users only

### ✅ Admin Panel
- **Question Management**: Add, edit, delete questions
- **User Management**: View all users, ban users
- **Rewards Management**: Create, edit, delete rewards
- **System Reports**: Generate comprehensive statistics

### ✅ Matchmaking & Competitive Mode
- Progress saved after competitive matches
- Points and statistics updated in real-time

## 🔧 API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/signin` - Login user
- `GET /auth/session` - Get current session
- `POST /auth/signout` - Logout user

### Users
- `GET /user/:userId` - Get user profile
- `PUT /user/:userId` - Update user profile
- `DELETE /user/:userId` - Delete user account
- `PUT /progress/:userId` - Update user progress
- `GET /leaderboard` - Get leaderboard data

### Questions (Admin Only)
- `GET /questions` - Get all questions
- `POST /questions` - Add new question
- `PUT /questions/:id` - Update question
- `DELETE /questions/:id` - Delete question

### Admin
- `GET /admin/users` - Get all users with progress
- `POST /admin/users/:id/ban` - Ban a user

### Rewards (Admin Only)
- `GET /rewards` - Get all rewards
- `POST /rewards` - Create new reward
- `PUT /rewards/:id` - Update reward
- `DELETE /rewards/:id` - Delete reward

## 🔒 Security

- All API routes require authentication (except signup/signin)
- Admin routes verify admin role
- Users can only modify their own data
- Passwords are never stored or transmitted in plain text
- Environment variables protect sensitive keys
- CORS enabled for secure cross-origin requests

## 💾 Data Persistence

All user data is now permanently stored:
- ✅ User accounts and profiles
- ✅ Quiz progress and statistics
- ✅ Achievements and rewards
- ✅ Skill levels per topic
- ✅ Streaks and leaderboard positions
- ✅ Question bank with custom questions

## 🎮 Testing the System

1. **Seed the database** (one time only)
2. **Login as admin** to explore admin features
3. **Register a test student account** to test student features
4. **Take quizzes** to verify progress tracking
5. **Check leaderboard** to see rankings update
6. **Try competitive matchmaking** to test real-time updates
7. **Edit profile** to test data updates
8. **View achievements** to see reward system in action

## 🐛 Troubleshooting

**Issue**: Login fails after seeding
- **Solution**: Verify the seed completed successfully by checking server logs

**Issue**: "Unauthorized" errors
- **Solution**: Ensure you're logged in and your session hasn't expired

**Issue**: Questions not showing up
- **Solution**: Run the seed endpoint again or add questions through the admin panel

**Issue**: Profile updates not persisting
- **Solution**: Check that you're logged in and the user ID matches your session

## 📝 Notes

- The database uses Supabase's KV store which is suitable for prototyping
- All dates are stored as ISO strings and converted to Date objects in the frontend
- Admin users see a different interface (Admin Panel as home)
- Student users see the regular app interface
- Progress is automatically saved after each quiz

## 🚀 Next Steps

Now that your database is connected, you can:
1. Customize the admin credentials
2. Add more questions through the admin panel
3. Create custom achievements and rewards
4. Monitor user progress and statistics
5. Scale the application with confidence knowing data is persisted

Enjoy your fully connected mathematics learning game!
