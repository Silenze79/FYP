"""Tests for bespoke math answers."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.math_solver import try_bespoke_math_answer


def test_one_plus_one():
    answer = try_bespoke_math_answer("1+1")
    assert answer is not None
    assert "2" in answer
    assert "addition" in answer.lower() or "combine" in answer.lower()


def test_what_is_addition():
    answer = try_bespoke_math_answer("what is 15 + 27?")
    assert answer is not None
    assert "42" in answer


def test_multiplication():
    answer = try_bespoke_math_answer("7 * 8")
    assert answer is not None
    assert "56" in answer


def test_linear_equation():
    answer = try_bespoke_math_answer("solve 2x + 5 = 13")
    assert answer is not None
    assert "4" in answer


def test_percent():
    answer = try_bespoke_math_answer("what is 25% of 80")
    assert answer is not None
    assert "20" in answer


if __name__ == "__main__":
    test_one_plus_one()
    test_what_is_addition()
    test_multiplication()
    test_linear_equation()
    test_percent()
    print("All math_solver tests passed.")
