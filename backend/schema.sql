CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    budget INTEGER NOT NULL,
    major VARCHAR(100),
    duration_months INTEGER NOT NULL,
    preferences TEXT
);

CREATE TABLE programs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    university VARCHAR(150) NOT NULL,
    cost INTEGER NOT NULL,
    duration_months INTEGER NOT NULL,
    location VARCHAR(100),
    tags TEXT[]
);

CREATE TABLE housing_options (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    monthly_cost INTEGER NOT NULL,
    location VARCHAR(100),
    lifestyle_fit TEXT
);

CREATE TABLE scholarships (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    amount INTEGER NOT NULL,
    eligibility TEXT
);