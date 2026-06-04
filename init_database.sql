DROP TABLE IF EXISTS results_history CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;

CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    price FLOAT NOT NULL,
    range FLOAT NOT NULL,
    top_speed FLOAT NOT NULL,
    battery FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_price ON vehicles(price);
CREATE INDEX idx_range ON vehicles(range);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE results_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    weight_price FLOAT,
    weight_range FLOAT,
    weight_top_speed FLOAT,
    weight_battery FLOAT,
    consistency_ratio FLOAT,
    ranking_results JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
