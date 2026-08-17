CREATE TABLE neighborhoods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    average_monthly_cost INTEGER NOT NULL,
    nightlife_score INTEGER NOT NULL,      -- 1-10 scale
    shopping_score INTEGER NOT NULL,       -- 1-10 scale
    safety_score INTEGER NOT NULL,         -- 1-10 scale
    transit_score INTEGER NOT NULL,        -- 1-10 scale
    study_environment_score INTEGER NOT NULL,  -- 1-10 scale
    tags TEXT[]
);