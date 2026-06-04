"""Rule-based math tutor responses with optional OpenAI enhancement."""

from __future__ import annotations

import os
from typing import Any

from app.math_solver import try_bespoke_math_answer


def build_system_prompt(user_progress: dict[str, Any] | None) -> str:
    base = (
        "You are a friendly, encouraging math tutor for students aged 10–18. "
        "When the student asks a calculation or equation:\n"
        "1. State the final answer clearly on the first line (e.g. 'Answer: 2').\n"
        "2. Then give a short step-by-step explanation in plain language.\n"
        "3. Use their skill levels to adjust difficulty if provided.\n"
        "For concepts (not a specific calculation), explain with one worked example. "
        "Topics: arithmetic, algebra, geometry, statistics."
    )
    if not user_progress:
        return base

    skills = user_progress.get("skillLevels") or user_progress.get("skill_levels") or {}
    streak = user_progress.get("currentStreak") or user_progress.get("current_streak") or 0
    if skills:
        skill_lines = ", ".join(f"{k}: {v}%" for k, v in skills.items())
        base += f" Student skill levels: {skill_lines}."
    if streak:
        base += f" Current study streak: {streak} days."
    return base


def _personalized_opener(user_progress: dict[str, Any] | None) -> str:
    if not user_progress:
        return ""
    skills = user_progress.get("skillLevels") or user_progress.get("skill_levels") or {}
    weak = [k for k, v in skills.items() if isinstance(v, (int, float)) and v < 50]
    if weak:
        return f"\n\n💡 Tip: Your {weak[0]} skills could use practice — try a quick quiz on that topic!"
    return ""


def rule_based_response(message: str, user_progress: dict[str, Any] | None = None) -> str:
    bespoke = try_bespoke_math_answer(message)
    if bespoke:
        return bespoke.replace("**", "") + _personalized_opener(user_progress)

    lower = message.lower().strip()

    if lower.startswith(("hi", "hello", "hey")):
        name_hint = ""
        return (
            f"Hello! I'm your math tutor. Ask me anything — try a calculation like **1 + 1** "
            f"or an equation like **2x + 5 = 13**, and I'll give you the answer with a full explanation."
            f"{name_hint}"
        )

    if any(
        word in lower
        for word in ("arithmetic", "addition", "subtraction", "multiplication", "division")
    ):
        return (
            "Arithmetic covers basic operations:\n\n"
            "• Addition (+): combining numbers\n"
            "• Subtraction (-): finding the difference\n"
            "• Multiplication (×): repeated addition\n"
            "• Division (÷): splitting into equal parts\n\n"
            "Try asking something specific, e.g. **What is 15 + 27?** or **48 ÷ 6**."
        ) + _personalized_opener(user_progress)

    if any(word in lower for word in ("algebra", "equation", "solve")):
        return (
            "Algebra is about finding unknown values:\n\n"
            "• Use inverse operations to isolate the variable\n"
            "• Do the same operation to both sides\n"
            "• Combine like terms first\n\n"
            "Example: type **Solve 2x + 5 = 13** and I'll work it out for you."
        )

    if any(
        word in lower
        for word in ("geometry", "area", "perimeter", "triangle", "circle")
    ):
        return (
            "Key geometry formulas:\n\n"
            "• Rectangle area = length × width\n"
            "• Triangle area = ½ × base × height\n"
            "• Circle area = πr², circumference = 2πr\n"
            "• Triangle angles sum to 180°\n\n"
            "Ask e.g. **What is the area of a rectangle 8 by 5?** (40)."
        )

    if any(
        word in lower for word in ("statistics", "mean", "median", "mode", "average")
    ):
        return (
            "Statistics basics:\n\n"
            "• Mean: sum ÷ count\n"
            "• Median: middle value when sorted\n"
            "• Mode: most frequent value\n"
            "• Range: max − min\n\n"
            "Example [3, 7, 5, 7, 9]: mean = 6.2, median = 7, mode = 7."
        )

    if any(word in lower for word in ("tips", "study", "improve", "better")):
        skills = (user_progress or {}).get("skillLevels") or (user_progress or {}).get(
            "skill_levels"
        ) or {}
        streak = (user_progress or {}).get("currentStreak") or (user_progress or {}).get(
            "current_streak"
        ) or 0
        lines = []
        for topic, level in skills.items():
            if level < 50:
                lines.append(f"• {topic.title()}: focus on fundamentals — try **What is 7 × 8?**")
            elif level < 75:
                lines.append(f"• {topic.title()}: try medium problems like **2x + 7 = 19**")
            else:
                lines.append(f"• {topic.title()}: challenge yourself with harder topics")
        tips = "\n".join(lines) if lines else "• Practice a little each day across all topics"
        return f"Study tips based on your progress:\n\n{tips}\n\nKeep your {streak}-day streak going!"

    if any(word in lower for word in ("practice", "quiz", "test")):
        return (
            "To practice in the app:\n\n"
            "• Quick Quiz — timed questions\n"
            "• Matchmaking — compete with others\n"
            "• Focus on topics where your skill level is below 75%\n\n"
            "Or ask me a practice question here, e.g. **12 × 11**."
        )

    if any(word in lower for word in ("help", "confused", "stuck", "don't understand")):
        return (
            "Try asking:\n\n"
            "• **1 + 1** or **What is 144 ÷ 12?**\n"
            "• **Solve 2x + 5 = 13**\n"
            "• **What is 25% of 80?**\n"
            "• **Explain algebra basics**\n\n"
            "I'll always give the answer first, then explain the steps."
        )

    if any(word in lower for word in ("hard", "difficult", "can't do")):
        return (
            "Math takes practice — you're making progress by showing up.\n\n"
            "• Break problems into smaller steps\n"
            "• Ask me one calculation at a time\n"
            "• Check each step before moving on\n\n"
            "Which problem should we solve together?"
        )

    return (
        "I can solve calculations (e.g. **1 + 1**), equations (**2x + 5 = 13**), "
        "and percent problems (**25% of 80**). Ask your question and I'll answer with an explanation."
    )


async def generate_response(
    message: str,
    conversation_history: list[dict[str, str]] | None = None,
    user_progress: dict[str, Any] | None = None,
) -> str:
    # Always try precise math first (works offline, fast, accurate)
    bespoke = try_bespoke_math_answer(message)
    if bespoke:
        return bespoke.replace("**", "") + _personalized_opener(user_progress)

    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        try:
            import httpx

            system_prompt = build_system_prompt(user_progress)
            messages = [{"role": "system", "content": system_prompt}]
            for item in (conversation_history or [])[-10:]:
                role = item.get("role", "user")
                content = item.get("content", "")
                if content:
                    messages.append({"role": role, "content": content})
            messages.append({"role": "user", "content": message})

            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                        "messages": messages,
                        "temperature": 0.4,
                        "max_tokens": 800,
                    },
                )
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
        except Exception:
            pass

    return rule_based_response(message, user_progress)
