# Math Tutor Chatbot (Python)

FastAPI service that powers the **AI Math Tutor** screen in the React frontend.

## Setup

```bash
cd chatbot
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

Health check: http://localhost:8000/health

## Optional OpenAI

Create `chatbot/.env`:

```
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-4o-mini
```

Without a key, the service uses a **bespoke math solver** that answers calculations directly (e.g. `1+1` → answer `2` with step-by-step explanation), linear equations, and percent problems.

Run tests: `python tests/test_math_solver.py`

## Frontend

In `frontend/.env`:

```
VITE_CHATBOT_API_URL=http://localhost:8000
```
