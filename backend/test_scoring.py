# test_scoring.py
# Tests for the scoring and optimization logic from Day 5-6.
# Run with: python -m pytest

from main import (
    budget_match,
    interest_match,
    location_match,
    duration_match,
    score_program,
    housing_fit_score,
    optimize_selection,
)


# --- budget_match ---
# Tests the affordability scoring: 0 if over budget, otherwise higher score
# the cheaper the program is relative to the budget.

def test_budget_match_within_budget():
    # cost is exactly half the budget -> should score 0.5
    assert budget_match(1000, 2000) == 0.5

def test_budget_match_slightly_over_budget():
    # a small overage now receives partial credit instead of a hard zero
    result = budget_match(2200, 2000)
    assert abs(result - 0.2) < 0.0001
    # abs(result - 0.2) checks how far off the actual result is from 0.2,
    # and we accept anything within a tiny tolerance (0.0001) as "correct" —
    # this is the standard way to compare floats in any language, not just Python

def test_budget_match_slightly_over_budget_gets_partial_credit():
    # 10% over budget -> should get SOME credit now, not a hard zero
    result = budget_match(2200, 2000)
    assert result > 0
    assert result < 0.3

def test_budget_match_heavily_over_budget():
    # large overages still fall to zero
    assert budget_match(3000, 2000) == 0.0

def test_budget_match_exact_budget():
    # cost equals budget exactly -> uses the whole thing, score should be 0
    assert budget_match(2000, 2000) == 0.0


# --- interest_match ---
# Tests how much a program's tags overlap with the user's stated interests.

def test_interest_match_full_overlap():
    # every user interest is present in the program's tags -> perfect score
    assert interest_match(["stem", "research"], ["stem"]) == 1.0

def test_interest_match_no_overlap():
    # no shared tags at all -> zero
    assert interest_match(["business"], ["stem"]) == 0.0

def test_interest_match_no_preference_stated():
    # user gave no interests at all -> neutral score, not a penalty
    assert interest_match(["stem"], []) == 0.5


# --- location_match ---
# Tests the binary yes/no location check.

def test_location_match_in_preferred_areas():
    assert location_match("Sinchon", ["Sinchon", "Gwanak"]) == 1.0

def test_location_match_not_in_preferred_areas():
    assert location_match("Anam", ["Sinchon", "Gwanak"]) == 0.0

def test_location_match_no_preference_stated():
    # no preferred areas given -> neutral, not penalized
    assert location_match("Anam", []) == 0.5


# --- duration_match ---
# Tests how close a program's length is to what the user wants.

def test_duration_match_exact():
    # exact match -> perfect score
    assert duration_match(6, 6) == 1.0

def test_duration_match_never_goes_negative():
    # wildly mismatched duration should floor at 0, never go negative
    result = duration_match(24, 1)
    assert result >= 0


# --- optimize_selection ---
# Integration-style tests: check the optimizer's actual guarantees,
# not just individual math functions in isolation.

def test_optimizer_never_exceeds_budget():
    # THE core guarantee being tested: whatever the optimizer picks,
    # it must never cost more than the user's stated budget.
    programs = [
        {"id": 1, "name": "A", "cost": 1000000, "duration_months": 6, "location": "Sinchon", "tags": ["stem"]},
        {"id": 2, "name": "B", "cost": 2000000, "duration_months": 6, "location": "Gwanak", "tags": ["business"]},
    ]
    housing = [
        {"id": 1, "type": "Goshiwon", "monthly_cost": 400000, "location": "Sinchon"},
        {"id": 2, "type": "Studio", "monthly_cost": 1000000, "location": "Gangnam"},
    ]
    user = {
        # cheapest possible combo here is Program A (1,000,000) + Goshiwon (400,000 x 6 = 2,400,000)
        # = 3,400,000 total, so budget needs enough room for that to be a valid answer
        "budget": 5000000, "total_budget": 5000000, "duration_months": 6,
        "interests": ["stem"], "preferred_areas": ["Sinchon"],
    }

    result = optimize_selection(user, programs, housing)

    assert result is not None  # something affordable should exist here
    assert result["total_cost"] <= user["total_budget"]  # the core constraint being tested

def test_optimizer_returns_none_when_nothing_fits():
    # an unrealistically tiny budget should return None, not crash or pick something anyway
    programs = [{"id": 1, "name": "A", "cost": 5000000, "duration_months": 6, "location": "Sinchon", "tags": ["stem"]}]
    housing = [{"id": 1, "type": "Studio", "monthly_cost": 2000000, "location": "Gangnam"}]
    user = {
        "budget": 100, "total_budget": 100, "duration_months": 6,
        "interests": [], "preferred_areas": [],
    }

    result = optimize_selection(user, programs, housing)
    assert result is None