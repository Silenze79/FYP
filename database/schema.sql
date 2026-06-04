-- Mathematics Game with AI — initial database schema
-- Compatible with H2 (Java backend) and PostgreSQL (production)
-- Run manually for reference; Spring Boot uses ddl-auto=update from JPA entities.

-- =============================================================================
-- USERS & AUTH
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
    id              VARCHAR(36)  PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    username        VARCHAR(100) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20)  NOT NULL DEFAULT 'student',  -- student | admin
    level           INT          NOT NULL DEFAULT 1,
    rank_points     INT          NOT NULL DEFAULT 0,          -- competitive matchmaking points
    rank            VARCHAR(20)  NOT NULL DEFAULT 'bronze',   -- bronze|silver|gold|platinum|diamond|master
    avatar          VARCHAR(500),
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_rank ON users (rank);
CREATE INDEX IF NOT EXISTS idx_users_rank_points ON users (rank_points);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- =============================================================================
-- PROGRESS & GAMIFICATION
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_progress (
    user_id           VARCHAR(36) PRIMARY KEY,
    total_points      INT         NOT NULL DEFAULT 0,
    quizzes_taken     INT         NOT NULL DEFAULT 0,
    correct_answers   INT         NOT NULL DEFAULT 0,
    total_questions   INT         NOT NULL DEFAULT 0,
    current_streak    INT         NOT NULL DEFAULT 0,
    longest_streak    INT         NOT NULL DEFAULT 0,
    achievements      CLOB,       -- JSON: ["first_quiz", "perfect_score", ...]
    claimed_rewards   CLOB,       -- JSON: achievement ids the user has claimed
    skill_levels      CLOB,       -- JSON: { "arithmetic": 0, "algebra": 0, ... }
    updated_at        TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Rewards the user has obtained (claimed achievements)
CREATE TABLE IF NOT EXISTS reward_obtain (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    user_id     VARCHAR(36)  NOT NULL,
    reward_id   VARCHAR(50)  NOT NULL,
    obtained_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_reward_obtain_user_reward UNIQUE (user_id, reward_id),
    CONSTRAINT fk_reward_obtain_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reward_obtain_user ON reward_obtain (user_id);

-- =============================================================================
-- QUESTIONS & QUIZZES
-- =============================================================================

CREATE TABLE IF NOT EXISTS questions (
    id              VARCHAR(50)  PRIMARY KEY,
    topic           VARCHAR(30)  NOT NULL,   -- arithmetic | algebra | geometry | statistics
    difficulty      VARCHAR(20)  NOT NULL,   -- easy | medium | hard
    question        CLOB         NOT NULL,
    options         CLOB         NOT NULL,   -- JSON array of strings
    correct_answer  INT          NOT NULL,   -- index into options
    explanation     CLOB,
    points          INT          NOT NULL DEFAULT 10,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions (topic);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions (difficulty);

CREATE TABLE IF NOT EXISTS quiz_sessions (
    id                VARCHAR(36) PRIMARY KEY,
    user_id           VARCHAR(36) NOT NULL,
    session_type      VARCHAR(20) NOT NULL DEFAULT 'practice',  -- practice | competitive
    score             INT         NOT NULL DEFAULT 0,
    total_questions   INT         NOT NULL,
    time_spent_sec    INT,
    topic_stats       CLOB,       -- JSON per-topic correct/total
    started_at        TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at      TIMESTAMP,
    CONSTRAINT fk_quiz_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user ON quiz_sessions (user_id);

CREATE TABLE IF NOT EXISTS quiz_session_answers (
    id                VARCHAR(36) PRIMARY KEY,
    session_id        VARCHAR(36) NOT NULL,
    question_id       VARCHAR(50) NOT NULL,
    selected_option   INT,
    is_correct        BOOLEAN     NOT NULL DEFAULT FALSE,
    answered_at       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_answer_session FOREIGN KEY (session_id) REFERENCES quiz_sessions (id) ON DELETE CASCADE,
    CONSTRAINT fk_answer_question FOREIGN KEY (question_id) REFERENCES questions (id)
);

-- =============================================================================
-- REWARDS & ACHIEVEMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS rewards (
    id                VARCHAR(50) PRIMARY KEY,
    name              VARCHAR(100) NOT NULL,
    description       CLOB,
    icon              VARCHAR(20),
    points_required   INT          NOT NULL DEFAULT 0,
    category          VARCHAR(30)  -- points | streak | mastery | special
);

CREATE TABLE IF NOT EXISTS achievements (
    id                VARCHAR(50) PRIMARY KEY,
    name              VARCHAR(100) NOT NULL,
    description       CLOB,
    icon              VARCHAR(20),
    requirement       INT          NOT NULL,
    category          VARCHAR(30)  NOT NULL  -- quiz | streak | points | mastery
);

-- =============================================================================
-- AI MATH TUTOR (Python chatbot persistence)
-- =============================================================================

CREATE TABLE IF NOT EXISTS chat_sessions (
    id              VARCHAR(36) PRIMARY KEY,
    user_id         VARCHAR(36) NOT NULL,
    title           VARCHAR(200),
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chat_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions (user_id);

CREATE TABLE IF NOT EXISTS chat_messages (
    id              VARCHAR(36) PRIMARY KEY,
    session_id      VARCHAR(36) NOT NULL,
    role            VARCHAR(20) NOT NULL,  -- user | assistant
    content         CLOB        NOT NULL,
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_message_session FOREIGN KEY (session_id) REFERENCES chat_sessions (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages (session_id);

-- =============================================================================
-- MATCHMAKING (optional competitive play)
-- =============================================================================

CREATE TABLE IF NOT EXISTS matches (
    id                VARCHAR(36) PRIMARY KEY,
    player1_id        VARCHAR(36) NOT NULL,
    player2_id        VARCHAR(36),
    player1_score     INT         NOT NULL DEFAULT 0,
    player2_score     INT         NOT NULL DEFAULT 0,
    status            VARCHAR(20) NOT NULL DEFAULT 'waiting',  -- waiting | in-progress | completed
    started_at        TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at      TIMESTAMP,
    CONSTRAINT fk_match_p1 FOREIGN KEY (player1_id) REFERENCES users (id),
    CONSTRAINT fk_match_p2 FOREIGN KEY (player2_id) REFERENCES users (id)
);
