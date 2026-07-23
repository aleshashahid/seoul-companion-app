import os
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

load_dotenv() #read env file

app = FastAPI()

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