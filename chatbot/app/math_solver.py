"""Parse and solve student math questions with clear answers and explanations."""

from __future__ import annotations

import ast
import operator
import re
from typing import Any

# ---------------------------------------------------------------------------
# Safe arithmetic evaluation
# ---------------------------------------------------------------------------

_BIN_OPS: dict[type, Any] = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.FloorDiv: operator.floordiv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow,
}

_UNARY_OPS: dict[type, Any] = {
    ast.UAdd: operator.pos,
    ast.USub: operator.neg,
}


def _safe_eval_node(node: ast.AST) -> float:
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return float(node.value)
    if isinstance(node, ast.Num):  # Python < 3.8 compat
        return float(node.n)
    if isinstance(node, ast.BinOp) and type(node.op) in _BIN_OPS:
        left = _safe_eval_node(node.left)
        right = _safe_eval_node(node.right)
        return float(_BIN_OPS[type(node.op)](left, right))
    if isinstance(node, ast.UnaryOp) and type(node.op) in _UNARY_OPS:
        return float(_UNARY_OPS[type(node.op)](_safe_eval_node(node.operand)))
    raise ValueError("Unsupported expression")


def safe_eval_expression(expr: str) -> float:
    normalized = (
        expr.replace("×", "*")
        .replace("÷", "/")
        .replace("−", "-")
        .replace("^", "**")
    )
    normalized = re.sub(r"\s+", "", normalized)
    if not re.fullmatch(r"[\d+\-*/().]+", normalized):
        raise ValueError("Invalid characters in expression")
    tree = ast.parse(normalized, mode="eval")
    return _safe_eval_node(tree.body)


def _format_number(value: float) -> str:
    if value == int(value):
        return str(int(value))
    rounded = round(value, 6)
    return str(rounded).rstrip("0").rstrip(".")


def _operation_name(op: str) -> str:
    return {
        "+": "addition",
        "-": "subtraction",
        "*": "multiplication",
        "/": "division",
    }.get(op, "calculation")


def _explain_binary(a: float, op: str, b: float, result: float) -> str:
    a_s, b_s, r_s = _format_number(a), _format_number(b), _format_number(result)
    symbol = {"+": "+", "-": "−", "*": "×", "/": "÷"}.get(op, op)

    if op == "+":
        step = (
            f"**Answer: {a_s} {symbol} {b_s} = {r_s}**\n\n"
            f"**Explanation**\n"
            f"• This is **addition** — you combine the two numbers.\n"
            f"• Start with {a_s}, then add {b_s}.\n"
            f"• {a_s} + {b_s} = {r_s}."
        )
    elif op == "-":
        step = (
            f"**Answer: {a_s} {symbol} {b_s} = {r_s}**\n\n"
            f"**Explanation**\n"
            f"• This is **subtraction** — you find the difference.\n"
            f"• Start with {a_s} and take away {b_s}.\n"
            f"• {a_s} − {b_s} = {r_s}."
        )
    elif op == "*":
        step = (
            f"**Answer: {a_s} {symbol} {b_s} = {r_s}**\n\n"
            f"**Explanation**\n"
            f"• This is **multiplication** — repeated addition.\n"
            f"• {a_s} × {b_s} means “{a_s} added {int(b) if b == int(b) else b_s} times”.\n"
            f"• {a_s} × {b_s} = {r_s}."
        )
    elif op == "/":
        if b == 0:
            return "Division by zero is undefined. Check the problem and try again."
        step = (
            f"**Answer: {a_s} {symbol} {b_s} = {r_s}**\n\n"
            f"**Explanation**\n"
            f"• This is **division** — splitting {a_s} into groups of {b_s}.\n"
            f"• {a_s} ÷ {b_s} = {r_s}.\n"
            f"• You can check: {r_s} × {b_s} ≈ {a_s}."
        )
    else:
        step = f"**Answer: {a_s} {symbol} {b_s} = {r_s}**"
    return step


# ---------------------------------------------------------------------------
# Detectors
# ---------------------------------------------------------------------------

_ARITHMETIC_EXPR = re.compile(
    r"(?:"
    r"(?:what\s+is|what's|whats|calculate|compute|evaluate|solve|find|work\s+out)"
    r"\s+)?"
    r"([\d\s+\-*/().×÷^]+)"
    r"(?:\s*=\s*\??)?\s*$",
    re.IGNORECASE,
)

_SIMPLE_EXPR = re.compile(
    r"^[\s\d+\-*/().×÷^]+$",
)

_LINEAR_EQ = re.compile(
    r"(?:solve\s+for\s+x\s*[:=]?\s*)?"
    r"(-?\d*\.?\d*)\s*\*?\s*x\s*([+\-])\s*(-?\d+\.?\d*)\s*=\s*(-?\d+\.?\d*)",
    re.IGNORECASE,
)

_LINEAR_EQ_SIMPLE = re.compile(
    r"x\s*([+\-])\s*(-?\d+\.?\d*)\s*=\s*(-?\d+\.?\d*)",
    re.IGNORECASE,
)

_PERCENT_OF = re.compile(
    r"(?:what\s+is\s+)?(-?\d+\.?\d*)\s*%\s+of\s+(-?\d+\.?\d*)",
    re.IGNORECASE,
)


def try_solve_percentage(message: str) -> str | None:
    match = _PERCENT_OF.search(message)
    if not match:
        return None
    pct, base = float(match.group(1)), float(match.group(2))
    result = (pct / 100) * base
    return (
        f"**Answer: {pct}% of {_format_number(base)} = {_format_number(result)}**\n\n"
        f"**Explanation**\n"
        f"• “{pct}% of {_format_number(base)}” means {pct} hundredths of {_format_number(base)}.\n"
        f"• Convert the percent: {pct}% = {pct}/100 = {_format_number(pct / 100)}.\n"
        f"• Multiply: {_format_number(pct / 100)} × {_format_number(base)} = {_format_number(result)}."
    )


def try_solve_linear_equation(message: str) -> str | None:
    text = message.strip()
    text = re.sub(r"^solve(?:\s+for\s+x)?\s*", "", text, flags=re.IGNORECASE)
    compact = text.replace(" ", "")

    match = _LINEAR_EQ.search(compact)
    if match:
        a_str, op, b_str, c_str = match.groups()
        a = float(a_str) if a_str not in ("", None) else 1.0
        if a_str == "-":
            a = -1.0
        b = float(b_str)
        c = float(c_str)
        if op == "+":
            # ax + b = c  ->  x = (c - b) / a
            rhs = c - b
            steps = [
                f"Given: {_format_number(a)}x + {_format_number(b)} = {_format_number(c)}",
                f"Subtract {_format_number(b)} from both sides: {_format_number(a)}x = {_format_number(rhs)}",
            ]
        else:
            # ax - b = c  ->  x = (c + b) / a
            rhs = c + b
            steps = [
                f"Given: {_format_number(a)}x − {_format_number(b)} = {_format_number(c)}",
                f"Add {_format_number(b)} to both sides: {_format_number(a)}x = {_format_number(rhs)}",
            ]
        if a == 0:
            return None
        x = rhs / a
        steps.append(f"Divide both sides by {_format_number(a)}: x = {_format_number(x)}")
        return (
            f"**Answer: x = {_format_number(x)}**\n\n"
            f"**Explanation**\n"
            + "\n".join(f"• {s}" for s in steps)
        )

    match = _LINEAR_EQ_SIMPLE.search(compact)
    if match:
        op, b_str, c_str = match.groups()
        b, c = float(b_str), float(c_str)
        if op == "+":
            x = c - b
            given = f"x + {_format_number(b)} = {_format_number(c)}"
            step = f"Subtract {_format_number(b)} from both sides: x = {_format_number(c)} − {_format_number(b)} = {_format_number(x)}"
        else:
            x = c + b
            given = f"x − {_format_number(b)} = {_format_number(c)}"
            step = f"Add {_format_number(b)} to both sides: x = {_format_number(c)} + {_format_number(b)} = {_format_number(x)}"
        return (
            f"**Answer: x = {_format_number(x)}**\n\n"
            f"**Explanation**\n"
            f"• Given: {given}\n"
            f"• {step}"
        )

    return None


def try_solve_arithmetic(message: str) -> str | None:
    text = message.strip().rstrip("?").strip()

    # Direct expression only: "1+1", "2 * 3"
    if _SIMPLE_EXPR.match(text.replace(" ", "")):
        expr = text
    else:
        match = _ARITHMETIC_EXPR.search(text)
        if not match:
            return None
        expr = match.group(1).strip()

    expr_clean = re.sub(r"\s+", "", expr)
    if len(expr_clean) < 3 or not re.search(r"\d", expr_clean):
        return None

    try:
        result = safe_eval_expression(expr)
    except (ValueError, SyntaxError, ZeroDivisionError, TypeError):
        return None

    # Build step-by-step for simple two-operand expressions
    simple = re.match(
        r"^(-?\d+\.?\d*)([\+\-\*/])(-?\d+\.?\d*)$",
        expr_clean.replace("×", "*").replace("÷", "/"),
    )
    if simple:
        a, op, b = float(simple.group(1)), simple.group(2), float(simple.group(3))
        return _explain_binary(a, op, b, result)

    # Longer expression (e.g. 2+3*4)
    return (
        f"**Answer: {_format_number(result)}**\n\n"
        f"**Explanation**\n"
        f"• Evaluating **{expr.strip()}** using order of operations (PEMDAS).\n"
        f"• Result = **{_format_number(result)}**."
    )


def try_bespoke_math_answer(message: str) -> str | None:
    """Return a tailored answer for calculable questions, or None to fall through."""
    for solver in (
        try_solve_percentage,
        try_solve_linear_equation,
        try_solve_arithmetic,
    ):
        answer = solver(message)
        if answer:
            return answer
    return None
