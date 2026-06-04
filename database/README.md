# Database schema

Initial relational schema for the Mathematics Game. Tables align with the Java backend (H2) and support future AI chat persistence.

## Files

| File | Purpose |
|------|---------|
| `schema.sql` | Full DDL — users, progress, questions, quizzes, rewards, AI chat, matches |

## How it is applied

**Java backend (default):** JPA `ddl-auto=update` creates/updates tables from entities in `backend/src/main/java/com/mathgame/entity/`. Use `schema.sql` as documentation and for manual setup.

**Manual (H2 console):** Start the backend, open http://localhost:8081/h2-console, JDBC URL `jdbc:h2:file:./data/mathgame`, user `sa`, empty password, then run sections of `schema.sql` as needed.

**PostgreSQL:** Use the same script; adjust `CLOB` → `TEXT` if required.

## Core tables

- **users** — accounts (student/admin)
- **user_progress** — points, streaks, skill levels (JSON columns)
- **questions** — quiz bank
- **quiz_sessions** / **quiz_session_answers** — attempt history
- **rewards** / **achievements** — gamification catalog
- **chat_sessions** / **chat_messages** — AI tutor conversation log
- **matches** — competitive matchmaking

## Seed data

The Java app seeds admin + questions on startup via `DataSeeder`. Default admin (see `backend/README.md`):

- Email: `admin@mathgame.com`
- Password: `admin123`
