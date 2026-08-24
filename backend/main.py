import os
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

load_dotenv() #read env file

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = os.getenv("DATABASE_URL") #pulls value(connection string)

def get_connection(): #opens a fresh connection when called
    return psycopg2.connect(DATABASE_URL)

@app.get("/")
def read_root():
    return {"message": "Backend is running"}

@app.get("/programs")
def get_programs(): #error handling
    try: 
        conn = get_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT id, name, university, cost, duration_months, location, tags FROM programs;")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/housing")
def get_housing():
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT id, type, monthly_cost, location, lifestyle_fit FROM housing_options;")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
class UserCreate(BaseModel):
    budget: int
    major: str | None = None
    duration_months: int
    preferences: str | None = None

@app.post("/users")
def create_user(user: UserCreate):
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(
            "INSERT INTO users (budget, major, duration_months, preferences) VALUES (%s, %s, %s, %s) RETURNING id, budget, major, duration_months, preferences;",
            (user.budget, user.major, user.duration_months, user.preferences)
        )
        new_user = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        return new_user
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    # --- Scoring functions ---
# Each one takes a program's value and the user's preference,
# and returns a number between 0 and 1 (1 = perfect match, 0 = no match).

def budget_match(program_cost: int, user_budget: int) -> float:
    if program_cost <= user_budget:
        # within budget — same as before, cheaper relative to budget scores higher
        return 1 - (program_cost / user_budget)

    # over budget — instead of a hard 0, apply a steep penalty based on HOW FAR over
    overage_ratio = (program_cost - user_budget) / user_budget
    # e.g. 10% over budget -> overage_ratio = 0.1
    # e.g. 100% over budget (double the budget) -> overage_ratio = 1.0

    penalty_score = max(0, 0.3 - overage_ratio)
    # allows a small amount of credit for being just barely over budget,
    # but it decays fast — anything more than 30% over budget still lands at 0
    return penalty_score

def interest_match(program_tags: list[str], user_interests: list[str]) -> float:
    if not user_interests:
        return 0.5  # user gave no preference -> neutral score, not a penalty
    overlap = set(program_tags) & set(user_interests)  # tags in BOTH lists
    return len(overlap) / len(user_interests)  # fraction of user's interests satisfied


def location_match(program_location: str, preferred_areas: list[str]) -> float:
    if not preferred_areas:
        return 0.5  # no preference stated -> neutral
    return 1.0 if program_location in preferred_areas else 0.0  # binary, not partial


def duration_match(program_duration: int, user_duration: int) -> float:
    diff = abs(program_duration - user_duration)  # how far off, regardless of direction
    return max(0, 1 - (diff / user_duration))  # floor at 0 so it never goes negative


def score_program(program: dict, user: dict) -> float:
    # run each factor through its match function
    b = budget_match(program["cost"], user["budget"])
    i = interest_match(program["tags"], user["interests"])
    l = location_match(program["location"], user["preferred_areas"])
    d = duration_match(program["duration_months"], user["duration_months"])

    # weighted sum — weights add up to 1.0, so final score is always 0-1
    return (b * 0.3) + (i * 0.3) + (l * 0.2) + (d * 0.2)


# --- Endpoint ---

@app.get("/recommend")
def recommend(
    budget: int,
    duration_months: int,
    interests: str = "",        # comma-separated string from the URL, e.g. "stem,business"
    preferred_areas: str = "",  # same idea, e.g. "Sinchon,Gwanak"
):
    try:
        # build a user dict from the query params, splitting the comma-separated strings into real lists
        user = {
            "budget": budget,
            "duration_months": duration_months,
            "interests": interests.split(",") if interests else [],
            "preferred_areas": preferred_areas.split(",") if preferred_areas else [],
        }

        # pull every program from the database, same pattern as GET /programs
        conn = get_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT id, name, university, cost, duration_months, location, tags FROM programs;")
        programs = cur.fetchall()
        cur.close()
        conn.close()

        # score every program against this user, attach the score onto each row
        for program in programs:
            program["score"] = round(score_program(program, user), 3)

        # sort highest score first
        ranked = sorted(programs, key=lambda p: p["score"], reverse=True)
        return ranked

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scoring error: {str(e)}")
    
# --- Optimizer ---
# Finds the best program + housing combination that fits within a hard budget ceiling.
# Knapsack-style: "weight" = total cost, "value" = combined fit score, constraint = total_budget.
# Brute-force is fine here (6 programs x 3 housing = 18 combos) — no real DP needed to be correct.

def housing_fit_score(housing: dict, user: dict) -> float:
    # how well housing's monthly cost fits a rough 40%-of-monthly-budget housing allowance
    monthly_budget_share = user["total_budget"] / user["duration_months"] * 0.4
    if housing["monthly_cost"] > monthly_budget_share:
        return 0.3  # expensive relative to budget, but not a hard zero — still usable
    return 1 - (housing["monthly_cost"] / monthly_budget_share) * 0.5


# NOTE (revisit Day 9):
# - budget_match's hard cutoff can dominate scoring even when a program is only
#   slightly over budget, similar to the same issue in score_program (see Day 5 note).
# - total_cost always multiplies housing by the user's requested duration_months,
#   not the chosen program's own duration — currently assumes the stay length
#   matches the user's input regardless of program length. Consider using
#   min(program["duration_months"], user["duration_months"]) instead.
def optimize_selection(user: dict, programs: list[dict], housing_options: list[dict]):
    best_combo = None
    best_score = -1  # anything real will beat this, so the first valid combo always wins initially

    for program in programs:
        for housing in housing_options:
            stay_duration = min(program["duration_months"], user["duration_months"])
            # housing cost should reflect however long the person is actually there for THIS program,
            # not just whatever duration they originally requested
            total_cost = program["cost"] + (housing["monthly_cost"] * stay_duration)

            if total_cost <= user["total_budget"]:  # hard constraint, filters before scoring
                program_score = score_program(program, user)
                housing_score = housing_fit_score(housing, user)
                combined_score = (program_score * 0.7) + (housing_score * 0.3)

                if combined_score > best_score:
                    best_score = combined_score
                    best_combo = {
                        "program": program,
                        "housing": housing,
                        "total_cost": total_cost,
                        "remaining_budget": user["total_budget"] - total_cost,
                        "score": round(combined_score, 3),
                    }

    return best_combo


class OptimizeRequest(BaseModel):
    total_budget: int
    duration_months: int
    interests: list[str] = []
    preferred_areas: list[str] = []


@app.post("/optimize")
def optimize(request: OptimizeRequest):
    try:
        user = {
            "total_budget": request.total_budget,
            "duration_months": request.duration_months,
            "budget": request.total_budget,  # score_program expects "budget" — reuse same value
            "interests": request.interests,
            "preferred_areas": request.preferred_areas,
        }

        conn = get_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cur.execute("SELECT id, name, university, cost, duration_months, location, tags FROM programs;")
        programs = cur.fetchall()

        cur.execute("SELECT id, type, monthly_cost, location, lifestyle_fit FROM housing_options;")
        housing_options = cur.fetchall()

        cur.close()
        conn.close()

        result = optimize_selection(user, programs, housing_options)

        if result is None:
            raise HTTPException(status_code=404, detail="No program + housing combination fits within this budget.")

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization error: {str(e)}")

@app.get("/neighborhoods")
def get_neighborhoods():
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("""
            SELECT id, name, average_monthly_cost, nightlife_score, shopping_score,
                   safety_score, transit_score, study_environment_score, tags
            FROM neighborhoods;
        """)
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

def neighborhood_match(neighborhood: dict, user_priorities: dict) -> float:
    # user_priorities is a dict like {"nightlife": 0.6, "safety": 0.4} —
    # the user says which dimensions matter most, and how much.
    total_score = 0.0
    total_weight = 0.0

    dimension_map = {
        "nightlife": neighborhood["nightlife_score"],
        "shopping": neighborhood["shopping_score"],
        "safety": neighborhood["safety_score"],
        "transit": neighborhood["transit_score"],
        "study": neighborhood["study_environment_score"],
    }

    for dimension, weight in user_priorities.items():
        if dimension in dimension_map:
            normalized_score = dimension_map[dimension] / 10  # convert 1-10 scale to 0-1
            total_score += normalized_score * weight
            total_weight += weight

    if total_weight == 0:
        return 0.5  # no priorities given -> neutral

    return total_score / total_weight


@app.get("/neighborhoods/match")
def match_neighborhoods(
    nightlife: float = 0,
    shopping: float = 0,
    safety: float = 0,
    transit: float = 0,
    study: float = 0,
):
    try:
        user_priorities = {
            "nightlife": nightlife, "shopping": shopping, "safety": safety,
            "transit": transit, "study": study,
        }
        user_priorities = {k: v for k, v in user_priorities.items() if v > 0}

        conn = get_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("""
            SELECT id, name, average_monthly_cost, nightlife_score, shopping_score,
                   safety_score, transit_score, study_environment_score, tags
            FROM neighborhoods;
        """)
        neighborhoods = cur.fetchall()
        cur.close()
        conn.close()

        for n in neighborhoods:
            n["match_score"] = round(neighborhood_match(n, user_priorities), 3)

        ranked = sorted(neighborhoods, key=lambda n: n["match_score"], reverse=True)
        return ranked

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Matching error: {str(e)}")