# Mathematics Game with AI

Monorepo layout:

| Folder | Stack | Purpose |
|--------|--------|---------|
| `frontend/` | React + Vite + Tailwind | Web app (pages, hooks, services) |
| `backend/` | Java / Spring Boot | Game API, auth, questions |
| `chatbot/` | Python / FastAPI | AI math tutor for the teaching screen |
| `database/` | SQL | Initial schema (`schema.sql`) for users, quizzes, AI chat, etc. |

## Quick start

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at http://localhost:3000

### Python chatbot (required for AI Teaching)

```bash
cd chatbot
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Copy `frontend/.env.example` to `frontend/.env` and adjust URLs if needed.

### Java backend (optional)

See `backend/README.md`. Start when you need live auth and leaderboard sync.

## Frontend structure

Industry-standard React layout (no MVC):

```
frontend/src/
  app/           App shell & routing state
  pages/         Route-level screens
  components/    Shared UI (RankBadge, shadcn ui/)
  hooks/         React hooks (e.g. useQuiz)
  services/      API & chat clients
  lib/           Pure helpers (quiz math, achievements, ranks)
  data/          Local question bank
  types/         TypeScript types
  styles/        Global CSS
```

Original Figma design: https://www.figma.com/design/ngeRwIhmxjPTMH7k3PKvZB/Mathematics-Game-with-AI
